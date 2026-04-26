'use client'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth-client'

interface Result {
  wpm: number; rawWpm: number; acc: number; consistency: number
  errors: number; correct: number; incorrect: number; extra: number; missed: number
  dur: number; mode: string
  wpmData: number[]; rawData: number[]; errData: number[]
}

// ── SVG Chart ────────────────────────────────────────────────────────────────
function WpmChart({ wpmData, rawData, errData }: { wpmData: number[]; rawData: number[]; errData: number[] }) {
  const W = 640; const H = 200
  const padL = 42; const padR = 36; const padT = 12; const padB = 28
  const cW = W - padL - padR; const cH = H - padT - padB

  if (!wpmData.length) return null

  const maxWpm = Math.max(...wpmData, ...rawData, 10)
  const roundedMax = Math.ceil(maxWpm / 10) * 10 + 10
  const maxErr = Math.max(...errData, 4)
  const n = wpmData.length

  const toX = (i: number) => padL + (n <= 1 ? cW / 2 : (i / (n - 1)) * cW)
  const toY = (v: number) => padT + cH - Math.min(1, Math.max(0, v / roundedMax)) * cH
  const toYE = (v: number) => padT + cH - Math.min(1, Math.max(0, v / maxErr)) * cH

  // Smooth bezier path
  const smoothPath = (pts: [number, number][]): string => {
    if (pts.length < 2) return `M${pts[0]?.[0] ?? 0},${pts[0]?.[1] ?? 0}`
    let d = `M${pts[0][0]},${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i]
      const mx = (x0 + x1) / 2
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`
    }
    return d
  }

  const wpmPts: [number, number][] = wpmData.map((v, i) => [toX(i), toY(v)])
  const rawPts: [number, number][] = rawData.map((v, i) => [toX(i), toY(v)])
  const avgWpm = wpmData.reduce((a, b) => a + b, 0) / wpmData.length
  const avgY = toY(avgWpm)

  // Y-axis labels (left)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: padT + p * cH, val: Math.round(roundedMax * (1 - p)),
  }))

  // X-axis labels
  const step = n <= 15 ? 1 : n <= 30 ? 2 : n <= 60 ? 5 : 10
  const xTicks = wpmData.map((_, i) => i).filter(i => i % step === 0 || i === n - 1)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
      {/* Grid */}
      {yTicks.map(({ y, val }) => (
        <g key={val}>
          <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <text x={padL - 6} y={y + 4} textAnchor="end" fill="#55556a" fontSize="10" fontFamily="JetBrains Mono, monospace">{val}</text>
        </g>
      ))}

      {/* X labels */}
      {xTicks.map(i => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fill="#55556a" fontSize="10" fontFamily="JetBrains Mono, monospace">{i + 1}</text>
      ))}

      {/* Right Y-axis (errors) */}
      {[0, 1, 2, 3, 4].filter(n => n <= maxErr).map(n => (
        <text key={n} x={W - padR + 6} y={toYE(n) + 4} textAnchor="start" fill="#55556a" fontSize="9" fontFamily="JetBrains Mono, monospace">{n}</text>
      ))}

      {/* Left Y label */}
      <text x={8} y={padT + cH / 2} textAnchor="middle" fill="#55556a" fontSize="9" fontFamily="JetBrains Mono, monospace" transform={`rotate(-90, 8, ${padT + cH / 2})`}>Words per Minute</text>
      {/* Right Y label */}
      <text x={W - 6} y={padT + cH / 2} textAnchor="middle" fill="#55556a" fontSize="9" fontFamily="JetBrains Mono, monospace" transform={`rotate(90, ${W - 6}, ${padT + cH / 2})`}>Errors</text>

      {/* Average WPM dashed line */}
      <line x1={padL} y1={avgY} x2={W - padR} y2={avgY} stroke="#e8ff57" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.55" />

      {/* Raw WPM line */}
      <path d={smoothPath(rawPts)} fill="none" stroke="#9090a8" strokeWidth="2" opacity="0.45" />

      {/* WPM line */}
      <path d={smoothPath(wpmPts)} fill="none" stroke="#e8ff57" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* WPM dots */}
      {wpmPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#e8ff57" stroke="#0c0c10" strokeWidth="1" />
      ))}

      {/* Error markers (show where new errors appeared) */}
      {errData.map((err, i) => {
        const prev = i > 0 ? errData[i - 1] : 0
        if (err <= prev) return null
        return (
          <text key={i} x={toX(i)} y={toYE(err) - 4} textAnchor="middle" fill="#ff6b6b" fontSize="11" fontFamily="sans-serif">✕</text>
        )
      })}
    </svg>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
function ResultsInner() {
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)
  const [user, setUser] = useState(getSession())

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('tc_result')
      if (raw) setResult(JSON.parse(raw))
    } catch { /* ignore */ }
    setUser(getSession())
  }, [])

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a', fontSize: 16 }}>No result to display.</p>
        <Link href="/typing" style={{ padding: '12px 28px', borderRadius: 10, background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, textDecoration: 'none' }}>Start a test →</Link>
      </div>
    )
  }

  const { wpm, rawWpm, acc, consistency, correct, incorrect, extra, missed, dur, mode, wpmData, rawData, errData } = result

  const modeLabel = `time ${dur}`
  const langLabel = mode === 'code' ? 'code' : mode === 'quotes' ? 'english' : 'english'

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 24px 60px' }}>
      <div style={{ width: '100%', maxWidth: 760 }}>

        {/* ── Top row: WPM + ACC + Chart ── */}
        <div style={{
          background: '#131318', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '28px 32px', marginBottom: 12,
          display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center',
        }}>
          {/* Left: WPM + ACC */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 100 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a', marginBottom: 4 }}>wpm</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 72, color: '#e8ff57', lineHeight: 1, letterSpacing: '-0.04em' }}>{wpm}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a', marginBottom: 4 }}>acc</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 72, color: '#e8ff57', lineHeight: 1, letterSpacing: '-0.04em' }}>{acc}%</div>
            </div>
          </div>

          {/* Right: Chart */}
          <div>
            <WpmChart wpmData={wpmData} rawData={rawData} errData={errData} />
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          background: '#131318', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '20px 32px', marginBottom: 12,
          display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr', gap: 0,
          alignItems: 'start',
        }}>
          {/* Test type */}
          <div style={{ paddingRight: 32, borderRight: '1px solid rgba(255,255,255,0.06)', marginRight: 32 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginBottom: 8 }}>test type</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#e8ff57', lineHeight: 1.8 }}>
              {modeLabel}<br />{langLabel}
            </div>
          </div>

          {/* Raw */}
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginBottom: 4 }}>raw</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 36, color: '#e8ff57', letterSpacing: '-0.02em' }}>{rawWpm}</div>
          </div>

          {/* Characters */}
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginBottom: 4 }}>characters</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 36, color: '#e8ff57', letterSpacing: '-0.02em' }}>
              {correct}/{incorrect}/{extra}/{missed}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#55556a', marginTop: 2 }}>correct/incorrect/extra/missed</div>
          </div>

          {/* Consistency */}
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginBottom: 4 }}>consistency</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 36, color: '#e8ff57', letterSpacing: '-0.02em' }}>{consistency}%</div>
          </div>

          {/* Time */}
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginBottom: 4 }}>time</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 36, color: '#e8ff57', letterSpacing: '-0.02em' }}>{dur}s</div>
          </div>
        </div>

        {/* ── Actions row ── */}
        <div style={{
          background: '#131318', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '16px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Icon actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { icon: '›', label: 'next test', href: '/typing' },
              { icon: '↺', label: 'same test', action: () => router.push('/typing') },
            ].map(item => (
              item.href ? (
                <Link key={item.label} href={item.href} title={item.label} style={{
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: '#9090a8',
                  textDecoration: 'none', transition: 'border-color 0.15s',
                }}>{item.icon}</Link>
              ) : (
                <button key={item.label} onClick={item.action} title={item.label} style={{
                  width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: '#9090a8',
                  cursor: 'pointer',
                }}>{item.icon}</button>
              )
            ))}
            <Link href="/leaderboard" title="leaderboard" style={{
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: '#9090a8',
              textDecoration: 'none',
            }}>≡</Link>
            <Link href="/profile" title="history" style={{
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: '#9090a8',
              textDecoration: 'none',
            }}>⏮</Link>
          </div>

          {/* Auth prompt / saved */}
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>
            {user
              ? <span style={{ color: '#57ffd8' }}>✓ result saved to your profile</span>
              : <span><Link href="/login" style={{ color: '#e8ff57', textDecoration: 'none' }}>Sign in</Link> to save your result</span>
            }
          </div>
        </div>

        {/* ── Hint ── */}
        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>
          press <kbd style={{ padding: '2px 6px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: '#9090a8' }}>tab</kbd> <span style={{ color: '#3a3a4a' }}>+</span> <kbd style={{ padding: '2px 6px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: '#9090a8' }}>enter</kbd> to restart test
        </p>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a' }}>loading results…</div>
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}
