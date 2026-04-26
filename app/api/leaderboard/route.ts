import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'

export async function GET() {
  try {
    await connectDB()
    const leaders = await User.find({ 'stats.totalTests': { $gt: 0 } })
      .select('username country stats.bestWpm stats.avgWpm stats.avgAcc stats.totalTests')
      .sort({ 'stats.bestWpm': -1 }).limit(100)
    return NextResponse.json({ leaders: leaders.map((u, i) => ({ rank: i+1, username: u.username, country: u.country, wpm: u.stats.bestWpm, avgWpm: u.stats.avgWpm, acc: u.stats.avgAcc, tests: u.stats.totalTests })) })
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
