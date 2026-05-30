import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const SERVER = 'http://localhost:4000'

const DIFF_C = { easy: '#57ffd8', medium: '#e8ff57', hard: '#ff6b6b' }

// ─── Racing view ──────────────────────────────────────────────────────────────
function RaceView({ room, socket, username, onLeave }) {
  const [typed, setTyped] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [phase, setPhase] = useState('lobby')
  const [raceText, setRaceText] = useState(room?.text || '')
  const inputRef = useRef(null)
  const typedRef = useRef('')
  const startTimeRef = useRef(null)
  // Use locked raceText during race; room.text for lobby preview
  const text = phase === 'racing' ? raceText : (room?.text || raceText)
  const players = room?.players || []
  const isHost = room?.host === username

  useEffect(() => {
    const onCountdown = (n) => { setCountdown(n); setPhase('countdown') }
    const onStarted = ({ text: startedText, startTime }) => {
      setRaceText(startedText)  // lock text — single source of truth
      setPhase('racing')
      setCountdown(null)
      startTimeRef.current = startTime
      setTyped('')
      typedRef.current = ''
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    const onFinished = () => setPhase('finished')

    socket.on('room:countdown', onCountdown)
    socket.on('room:started', onStarted)
    socket.on('room:finished', () => {
      setPhase('finished')
      setTimeout(() => setPhase('lobby'), 4000)
    })

    return () => {
      socket.off('room:countdown', onCountdown)
      socket.off('room:started', onStarted)
      socket.off('room:finished', onFinished)
    }
  }, [socket])

  function onInput(e) {
    if (phase !== 'racing') return
    const val = e.target.value
    if (val.length > text.length) return
    typedRef.current = val
    setTyped(val)

    const elapsed = Math.max(1, (Date.now() - startTimeRef.current) / 1000)
    let correct = 0
    for (let i = 0; i < val.length; i++) if (val[i] === text[i]) correct++
    const wpm = Math.round((correct / 5) / (elapsed / 60))
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100
    const progress = Math.round((val.length / text.length) * 100)

    socket.emit('room:progress', { code: room.code, progress, wpm, acc })
  }

  const me = players.find(p => p.username === username)
  const sorted = [...players].sort((a, b) => b.progress - a.progress)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Room header */}
      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e8ff57', marginRight: 12 }}>ROOM {room.code}</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>host: {room.host} · {room.mode} · {players.length}/{room.maxPlayers} players</span>
        </div>
        <button onClick={onLeave} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, cursor: 'pointer' }}>Leave</button>
      </div>

      {/* Countdown overlay */}
      {phase === 'countdown' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 120, color: '#e8ff57', lineHeight: 1, animation: 'glowPulse 0.8s ease-in-out infinite' }}>{countdown}</div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a', marginTop: 16 }}>Get ready…</p>
        </div>
      )}

      {/* Players progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((p, idx) => (
          <div key={p.id} style={{ background: '#131318', border: `1px solid ${p.username === username ? 'rgba(232,255,87,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a', width: 20 }}>#{idx + 1}</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.username === username ? '#e8ff57' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12, color: p.username === username ? '#0c0c10' : '#9090a8' }}>
                  {p.username[0].toUpperCase()}
                </div>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, color: p.username === username ? '#e8ff57' : '#f0f0f8' }}>
                  {p.username} {p.username === username && '(you)'}
                </span>
                {p.finished && <span style={{ fontSize: 12, color: '#57ffd8', fontFamily: 'JetBrains Mono, monospace' }}>✓ {p.finishTime ? `${(p.finishTime / 1000).toFixed(1)}s` : 'done'}</span>}
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#e8ff57' }}>{p.wpm}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#55556a' }}>wpm</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#9090a8' }}>{p.acc}%</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#55556a' }}>acc</div>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: p.finished ? '#57ffd8' : p.username === username ? '#e8ff57' : '#c084fc', borderRadius: 3, width: `${p.progress}%`, transition: 'width 0.2s' }} />
            </div>
            <div style={{ marginTop: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a' }}>{p.progress}%</div>
          </div>
        ))}
      </div>

      {/* Text input area */}
      {phase === 'racing' && (
        <div>
          <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px 32px', marginBottom: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 18, lineHeight: 1.9, userSelect: 'none', cursor: 'text' }}
            onClick={() => inputRef.current?.focus()}>
            {text.split('').map((ch, i) => {
              let color = '#55556a', bg = 'transparent'
              if (i < typed.length) {
                color = typed[i] === ch ? '#57ffd8' : '#ff6b6b'
                if (typed[i] !== ch) bg = 'rgba(255,107,107,0.08)'
              } else if (i === typed.length) color = '#f0f0f8'
              return (
                <span key={i} style={{ color, background: bg, borderRadius: 2, position: 'relative' }}>
                  {i === typed.length && <span style={{ position: 'absolute', left: 0, width: 2, height: '100%', background: '#e8ff57', animation: 'blink 1.1s step-end infinite' }} />}
                  {ch}
                </span>
              )
            })}
          </div>
          <input ref={inputRef} value={typed} onChange={onInput} autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            style={{ width: '100%', padding: '14px 18px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'JetBrains Mono, monospace', fontSize: 16, outline: 'none' }} />
        </div>
      )}

      {/* Lobby controls */}
      {phase === 'lobby' && (
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9090a8', marginBottom: 20, fontSize: 14 }}>
            {players.length < 2 ? 'Waiting for more players to join…' : 'Ready to race!'}
          </p>
          {isHost ? (
            <button onClick={() => socket.emit('room:start', { code: room.code })} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Start Race ⚡
            </button>
          ) : (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a', fontSize: 13 }}>Waiting for host to start…</p>
          )}
          <div style={{ marginTop: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>
            Share code: <span style={{ color: '#e8ff57', letterSpacing: 2 }}>{room.code}</span>
          </div>
        </div>
      )}

      {phase === 'finished' && (
        <div style={{ background: '#131318', border: '1px solid rgba(87,255,216,0.2)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏁</div>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#57ffd8' }}>Race finished!</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a', marginTop: 8 }}>Returning to lobby in a moment…</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Multiplayer page ────────────────────────────────────────────────────
export default function MultiplayerPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('browse')
  const [code, setCode] = useState('')
  const [roomName, setRoomName] = useState('My Race')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [roomMode, setRoomMode] = useState('words')
  const [connected, setConnected] = useState(false)
  const [publicRooms, setPublicRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [error, setError] = useState('')
  const socketRef = useRef(null)

  const username = user?.username || `Guest_${Math.random().toString(36).slice(2, 6)}`

  useEffect(() => {
    const socket = io(SERVER, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('room:list', setPublicRooms)
    socket.on('room:joined', (room) => { setCurrentRoom(room); setError('') })
    socket.on('room:update', setCurrentRoom)
    socket.on('room:error', (msg) => setError(msg))
    socket.on('room:create_auto', ({ username }) => {
      socket.emit('room:create', { username, mode: 'words', maxPlayers: 4, isPublic: true, name: 'Quick Match' })
    })

    return () => socket.disconnect()
  }, [])

  const joinRoom = useCallback((roomCode) => {
    setError('')
    socketRef.current?.emit('room:join', { username, code: roomCode })
  }, [username])

  const createRoom = useCallback(() => {
    setError('')
    socketRef.current?.emit('room:create', { username, mode: roomMode, maxPlayers: Number(maxPlayers), isPublic: true, name: roomName })
  }, [username, roomMode, maxPlayers, roomName])

  const quickMatch = useCallback(() => {
    setError('')
    socketRef.current?.emit('room:quickmatch', { username })
  }, [username])

  const leaveRoom = useCallback(() => {
    if (currentRoom) socketRef.current?.emit('room:leave', { code: currentRoom.code })
    setCurrentRoom(null)
  }, [currentRoom])

  const joinByCode = useCallback(() => {
    if (code.trim()) joinRoom(code.trim().toUpperCase())
  }, [code, joinRoom])

  if (currentRoom) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 860, margin: '0 auto', padding: '80px 24px 60px' }}>
        <RaceView room={currentRoom} socket={socketRef.current} username={username} onLeave={leaveRoom} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 860, margin: '0 auto', padding: '80px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>⚔️</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 10 }}>Versus Mode</h1>
        <p style={{ color: '#9090a8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>Race real opponents. May the fastest fingers win.</p>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#57ffd8' : '#ff6b6b', display: 'inline-block' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>
            {connected ? 'connected to server' : 'connecting…'}
          </span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#ff6b6b' }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, cursor: 'pointer' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#e8ff57', marginBottom: 8 }}>Quick Match</h3>
          <p style={{ color: '#9090a8', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>Jump in instantly with a random opponent. No waiting.</p>
          <button onClick={quickMatch} disabled={!connected} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: connected ? '#e8ff57' : '#2a2a35', color: connected ? '#0c0c10' : '#55556a', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, cursor: connected ? 'pointer' : 'not-allowed' }}>Find Match →</button>
        </div>
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔗</div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#57ffd8', marginBottom: 8 }}>Join with Code</h3>
          <p style={{ color: '#9090a8', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>Enter a room code from a friend.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && joinByCode()} placeholder="ABCD" maxLength={4}
              style={{ flex: 1, padding: '10px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, outline: 'none', letterSpacing: 4 }} />
            <button onClick={joinByCode} disabled={!connected || code.length < 4} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: connected && code.length >= 4 ? '#57ffd8' : '#2a2a35', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Join</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
          {['browse', 'create'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: tab === t ? 'rgba(232,255,87,0.1)' : 'transparent', color: tab === t ? '#e8ff57' : '#55556a' }}>{t}</button>
          ))}
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{publicRooms.length} public room{publicRooms.length !== 1 ? 's' : ''}</span>
      </div>

      {tab === 'browse' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {publicRooms.length === 0 ? (
            <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a', fontSize: 14 }}>No public rooms open. Create one or use Quick Match!</p>
            </div>
          ) : publicRooms.map(r => (
            <div key={r.code} style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {r.mode === 'code' ? '💻' : r.mode === 'quotes' ? '💬' : '📝'}
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{r.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>
                    by {r.host} · {r.mode} · <span style={{ color: '#e8ff57', letterSpacing: 2 }}>{r.code}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: r.maxPlayers }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < r.players ? '#57ffd8' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{r.players}/{r.maxPlayers}</span>
                <button onClick={() => joinRoom(r.code)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'rgba(232,255,87,0.1)', color: '#e8ff57', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Join</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 28 }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Create a Room</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8 }}>Room name</label>
              <input value={roomName} onChange={e => setRoomName(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8 }}>Max players</label>
              <select value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}>
                {[2,3,4,5,6,8].map(n => <option key={n} value={n}>{n} players</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8 }}>Mode</label>
              <select value={roomMode} onChange={e => setRoomMode(e.target.value)} style={{ width: '100%', padding: '11px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}>
                {['words','quotes','code'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <button onClick={createRoom} disabled={!connected} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: connected ? '#e8ff57' : '#2a2a35', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, cursor: connected ? 'pointer' : 'not-allowed' }}>Create Room</button>
        </div>
      )}
    </div>
  )
}