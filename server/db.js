const mongoose = require('mongoose')

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

async function connectDB() {
  const URI = process.env.MONGODB_URI
  if (!URI) throw new Error('MONGODB_URI not defined')
  if (cached.conn) return cached.conn
  if (!cached.promise) cached.promise = mongoose.connect(URI, { bufferCommands: false })
  cached.conn = await cached.promise
  return cached.conn
}

module.exports = { connectDB }
