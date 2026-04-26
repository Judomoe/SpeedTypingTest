import mongoose from 'mongoose'

let cached = (global as any).mongoose
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null }

export async function connectDB() {
  const URI = process.env.MONGODB_URI
  if (!URI) throw new Error('Please define MONGODB_URI in .env.local')
  if (cached.conn) return cached.conn
  if (!cached.promise) cached.promise = mongoose.connect(URI, { bufferCommands: false })
  cached.conn = await cached.promise
  return cached.conn
}
