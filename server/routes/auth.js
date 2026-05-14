const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const requireAuth = require('../middleware/auth')
const { serializeUser } = require('../utils/serialize')

const router = express.Router()

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: '7d' },
  )
}

router.post('/register', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) return res.status(409).json({ error: 'Username or email is already taken' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ username, email, password: hashed })
    const token = signToken(user)

    return res.status(201).json({ user: serializeUser(user), token })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Username or email is already taken' })
    return res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    user.stats.lastActive = new Date()
    await user.save()

    return res.json({ user: serializeUser(user), token: signToken(user) })
  } catch {
    return res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: serializeUser(req.user) })
})

module.exports = router
