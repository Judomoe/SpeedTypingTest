const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: '🌍',
  },
  avatar: String,
  isPro: {
    type: Boolean,
    default: false,
  },
  stats: {
    totalTests: { type: Number, default: 0 },
    bestWpm: { type: Number, default: 0 },
    avgWpm: { type: Number, default: 0 },
    avgAcc: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
}, { timestamps: true })

module.exports = mongoose.models.User || mongoose.model('User', userSchema)
