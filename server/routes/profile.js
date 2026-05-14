const express = require('express')
const requireAuth = require('../middleware/auth')
const Score = require('../models/Score')
const { serializeScore, serializeUser } = require('../utils/serialize')

const router = express.Router()

router.get('/me', requireAuth, async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(200)
    return res.json({
      user: serializeUser(req.user),
      scores: scores.map(serializeScore),
    })
  } catch {
    return res.status(500).json({ error: 'Could not load profile' })
  }
})

module.exports = router
