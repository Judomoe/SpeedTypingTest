const express = require('express')
const Score = require('../models/Score')

const router = express.Router()

function sinceForPeriod(period) {
  const now = new Date()
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  if (period === 'this week') {
    const d = new Date(now)
    d.setDate(now.getDate() - 7)
    return d
  }
  return null
}

router.get('/', async (req, res) => {
  try {
    const period = String(req.query.period || 'all time')
    const mode = String(req.query.mode || 'words')
    const since = sinceForPeriod(period)

    const match = {}
    if (['words', 'quotes', 'code', 'zen', 'lesson'].includes(mode)) match.mode = mode
    if (since) match.createdAt = { $gte: since }

    const leaders = await Score.aggregate([
      { $match: match },
      { $sort: { wpm: -1, createdAt: 1 } },
      {
        $group: {
          _id: '$userId',
          wpm: { $first: '$wpm' },
          acc: { $first: '$accuracy' },
          mode: { $first: '$mode' },
          tests: { $sum: 1 },
        },
      },
      { $sort: { wpm: -1, acc: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          country: '$user.country',
          wpm: 1,
          acc: 1,
          tests: 1,
        },
      },
    ])

    return res.json({
      leaders: leaders.map((leader, index) => ({
        rank: index + 1,
        id: leader.userId.toString(),
        name: leader.username,
        username: leader.username,
        country: leader.country || '🌍',
        wpm: leader.wpm,
        acc: leader.acc,
        tests: leader.tests,
      })),
    })
  } catch {
    return res.status(500).json({ error: 'Could not load leaderboard' })
  }
})

module.exports = router
