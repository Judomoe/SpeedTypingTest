const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  country:  { type: String, default: '' },
  isPro:    { type: Boolean, default: false },
  createdAt:{ type: Date, default: Date.now },
  settings: {
    font:       { type: String, default: 'JetBrains Mono' },
    fontSize:   { type: Number, default: 20 },
    caretStyle: { type: String, default: 'line' },
    showLiveWpm:{ type: Boolean, default: true },
    showKbd:    { type: Boolean, default: true },
    sound:      { type: Boolean, default: false },
    language:   { type: String, default: 'english' },
    theme:      { type: String, default: 'dark' },
  },
  stats: {
    totalTests: { type: Number, default: 0 },
    bestWpm:    { type: Number, default: 0 },
    avgWpm:     { type: Number, default: 0 },
    avgAcc:     { type: Number, default: 0 },
    streak:     { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
})

module.exports = mongoose.models.User || mongoose.model('User', UserSchema)
