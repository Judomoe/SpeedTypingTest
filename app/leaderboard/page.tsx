'use client'
import { useEffect, useState } from 'react'
import { getLeaderboard, getSession, type LeaderboardEntry } from '@/lib/auth-client'

const FALLBACK_DATA: LeaderboardEntry[] = [
  { id: 'demo-1', username: 'velocityKeys', rank: 1, name: 'velocityKeys', wpm: 231, acc: 99.1, country: '🇯🇵', tests: 8241 },
  { id: 'demo-2', username: 'NightOwlType', rank: 2, name: 'NightOwlType', wpm: 218, acc: 98.7, country: '🇺🇸', tests: 5102 },
  { id: 'demo-3', username: 'fingercraft', rank: 3, name: 'fingercraft', wpm: 207, acc: 97.9, country: '🇰🇷', tests: 4388 },
  { id: 'demo-4', username: 'swiftboard', rank: 4, name: 'swiftboard', wpm: 195, acc: 98.2, country: '🇩🇪', tests: 3210 },
  { id: 'demo-5', username: 'TypeGod_EG', rank: 5, name: 'TypeGod_EG', wpm: 183, acc: 96.8, country: '🇪🇬', tests: 2987 },
  { id: 'demo-6', username: 'qwertymaster', rank: 6, name: 'qwertymaster', wpm: 178, acc: 97.1, country: '🇬🇧', tests: 4100 },
  { id: 'demo-7', username: 'mech_beast', rank: 7, name: 'mech_beast', wpm: 171, acc: 95.5, country: '🇸🇪', tests: 3020 },
  { id: 'demo-8', username: 'liquidkeys', rank: 8, name: 'liquidkeys', wpm: 168, acc: 96.3, country: '🇫🇷', tests: 2100 },
  { id: 'demo-9', username: 'precision99', rank: 9, name: 'precision99', wpm: 162, acc: 97.8, country: '🇨🇦', tests: 5500 },
  { id: 'demo-10', username: 'demoUser', rank: 10, name: 'demoUser', wpm: 94, acc: 97.0, country: '🇪🇬', tests: 31 },
]

const MEDAL = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('all time')
  const [mode, setMode] = useState('words')
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const session = getSession()

  useEffect(() => {
    let alive = true

    async function loadLeaders() {
      setLoading(true)
      const result = await getLeaderboard(period, mode)
      if (!alive) return
      if (result.success) {
        setLeaders(result.leaders)
        setError('')
      } else {
        setLeaders([])
        setError(result.error)
      }
      setLoading(false)
    }

    loadLeaders()
    return () => { alive = false }
  }, [period, mode])

  const data = leaders.length ? leaders : FALLBACK_DATA

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 860, margin: '0 auto', padding: '80px 24px 60px' }}>

      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 10 }}>Leaderboard</h1>
        <p style={{ color: '#9090a8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>
          {loading ? 'Loading live rankings…' : error ? 'Demo rankings shown until backend is connected.' : "The world's fastest. Where do you stand?"}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
        {['today', 'this week', 'all time'].map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '8px 20px', borderRadius: 8,
            border: `1px solid ${period === p ? '#e8ff57' : 'rgba(255,255,255,0.08)'}`,
            background: period === p ? 'rgba(232,255,87,0.08)' : 'transparent',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
            color: period === p ? '#e8ff57' : '#9090a8', cursor: 'pointer',
          }}>{p}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
        {['words', 'quotes', 'code'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 20px', borderRadius: 8,
            border: `1px solid ${mode === m ? '#57ffd8' : 'rgba(255,255,255,0.08)'}`,
            background: mode === m ? 'rgba(87,255,216,0.08)' : 'transparent',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
            color: mode === m ? '#57ffd8' : '#9090a8', cursor: 'pointer',
          }}>{m}</button>
        ))}
      </div>

      {error && (
        <div style={{ margin: '0 auto 28px', maxWidth: 560, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.06)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#ff6b6b', textAlign: 'center' }}>
          Backend sync issue: {error}
        </div>
      )}

      {/* Podium */}
      {data.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, marginBottom: 48 }}>
        {[data[1], data[0], data[2]].map((p, i) => {
          const heights = [110, 140, 90]
          const colors = ['#b0b0b8', '#e8ff57', '#cd7f32']
          const pos = [2, 1, 3]
          return (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 20 }}>{p.country}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#f0f0f8', fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 24, color: colors[i] }}>{p.wpm}</div>
              <div style={{
                width: 80, height: heights[i], borderRadius: '10px 10px 0 0',
                background: `${colors[i]}15`, border: `2px solid ${colors[i]}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 36, color: colors[i],
              }}>{pos[i]}</div>
            </div>
          )
        })}
      </div>
      )}

      {/* Table */}
      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '50px 1fr 80px 80px 80px',
          padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <span>#</span><span>player</span>
          <span style={{ textAlign: 'right' }}>wpm</span>
          <span style={{ textAlign: 'right' }}>acc</span>
          <span style={{ textAlign: 'right' }}>tests</span>
        </div>

        {data.map(p => {
          const isYou = Boolean(session && p.id === session.id)
          return (
          <div key={p.rank} style={{
            display: 'grid', gridTemplateColumns: '50px 1fr 80px 80px 80px',
            alignItems: 'center', padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            background: isYou ? 'rgba(232,255,87,0.04)' : 'transparent',
            borderLeft: isYou ? '3px solid #e8ff57' : '3px solid transparent',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16 }}>
              {p.rank <= 3 ? MEDAL[p.rank - 1] : <span style={{ color: '#55556a' }}>{p.rank}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: isYou ? '#e8ff57' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13,
                color: isYou ? '#0c0c10' : '#9090a8',
              }}>{p.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, color: isYou ? '#e8ff57' : '#f0f0f8' }}>
                  {p.name} {isYou && <span style={{ fontSize: 11, color: '#55556a' }}>(you)</span>}
                </div>
                <div style={{ fontSize: 13 }}>{p.country}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: p.rank <= 3 ? ['#e8ff57','#b0b0b8','#cd7f32'][p.rank-1] : '#f0f0f8' }}>{p.wpm}</div>
            <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{p.acc}%</div>
            <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{p.tests.toLocaleString()}</div>
          </div>
        )})}
      </div>
    </div>
  )
}
