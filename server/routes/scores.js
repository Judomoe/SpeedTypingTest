const express = require('express')
const requireAuth = require('../middleware/auth')
const Score = require('../models/Score')
const { serializeScore, serializeUser } = require('../utils/serialize')

const router = express.Router()

function numeric(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = req.body || {}
    const wpm = numeric(payload.wpm)
    const rawWpm = numeric(payload.rawWpm, wpm)
    const accuracy = numeric(payload.acc ?? payload.accuracy, 100)
    const duration = numeric(payload.dur ?? payload.duration)

    if (duration < 1) return res.status(400).json({ error: 'Duration is required' })

    const score = await Score.create({
      userId: req.user._id,
      wpm,
      rawWpm,
      accuracy,
      consistency: numeric(payload.consistency, 100),
      errorCount: numeric(payload.errors),
      correct: numeric(payload.correct),
      incorrect: numeric(payload.incorrect),
      extra: numeric(payload.extra),
      missed: numeric(payload.missed),
      duration,
      mode: payload.mode || 'words',
      language: payload.language || 'english',
      wpmData: Array.isArray(payload.wpmData) ? payload.wpmData.map(Number).filter(Number.isFinite) : [],
      rawData: Array.isArray(payload.rawData) ? payload.rawData.map(Number).filter(Number.isFinite) : [],
      errData: Array.isArray(payload.errData) ? payload.errData.map(Number).filter(Number.isFinite) : [],
    })

    const n = req.user.stats.totalTests + 1
    req.user.stats.totalTests = n
    req.user.stats.bestWpm = Math.max(req.user.stats.bestWpm || 0, wpm)
    req.user.stats.avgWpm = Math.round((((req.user.stats.avgWpm || 0) * (n - 1)) + wpm) / n)
    req.user.stats.avgAcc = Math.round((((req.user.stats.avgAcc || 0) * (n - 1)) + accuracy) / n)
    req.user.stats.lastActive = new Date()
    await req.user.save()

    return res.status(201).json({
      score: serializeScore(score),
      user: serializeUser(req.user),
    })
  } catch {
    return res.status(500).json({ error: 'Could not save score' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(200)
    return res.json({ scores: scores.map(serializeScore) })
  } catch {
    return res.status(500).json({ error: 'Could not load score history' })
  }
})

module.exports = router
