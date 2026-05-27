const router = require('express').Router()
const User = require('../models/User')
const Score = require('../models/Score')

router.get('/', async (req, res) => {
  try {
    const { mode = 'words', period = 'all' } = req.query

    let dateFilter = {}
    const now = new Date()
    if (period === 'today') {
      const start = new Date(now); start.setHours(0,0,0,0)
      dateFilter = { createdAt: { $gte: start } }
    } else if (period === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - 7)
      dateFilter = { createdAt: { $gte: start } }
    }

    // Aggregate best score per user for the given mode/period
    const pipeline = [
      { $match: { mode, ...dateFilter } },
      { $sort: { wpm: -1 } },
      { $group: { _id: '$userId', wpm: { $first: '$wpm' }, accuracy: { $first: '$accuracy' } } },
      { $sort: { wpm: -1 } },
      { $limit: 50 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, userId: '$_id', username: '$user.username', country: '$user.country', wpm: 1, accuracy: 1, totalTests: '$user.stats.totalTests' } },
    ]

    const rows = await Score.aggregate(pipeline)
    const leaders = rows.map((r, i) => ({
      rank: i + 1,
      username: r.username,
      country: r.country || '',
      wpm: r.wpm,
      acc: r.accuracy,
      tests: r.totalTests || 0,
    }))

    res.json({ leaders })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
