import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Score } from '@/lib/models/Score'
import { User } from '@/lib/models/User'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { userId, wpm, accuracy, errors, duration, mode } = await req.json()
    if (!userId || !wpm || !accuracy) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const score = await Score.create({ userId, wpm, accuracy, errors, duration, mode })
    const user = await User.findById(userId)
    if (user) {
      const n = ++user.stats.totalTests
      if (wpm > user.stats.bestWpm) user.stats.bestWpm = wpm
      user.stats.avgWpm = Math.round((user.stats.avgWpm * (n-1) + wpm) / n)
      user.stats.avgAcc = Math.round((user.stats.avgAcc * (n-1) + accuracy) / n)
      user.stats.lastActive = new Date()
      await user.save()
    }
    return NextResponse.json({ success: true, score }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const userId = new URL(req.url).searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const scores = await Score.find({ userId }).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json({ scores })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
