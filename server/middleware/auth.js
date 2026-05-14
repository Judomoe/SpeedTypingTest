const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Authentication required' })

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me')
    const user = await User.findById(payload.id).select('-password')
    if (!user) return res.status(401).json({ error: 'User not found' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

module.exports = requireAuth
