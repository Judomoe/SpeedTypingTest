'use client'
import { useState } from 'react'

const DATA = [
  { rank: 1, name: 'velocityKeys', wpm: 231, acc: 99.1, country: '🇯🇵', tests: 8241 },
  { rank: 2, name: 'NightOwlType', wpm: 218, acc: 98.7, country: '🇺🇸', tests: 5102 },
  { rank: 3, name: 'fingercraft', wpm: 207, acc: 97.9, country: '🇰🇷', tests: 4388 },
  { rank: 4, name: 'swiftboard', wpm: 195, acc: 98.2, country: '🇩🇪', tests: 3210 },
  { rank: 5, name: 'TypeGod_EG', wpm: 183, acc: 96.8, country: '🇪🇬', tests: 2987 },
  { rank: 6, name: 'qwertymaster', wpm: 178, acc: 97.1, country: '🇬🇧', tests: 4100 },
  { rank: 7, name: 'mech_beast', wpm: 171, acc: 95.5, country: '🇸🇪', tests: 3020 },
  { rank: 8, name: 'liquidkeys', wpm: 168, acc: 96.3, country: '🇫🇷', tests: 2100 },
  { rank: 9, name: 'precision99', wpm: 162, acc: 97.8, country: '🇨🇦', tests: 5500 },
  { rank: 10, name: 'Moustafa Ahmed', wpm: 94, acc: 97.0, country: '🇪🇬', tests: 31, isYou: true },
]

const MEDAL = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('all time')
  const [mode, setMode] = useState('words')

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 860, margin: '0 auto', padding: '80px 24px 60px' }}>

      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 10 }}>Leaderboard</h1>
        <p style={{ color: '#9090a8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>The world's fastest. Where do you stand?</p>
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

      {/* Podium */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, marginBottom: 48 }}>
        {[DATA[1], DATA[0], DATA[2]].map((p, i) => {
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

        {DATA.map(p => (
          <div key={p.rank} style={{
            display: 'grid', gridTemplateColumns: '50px 1fr 80px 80px 80px',
            alignItems: 'center', padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            background: p.isYou ? 'rgba(232,255,87,0.04)' : 'transparent',
            borderLeft: p.isYou ? '3px solid #e8ff57' : '3px solid transparent',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16 }}>
              {p.rank <= 3 ? MEDAL[p.rank - 1] : <span style={{ color: '#55556a' }}>{p.rank}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: p.isYou ? '#e8ff57' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13,
                color: p.isYou ? '#0c0c10' : '#9090a8',
              }}>{p.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, color: p.isYou ? '#e8ff57' : '#f0f0f8' }}>
                  {p.name} {p.isYou && <span style={{ fontSize: 11, color: '#55556a' }}>(you)</span>}
                </div>
                <div style={{ fontSize: 13 }}>{p.country}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: p.rank <= 3 ? ['#e8ff57','#b0b0b8','#cd7f32'][p.rank-1] : '#f0f0f8' }}>{p.wpm}</div>
            <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{p.acc}%</div>
            <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{p.tests.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
