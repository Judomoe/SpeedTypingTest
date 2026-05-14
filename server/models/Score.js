const mongoose = require('mongoose')

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  wpm: { type: Number, required: true, min: 0 },
  rawWpm: { type: Number, required: true, min: 0 },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
  consistency: { type: Number, default: 100, min: 0, max: 100 },
  errorCount: { type: Number, default: 0, min: 0 },
  correct: { type: Number, default: 0, min: 0 },
  incorrect: { type: Number, default: 0, min: 0 },
  extra: { type: Number, default: 0, min: 0 },
  missed: { type: Number, default: 0, min: 0 },
  duration: { type: Number, required: true, min: 1 },
  mode: {
    type: String,
    enum: ['words', 'quotes', 'code', 'zen', 'lesson'],
    default: 'words',
  },
  language: { type: String, default: 'english' },
  wpmData: { type: [Number], default: [] },
  rawData: { type: [Number], default: [] },
  errData: { type: [Number], default: [] },
}, { timestamps: true })

scoreSchema.index({ userId: 1, createdAt: -1 })
scoreSchema.index({ wpm: -1 })
scoreSchema.index({ mode: 1, createdAt: -1 })

module.exports = mongoose.models.Score || mongoose.model('Score', scoreSchema)
