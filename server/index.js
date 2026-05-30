require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const { connectDB } = require('./db')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET','POST'] }
})

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }))
app.use(express.json())

// Routes
app.use('/api/auth',        require('./routes/auth'))
app.use('/api/scores',      require('./routes/scores'))
app.use('/api/leaderboard', require('./routes/leaderboard'))

app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date() }))

// ─── Socket.IO Multiplayer ────────────────────────────────────────────────────
const RACE_TEXTS = [
  "the quick brown fox jumps over the lazy dog and then runs away into the misty forest",
  "programming is the art of telling another human what one wants the computer to do in the most elegant way",
  "practice does not make perfect only perfect practice makes perfect so slow down and think about accuracy first",
  "touch typing is the skill of typing without looking at the keyboard using muscle memory to find each key",
  "consistency beats intensity every time ten minutes of focused practice each day improves your typing far more",
  "every great developer got there by solving problems they were unqualified to solve until they actually did it",
  "the home row keys are your anchor always return your fingers to asdf and jkl after reaching for other keys",
]

function randText() { return RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)] }
function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = ''; for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}

// rooms: Map<roomCode, { code, host, players: Map<socketId, player>, text, started, mode, maxPlayers, isPublic, countdown }>
const rooms = new Map()

function sanitize(r) {
  return {
    code:       r.code,
    host:       r.host,
    mode:       r.mode,
    maxPlayers: r.maxPlayers,
    isPublic:   r.isPublic,
    started:    r.started,
    text:       r.text,
    players:    [...r.players.values()].map(p => ({
      id: p.id, username: p.username, progress: p.progress,
      wpm: p.wpm, acc: p.acc, finished: p.finished, finishTime: p.finishTime,
    })),
  }
}

function publicRooms() {
  return [...rooms.values()]
    .filter(r => r.isPublic && !r.started && r.players.size < r.maxPlayers)
    .map(r => ({
      code: r.code, name: r.name, mode: r.mode, maxPlayers: r.maxPlayers,
      players: r.players.size, host: r.host,
    }))
}

io.on('connection', socket => {
  console.log('[ws] connected', socket.id)

  // Send public room list on connect
  socket.emit('room:list', publicRooms())

  socket.on('room:create', ({ username, mode = 'words', maxPlayers = 4, isPublic = true, name = 'Race Room' }) => {
    const code = genCode()
    const room = {
      code, name, host: username, mode, maxPlayers: Math.min(maxPlayers, 8),
      isPublic, started: false, text: randText(), countdown: null,
      players: new Map(),
    }
    room.players.set(socket.id, { id: socket.id, username, progress: 0, wpm: 0, acc: 100, finished: false, finishTime: null })
    rooms.set(code, room)
    socket.join(code)
    socket.emit('room:joined', sanitize(room))
    io.emit('room:list', publicRooms())
    console.log('[room:create]', code, username)
  })

  socket.on('room:join', ({ username, code }) => {
    const room = rooms.get(code)
    if (!room) return socket.emit('room:error', 'Room not found')
    if (room.started) return socket.emit('room:error', 'Race already in progress')
    if (room.players.size >= room.maxPlayers) return socket.emit('room:error', 'Room is full')

    room.players.set(socket.id, { id: socket.id, username, progress: 0, wpm: 0, acc: 100, finished: false, finishTime: null })
    socket.join(code)
    socket.emit('room:joined', sanitize(room))
    io.to(code).emit('room:update', sanitize(room))
    io.emit('room:list', publicRooms())
  })

  // Quick match – join any available public room or create one
  socket.on('room:quickmatch', ({ username }) => {
    const available = [...rooms.values()].find(r => r.isPublic && !r.started && r.players.size < r.maxPlayers)
    if (available) {
      available.players.set(socket.id, { id: socket.id, username, progress: 0, wpm: 0, acc: 100, finished: false, finishTime: null })
      socket.join(available.code)
      socket.emit('room:joined', sanitize(available))
      io.to(available.code).emit('room:update', sanitize(available))
      io.emit('room:list', publicRooms())
    } else {
      // Create a new public room
      socket.emit('room:create_auto', { username })
    }
  })

  socket.on('room:start', ({ code }) => {
    const room = rooms.get(code)
    if (!room) return
    const player = room.players.get(socket.id)
    if (!player || player.username !== room.host) return socket.emit('room:error', 'Only the host can start')
    if (room.players.size < 1) return socket.emit('room:error', 'Need at least 1 player')

    // text is already set when room was created — don't pick a new one here
    let count = 3
    io.to(code).emit('room:countdown', count)
    room.countdown = setInterval(() => {
      count--
      if (count > 0) {
        io.to(code).emit('room:countdown', count)
      } else {
        clearInterval(room.countdown)
        room.started = true
        room.startTime = Date.now()
        io.to(code).emit('room:started', { text: room.text, startTime: room.startTime })
        io.emit('room:list', publicRooms())
      }
    }, 1000)
  })

  socket.on('room:progress', ({ code, progress, wpm, acc }) => {
    const room = rooms.get(code)
    if (!room || !room.started) return
    const player = room.players.get(socket.id)
    if (!player) return
    player.progress = progress
    player.wpm = wpm || 0
    player.acc = acc || 100
    if (progress >= 100 && !player.finished) {
      player.finished = true
      player.finishTime = Date.now() - (room.startTime || Date.now())
    }
    io.to(code).emit('room:update', sanitize(room))

    // End race if all finished
    if ([...room.players.values()].every(p => p.finished)) {
      setTimeout(() => {
        room.started = false
        // reset for next race
        for (const p of room.players.values()) {
          p.progress = 0; p.finished = false; p.finishTime = null; p.wpm = 0
        }
        io.to(code).emit('room:finished', sanitize(room))
        io.emit('room:list', publicRooms())
      }, 3000)
    }
  })

  socket.on('room:leave', ({ code }) => leaveRoom(socket, code))

  socket.on('disconnect', () => {
    // Remove player from all rooms they were in
    for (const [code, room] of rooms) {
      if (room.players.has(socket.id)) leaveRoom(socket, code)
    }
  })

  function leaveRoom(socket, code) {
    const room = rooms.get(code)
    if (!room) return
    const player = room.players.get(socket.id)
    room.players.delete(socket.id)
    socket.leave(code)

    if (room.players.size === 0) {
      if (room.countdown) clearInterval(room.countdown)
      rooms.delete(code)
    } else {
      // Transfer host if needed
      if (player && player.username === room.host) {
        room.host = [...room.players.values()][0].username
      }
      io.to(code).emit('room:update', sanitize(room))
    }
    io.emit('room:list', publicRooms())
  }
})

const PORT = process.env.PORT || 4000
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`TypeCraft server running on :${PORT}`))
  })
  .catch(err => {
    console.error('DB connection failed:', err.message)
    process.exit(1)
  })