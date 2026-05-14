'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSession, getTestHistory, type AuthUser, type TestResult } from '@/lib/auth-client'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return `Today, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString()
}

function getPracticeGoal(history: TestResult[], avgWpm: number, avgAcc: number) {
  const latest = history[0]
  const recent = history.slice(0, 5)
  const recentAvg = recent.length
    ? Math.round(recent.reduce((sum, test) => sum + test.wpm, 0) / recent.length)
    : avgWpm
  const recentErrors = recent.reduce((sum, test) => sum + test.errors, 0)
  const targetWpm = Math.max(avgWpm + 5, recentAvg + 3, 35)

  if (avgAcc < 90 || recentErrors >= 20) {
    return {
      title: 'Accuracy reset',
      focus: 'Run two 30s quote tests and slow down until accuracy stays above 95%.',
      target: `${Math.max(avgAcc + 5, 95)}% accuracy`,
      mode: 'quotes',
      duration: 30,
    }
  }

  if (latest?.mode !== 'code' && avgWpm >= 45) {
    return {
      title: 'Code control',
      focus: 'Add one code test to practice punctuation, casing, and rhythm under pressure.',
      target: `${Math.max(25, avgWpm - 15)} WPM in code`,
      mode: 'code',
      duration: 60,
    }
  }

  return {
    title: 'Speed build',
    focus: 'Repeat 60s word tests and aim for a small personal best without sacrificing accuracy.',
    target: `${targetWpm} WPM`,
    mode: 'words',
    duration: 60,
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [tab, setTab] = useState('stats')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [history, setHistory] = useState<TestResult[]>([])

  useEffect(() => {
    const u = getSession()
    if (!u) { router.push('/login'); return }
    setUser(u)
    setHistory(getTestHistory())
  }, [router])

  if (!user) return null

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalTests = history.length
  const bestWpm = totalTests ? Math.max(...history.map(h => h.wpm)) : 0
  const avgWpm = totalTests ? Math.round(history.reduce((a, h) => a + h.wpm, 0) / totalTests) : 0
  const avgAcc = totalTests ? Math.round(history.reduce((a, h) => a + h.acc, 0) / totalTests) : 0

  // Personal bests per duration
  const pbMap: Record<number, number> = {}
  for (const h of history) {
    if (!pbMap[h.dur] || h.wpm > pbMap[h.dur]) pbMap[h.dur] = h.wpm
  }

  // WPM for last 7 days
  const last7: number[] = Array(7).fill(0)
  const last7Count: number[] = Array(7).fill(0)
  const now = new Date()
  for (const h of history) {
    const diff = Math.floor((now.getTime() - new Date(h.timestamp).getTime()) / 86400000)
    if (diff < 7) {
      last7[6 - diff] += h.wpm
      last7Count[6 - diff]++
    }
  }
  const wpmWeek = last7.map((sum, i) => last7Count[i] ? Math.round(sum / last7Count[i]) : 0)
  const maxWeekWpm = Math.max(...wpmWeek, 10)

  const dayLabels = Array(7).fill(0).map((_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return DAYS[d.getDay()]
  })

  // Mode breakdown
  const modeCount: Record<string, number> = {}
  for (const h of history) modeCount[h.mode] = (modeCount[h.mode] || 0) + 1

  // Member since
  const joined = new Date(user.createdAt)
  const joinedStr = joined.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  const practiceGoal = getPracticeGoal(history, avgWpm, avgAcc)

  return (
    <div style={{ minHeight: '100vh', maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px' }}>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 28 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: 'linear-gradient(135deg, #e8ff57, #57ffd8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 28, color: '#0c0c10', flexShrink: 0,
        }}>
          {user.username[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em', marginBottom: 4 }}>{user.username}</h1>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>
            {user.email} · Member since {joinedStr}
          </div>
          {totalTests > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {bestWpm >= 100 && <span style={badge}><span>⚡</span> 100+ WPM</span>}
              {totalTests >= 10 && <span style={badge}><span>🎯</span> {totalTests} tests</span>}
              {avgAcc >= 95 && <span style={badge}><span>🔬</span> {avgAcc}% avg acc</span>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 28, flexShrink: 0 }}>
          {[
            [bestWpm || '—', 'best wpm'],
            [`${avgAcc || '—'}%`, 'avg acc'],
            [totalTests, 'tests'],
          ].map(([v, l]) => (
            <div key={String(l)} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 26, color: '#e8ff57', letterSpacing: '-0.02em' }}>{v}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {['stats', 'history', 'achievements'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
            background: tab === t ? 'rgba(232,255,87,0.1)' : 'transparent',
            color: tab === t ? '#e8ff57' : '#55556a',
          }}>{t}</button>
        ))}
      </div>

      {/* ── Stats ── */}
      {tab === 'stats' && (
        <div>
          {totalTests === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⌨️</div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: '#9090a8', marginBottom: 24 }}>No tests yet. Start typing to see your stats!</p>
              <Link href="/typing" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 10, background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textDecoration: 'none' }}>Start typing →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Practice focus */}
              <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(232,255,87,0.08), rgba(87,255,216,0.05))', border: '1px solid rgba(232,255,87,0.14)', borderRadius: 14, padding: 24, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e8ff57', marginBottom: 8 }}>recommended practice</div>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>{practiceGoal.title}</h2>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#9090a8', lineHeight: 1.6 }}>{practiceGoal.focus}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(72px, 1fr))', gap: 10, minWidth: 260 }}>
                  {[
                    [practiceGoal.target, 'target'],
                    [practiceGoal.mode, 'mode'],
                    [`${practiceGoal.duration}s`, 'time'],
                  ].map(([value, label]) => (
                    <div key={label} style={{ background: 'rgba(12,12,16,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: '#e8ff57', marginBottom: 3 }}>{value}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#55556a' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly chart */}
              <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8', marginBottom: 20 }}>avg wpm — last 7 days</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, marginBottom: 8 }}>
                  {wpmWeek.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                      <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: i === 6 ? '#e8ff57' : 'rgba(87,255,216,0.3)', height: `${v ? (v / maxWeekWpm) * 100 : 2}%`, minHeight: v ? 4 : 2 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-around' }}>
                  {dayLabels.map((d, i) => <span key={i} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#55556a' }}>{d}</span>)}
                </div>
              </div>

              {/* Accuracy donut */}
              <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#57ffd8" strokeWidth="10"
                    strokeDasharray={`${avgAcc * 2.388} ${100 * 2.388}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <text x="50" y="56" textAnchor="middle" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="18" fill="#57ffd8">{avgAcc}%</text>
                </svg>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginTop: 12 }}>avg accuracy</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a', marginTop: 4 }}>over {totalTests} test{totalTests !== 1 ? 's' : ''}</div>
              </div>

              {/* Personal bests */}
              <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8', marginBottom: 16 }}>personal bests</div>
                {Object.entries(pbMap).length === 0 ? (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#55556a' }}>Complete tests at different durations to see bests.</p>
                ) : (
                  Object.entries(pbMap).sort((a, b) => Number(a[0]) - Number(b[0])).map(([dur, v]) => (
                    <div key={dur} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a', width: 32 }}>{dur}s</span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#e8ff57', width: `${Math.min(100, v)}%`, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, color: '#e8ff57', width: 40, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Mode breakdown */}
              <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8', marginBottom: 16 }}>mode breakdown</div>
                {totalTests === 0 ? (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#55556a' }}>No data yet.</p>
                ) : (
                  Object.entries(modeCount).map(([m, n], i) => {
                    const colors = ['#e8ff57', '#57ffd8', '#c084fc', '#ff6b6b']
                    const c = colors[i % colors.length]
                    return (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', width: 50 }}>{m}</span>
                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                          <div style={{ height: '100%', background: c, width: `${(n / totalTests) * 100}%`, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a', width: 24, textAlign: 'right' }}>{n}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── History ── */}
      {tab === 'history' && (
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 70px 60px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span>date</span>
            <span style={{ textAlign: 'right' }}>wpm</span>
            <span style={{ textAlign: 'right' }}>raw</span>
            <span style={{ textAlign: 'right' }}>acc</span>
            <span style={{ textAlign: 'right' }}>mode</span>
            <span style={{ textAlign: 'right' }}>dur</span>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', color: '#55556a' }}>
              No test history yet. <Link href="/typing" style={{ color: '#e8ff57', textDecoration: 'none' }}>Take a test →</Link>
            </div>
          ) : history.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 70px 60px', alignItems: 'center', padding: '13px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{formatDate(h.timestamp)}</span>
              <span style={{ textAlign: 'right', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#e8ff57' }}>{h.wpm}</span>
              <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{h.rawWpm}</span>
              <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{h.acc}%</span>
              <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{h.mode}</span>
              <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{h.dur}s</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Achievements ── */}
      {tab === 'achievements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '⚡', title: 'Speed Demon', desc: 'Reach 100 WPM', done: bestWpm >= 100 },
            { icon: '🎯', title: 'Sharpshooter', desc: '98%+ accuracy', done: history.some(h => h.acc >= 98) },
            { icon: '🏃', title: 'First Steps', desc: 'Complete 1 test', done: totalTests >= 1 },
            { icon: '🔥', title: 'Regular', desc: 'Complete 10 tests', done: totalTests >= 10 },
            { icon: '💯', title: 'Century', desc: 'Complete 100 tests', done: totalTests >= 100 },
            { icon: '⚔️', title: 'Consistent', desc: '90%+ avg accuracy', done: avgAcc >= 90 },
            { icon: '🏆', title: 'Top Speed', desc: 'Reach 120 WPM', done: bestWpm >= 120 },
            { icon: '📚', title: 'Learner', desc: 'Use 3+ test modes', done: Object.keys(modeCount).length >= 3 },
          ].map(a => (
            <div key={a.title} style={{
              background: '#131318', border: `1px solid ${a.done ? 'rgba(87,255,216,0.15)' : 'rgba(255,255,255,0.05)'}`,
              borderRadius: 12, padding: 20, opacity: a.done ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: a.done ? '#57ffd8' : '#9090a8', marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#55556a' }}>{a.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const badge: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '4px 10px',
  borderRadius: 6, border: '1px solid rgba(232,255,87,0.2)',
  background: 'rgba(232,255,87,0.06)', color: '#e8ff57',
  display: 'inline-flex', alignItems: 'center', gap: 4,
}
