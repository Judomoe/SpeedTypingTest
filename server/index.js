require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' })

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

const authRoutes = require('./routes/auth')
const scoreRoutes = require('./routes/scores')
const profileRoutes = require('./routes/profile')
const leaderboardRoutes = require('./routes/leaderboard')

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'typecraft-api' })
})
app.use('/api/auth', authRoutes)
app.use('/api/scores', scoreRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/leaderboard', leaderboardRoutes)

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`TypeCraft API running on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start API:', error.message)
    process.exit(1)
  })
