const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

function signToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' })
    if (username.length < 3)
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' })

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] })
    if (existing) return res.status(409).json({ error: 'Username or email already taken' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ username, email: email.toLowerCase(), password: hashed })
    const token = signToken(user)
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, settings: user.settings, stats: user.stats }
    })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid email or password' })
    const token = signToken(user)
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, settings: user.settings, stats: user.stats }
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// Update settings
router.put('/settings', auth, async (req, res) => {
  try {
    const allowed = ['font','fontSize','caretStyle','showLiveWpm','showKbd','sound','language','theme']
    const update = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[`settings.${key}`] = req.body[key]
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true }).select('-password')
    res.json({ settings: user.settings })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
