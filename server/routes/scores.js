const router = require('express').Router()
const auth = require('../middleware/auth')
const Score = require('../models/Score')
const User = require('../models/User')

// Save a test result
router.post('/', auth, async (req, res) => {
  try {
    const { wpm, rawWpm, accuracy, errors, correct, incorrect, missed, consistency, duration, mode, language, wpmData, rawData, errData } = req.body
    if (wpm === undefined || accuracy === undefined) return res.status(400).json({ error: 'Missing fields' })

    const score = await Score.create({
      userId: req.user.id, wpm, rawWpm, accuracy, errors, correct, incorrect, missed,
      consistency, duration, mode: mode || 'words', language: language || 'english',
      wpmData, rawData, errData,
    })

    // Update user stats
    const user = await User.findById(req.user.id)
    if (user) {
      const n = user.stats.totalTests + 1
      user.stats.totalTests = n
      if (wpm > user.stats.bestWpm) user.stats.bestWpm = wpm
      user.stats.avgWpm = Math.round((user.stats.avgWpm * (n - 1) + wpm) / n)
      user.stats.avgAcc = Math.round((user.stats.avgAcc * (n - 1) + accuracy) / n)
      user.stats.lastActive = new Date()
      await user.save()
    }

    res.status(201).json({ success: true, score })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get scores for current user
router.get('/me', auth, async (req, res) => {
  try {
    const { limit = 100, mode } = req.query
    const filter = { userId: req.user.id }
    if (mode) filter.mode = mode
    const scores = await Score.find(filter).sort({ createdAt: -1 }).limit(Number(limit))
    res.json({ scores })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
