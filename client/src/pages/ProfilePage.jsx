import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSession } from '../context/SettingsContext'

const API = 'https://speedtypingtest-production.up.railway.app/api'

function StatCard({ label, value, color = '#e8ff57', sub }) {
  return (
    <div style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 38, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function MiniChart({ data, color = '#e8ff57' }) {
  if (!data || data.length < 2) return null
  const W = 200, H = 48
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H}`).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [serverScores, setServerScores] = useState([])
  const [tab, setTab] = useState('history')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Local history
    try {
      const h = JSON.parse(localStorage.getItem('tc_history') || '[]')
      setHistory(h)
    } catch {}

    // Server scores
    const session = getSession()
    if (session) {
      fetch(`${API}/scores/me?limit=50`, { headers: { Authorization: `Bearer ${session.token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.scores) setServerScores(d.scores) })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const allScores = user ? serverScores : history
  const wpmHistory = allScores.map(s => s.wpm || s.wpm).filter(Boolean).slice(0, 30).reverse()
  const bestWpm    = allScores.length ? Math.max(...allScores.map(s => s.wpm)) : 0
  const avgWpm     = allScores.length ? Math.round(allScores.reduce((a, b) => a + b.wpm, 0) / allScores.length) : 0
  const avgAcc     = allScores.length ? Math.round(allScores.reduce((a, b) => a + (b.acc || b.accuracy || 0), 0) / allScores.length) : 0
  const totalTests = allScores.length

  function handleLogout() {
    logout()
    navigate('/')
  }

  function clearHistory() {
    if (!confirm('Clear all local history?')) return
    localStorage.removeItem('tc_history')
    setHistory([])
  }

  if (!user && history.length === 0 && !loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 24 }}>
        <div style={{ fontSize: 52 }}>👤</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>No profile yet</p>
          <p style={{ color: '#9090a8', fontFamily: 'DM Sans, sans-serif', marginBottom: 24 }}>Create an account to save your scores across devices.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" style={{ padding: '12px 24px', borderRadius: 10, background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textDecoration: 'none' }}>Sign up free</Link>
            <Link to="/login" style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9090a8', fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 860, margin: '0 auto', padding: '80px 24px 60px' }}>
      {/* Header */}
      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 32, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8ff57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 32, color: '#0c0c10' }}>
            {user ? user.username[0].toUpperCase() : '?'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {user ? user.username : 'Guest'}
            </h1>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>
              {user ? user.email : 'Local history only'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/settings" style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9090a8', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>Settings</Link>
          {user ? (
            <button onClick={handleLogout} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.06)', color: '#ff6b6b', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Sign out</button>
          ) : (
            <Link to="/login" style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Sign in</Link>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Best WPM"   value={bestWpm}  color="#e8ff57" />
        <StatCard label="Avg WPM"    value={avgWpm}   color="#57ffd8" />
        <StatCard label="Avg Acc"    value={`${avgAcc}%`} color="#c084fc" />
        <StatCard label="Tests"      value={totalTests} color="#f0f0f8" />
      </div>

      {/* WPM trend */}
      {wpmHistory.length >= 2 && (
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>WPM trend (last {wpmHistory.length} tests)</div>
          <MiniChart data={wpmHistory} color="#e8ff57" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 3, width: 'fit-content' }}>
        {['history', 'achievements'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: tab === t ? 'rgba(232,255,87,0.1)' : 'transparent', color: tab === t ? '#e8ff57' : '#55556a' }}>{t}</button>
        ))}
      </div>

      {tab === 'history' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.06)', borderTopColor: '#e8ff57', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : allScores.length === 0 ? (
            <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No tests yet</p>
              <p style={{ color: '#9090a8', fontFamily: 'DM Sans, sans-serif', marginBottom: 20 }}>Complete a typing test to see your history here.</p>
              <Link to="/typing" style={{ padding: '10px 24px', borderRadius: 10, background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textDecoration: 'none' }}>Start typing →</Link>
            </div>
          ) : (
            <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 70px 100px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <span>mode</span><span style={{ textAlign: 'right' }}>wpm</span><span style={{ textAlign: 'right' }}>raw</span><span style={{ textAlign: 'right' }}>acc</span><span style={{ textAlign: 'right' }}>dur</span><span style={{ textAlign: 'right' }}>date</span>
              </div>
              {allScores.slice(0, 50).map((s, i) => {
                const date = new Date(s.createdAt || s.timestamp)
                const dateStr = isNaN(date) ? '—' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 70px 100px', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{s.mode || 'words'}</span>
                    <span style={{ textAlign: 'right', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#e8ff57' }}>{s.wpm}</span>
                    <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{s.rawWpm || '—'}</span>
                    <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: (s.acc || s.accuracy) >= 95 ? '#57ffd8' : '#9090a8' }}>{s.acc || s.accuracy}%</span>
                    <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{s.dur || s.duration}s</span>
                    <span style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>{dateStr}</span>
                  </div>
                )
              })}
            </div>
          )}
          {!user && history.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={clearHistory} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.2)', background: 'transparent', color: '#ff6b6b', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, cursor: 'pointer' }}>Clear history</button>
            </div>
          )}
        </>
      )}

      {tab === 'achievements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { icon: '🚀', title: 'First Steps',   desc: 'Complete your first test',          done: totalTests >= 1 },
            { icon: '🔥', title: 'On Fire',        desc: 'Reach 60 WPM',                     done: bestWpm >= 60 },
            { icon: '⚡', title: 'Speed Demon',    desc: 'Reach 100 WPM',                    done: bestWpm >= 100 },
            { icon: '🎯', title: 'Sharp Shooter',  desc: '98%+ accuracy in a test',          done: allScores.some(s => (s.acc || s.accuracy) >= 98) },
            { icon: '🏋️', title: 'Dedicated',      desc: 'Complete 25 tests',                done: totalTests >= 25 },
            { icon: '💯', title: 'Century',        desc: 'Complete 100 tests',               done: totalTests >= 100 },
            { icon: '🧘', title: 'Zen Master',     desc: 'Complete a Zen mode session',      done: allScores.some(s => s.mode === 'zen') },
            { icon: '👑', title: 'Legend',         desc: 'Reach 120 WPM',                   done: bestWpm >= 120 },
          ].map(a => (
            <div key={a.title} style={{ background: '#131318', border: `1px solid ${a.done ? 'rgba(232,255,87,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 14, padding: 20, opacity: a.done ? 1 : 0.4 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: a.done ? '#e8ff57' : '#9090a8', marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#55556a' }}>{a.desc}</div>
              {a.done && <div style={{ marginTop: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#57ffd8' }}>✓ Unlocked</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
