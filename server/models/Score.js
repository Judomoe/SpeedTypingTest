const mongoose = require('mongoose')

const ScoreSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wpm:       { type: Number, required: true },
  rawWpm:    { type: Number, default: 0 },
  accuracy:  { type: Number, required: true },
  errors:    { type: Number, default: 0 },
  correct:   { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  missed:    { type: Number, default: 0 },
  consistency:{ type: Number, default: 0 },
  duration:  { type: Number, required: true },
  mode:      { type: String, default: 'words' },
  language:  { type: String, default: 'english' },
  wpmData:   [Number],
  rawData:   [Number],
  errData:   [Number],
  createdAt: { type: Date, default: Date.now },
})

ScoreSchema.index({ userId: 1, createdAt: -1 })
ScoreSchema.index({ wpm: -1 })

module.exports = mongoose.models.Score || mongoose.model('Score', ScoreSchema)
