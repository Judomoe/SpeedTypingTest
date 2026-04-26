import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { action, username, email, password } = await req.json()
    if (action === 'register') {
      if (!username || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
      const existing = await User.findOne({ $or: [{ email }, { username }] })
      if (existing) return NextResponse.json({ error: 'Username or email taken' }, { status: 409 })
      const hashed = await bcrypt.hash(password, 12)
      const user = await User.create({ username, email, password: hashed })
      return NextResponse.json({ success: true, user: { id: user._id, username: user.username } }, { status: 201 })
    }
    if (action === 'login') {
      const user = await User.findOne({ email })
      if (!user || !await bcrypt.compare(password, user.password)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      return NextResponse.json({ success: true, user: { id: user._id, username: user.username } })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
