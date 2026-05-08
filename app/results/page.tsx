'use client'
import Link from 'next/link'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Result {
  wpm: number
  rawWpm: number
  acc: number
  consistency: number
  errors: number
  correct: number
  incorrect: number
  extra: number
  missed: number
  dur: number
  mode: string
  wpmData: number[]
  rawData: number[]
  errData: number[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Grade helper
// ─────────────────────────────────────────────────────────────────────────────
function getGrade(wpm: number): { grade: string; color: string; label: string } {
  if (wpm >= 120) return { grade: 'S', color: '#e8ff57', label: 'Legendary' }
  if (wpm >= 100) return { grade: 'A+', color: '#57ffd8', label: 'Elite' }
  if (wpm >= 80)  return { grade: 'A',  color: '#57ffd8', label: 'Excellent' }
  if (wpm >= 60)  return { grade: 'B',  color: '#c084fc', label: 'Good' }
  if (wpm >= 40)  return { grade: 'C',  color: '#9090a8', label: 'Average' }
  return            { grade: 'D',  color: '#ff6b6b', label: 'Keep going' }
}

// ─────────────────────────────────────────────────────────────────────────────
// WPM Chart  (smooth bezier, dual Y-axis, animated draw)
// ─────────────────────────────────────────────────────────────────────────────
function WpmChart({
  wpmData, rawData, errData,
}: {
  wpmData: number[]
  rawData: number[]
  errData: number[]
}) {
  const pathRef  = useRef<SVGPathElement>(null)
  const rawRef   = useRef<SVGPathElement>(null)
  const [drawn, setDrawn] = useState(false)

  const W = 640; const H = 220
  const pL = 44; const pR = 36; const pT = 16; const pB = 32
  const cW = W - pL - pR; const cH = H - pT - pB
  const n  = wpmData.length

  if (!n) return null

  const maxWpm   = Math.max(...wpmData, ...rawData, 10)
  const roundMax = Math.ceil(maxWpm / 10) * 10 + 20
  const maxErr   = Math.max(...errData, 4)

  const toX  = (i: number) => pL + (n <= 1 ? cW / 2 : (i / (n - 1)) * cW)
  const toY  = (v: number) => pT + cH - Math.min(1, Math.max(0, v / roundMax)) * cH
  const toYE = (v: number) => pT + cH - Math.min(1, Math.max(0, v / maxErr)) * cH

  // Smooth cubic bezier
  const smooth = (pts: [number, number][]): string => {
    if (!pts.length) return ''
    let d = `M${pts[0][0]},${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const mx = (x0 + x1) / 2
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`
    }
    return d
  }

  const wpmPts: [number, number][] = wpmData.map((v, i) => [toX(i), toY(v)])
  const rawPts: [number, number][] = rawData.map((v, i) => [toX(i), toY(v)])
  const avgWpm = wpmData.reduce((a, b) => a + b, 0) / n
  const avgY   = toY(avgWpm)

  const wpmPath = smooth(wpmPts)
  const rawPath = smooth(rawPts)

  // Area fill path (under wpm line)
  const areaPath = wpmPath
    + ` L${toX(n - 1)},${pT + cH} L${pL},${pT + cH} Z`

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    y: pT + p * cH,
    val: Math.round(roundMax * (1 - p)),
  }))

  // X-axis ticks — max 10 labels
  const step = Math.max(1, Math.ceil(n / 10))
  const xTicks = Array.from({ length: n }, (_, i) => i)
    .filter(i => i % step === 0 || i === n - 1)

  // Animate draw on mount
  useEffect(() => {
    const timer = setTimeout(() => setDrawn(true), 80)
    return () => clearTimeout(timer)
  }, [])

  const pathLen  = pathRef.current?.getTotalLength()  ?? 2000
  const rawLen   = rawRef.current?.getTotalLength()   ?? 2000

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        {/* Area gradient */}
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e8ff57" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#e8ff57" stopOpacity="0"    />
        </linearGradient>
        {/* Clip for animation */}
        <clipPath id="chartClip">
          <rect x={pL} y={0} width={cW} height={H} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {yTicks.map(({ y, val }) => (
        <g key={val}>
          <line
            x1={pL} y1={y} x2={W - pR} y2={y}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
          <text
            x={pL - 8} y={y + 4}
            textAnchor="end"
            fill="#3a3a50" fontSize="10"
            fontFamily="JetBrains Mono, monospace"
          >
            {val}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {xTicks.map(i => (
        <text
          key={i}
          x={toX(i)} y={H - 4}
          textAnchor="middle"
          fill="#3a3a50" fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          {i + 1}
        </text>
      ))}

      {/* Right Y-axis error labels */}
      {Array.from({ length: Math.min(maxErr, 5) + 1 }, (_, i) => i).map(v => (
        <text
          key={v}
          x={W - pR + 8} y={toYE(v) + 4}
          textAnchor="start"
          fill="#3a3a50" fontSize="9"
          fontFamily="JetBrains Mono, monospace"
        >
          {v}
        </text>
      ))}

      {/* Axis labels */}
      <text
        x={10} y={pT + cH / 2}
        textAnchor="middle" fill="#3a3a50" fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        transform={`rotate(-90, 10, ${pT + cH / 2})`}
      >
        wpm
      </text>
      <text
        x={W - 4} y={pT + cH / 2}
        textAnchor="middle" fill="#3a3a50" fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        transform={`rotate(90, ${W - 4}, ${pT + cH / 2})`}
      >
        errors
      </text>

      <g clipPath="url(#chartClip)">
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Average line */}
        <line
          x1={pL} y1={avgY} x2={W - pR} y2={avgY}
          stroke="#e8ff57" strokeWidth="1"
          strokeDasharray="5,5" opacity="0.3"
        />
        <text
          x={W - pR - 4} y={avgY - 5}
          textAnchor="end" fill="#e8ff57"
          fontSize="9" fontFamily="JetBrains Mono, monospace"
          opacity="0.5"
        >
          avg {Math.round(avgWpm)}
        </text>

        {/* Raw WPM path */}
        <path
          ref={rawRef}
          d={rawPath}
          fill="none"
          stroke="#9090a8"
          strokeWidth="1.5"
          opacity="0.35"
          style={{
            strokeDasharray: rawLen,
            strokeDashoffset: drawn ? 0 : rawLen,
            transition: 'stroke-dashoffset 1.2s ease',
          }}
        />

        {/* WPM path */}
        <path
          ref={pathRef}
          d={wpmPath}
          fill="none"
          stroke="#e8ff57"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLen,
            strokeDashoffset: drawn ? 0 : pathLen,
            transition: 'stroke-dashoffset 1s ease',
          }}
        />

        {/* WPM dots */}
        {wpmPts.map(([x, y], i) => (
          <circle
            key={i} cx={x} cy={y} r="3"
            fill="#e8ff57" stroke="#0c0c10" strokeWidth="1.5"
            style={{
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.2s ${0.8 + i * 0.02}s`,
            }}
          />
        ))}

        {/* Error markers */}
        {errData.map((err, i) => {
          const prev = i > 0 ? errData[i - 1] : 0
          if (err <= prev) return null
          return (
            <g key={i}>
              <circle
                cx={toX(i)} cy={toYE(err)}
                r="5" fill="rgba(255,107,107,0.15)"
                stroke="#ff6b6b" strokeWidth="1"
              />
              <text
                x={toX(i)} y={toYE(err) + 4}
                textAnchor="middle"
                fill="#ff6b6b" fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                ✕
              </text>
            </g>
          )
        })}
      </g>

      {/* Chart border */}
      <rect
        x={pL} y={pT}
        width={cW} height={cH}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated number counter
// ─────────────────────────────────────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 800 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(to * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to, duration])
  return <>{val}{suffix}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────────────────────
function Stat({
  label, value, sub, accent = false, small = false,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  small?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, color: '#55556a',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 800,
        fontSize: small ? 24 : 40,
        color: accent ? '#e8ff57' : '#f0f0f8',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, color: '#3a3a50', marginTop: 2,
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Action button
// ─────────────────────────────────────────────────────────────────────────────
function ActionBtn({
  children, href, onClick, title, highlight = false,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  title?: string
  highlight?: boolean
}) {
  const style: React.CSSProperties = {
    width: 44, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
    border: highlight
      ? '1px solid rgba(232,255,87,0.3)'
      : '1px solid rgba(255,255,255,0.07)',
    background: highlight
      ? 'rgba(232,255,87,0.08)'
      : 'rgba(255,255,255,0.02)',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 18, color: highlight ? '#e8ff57' : '#55556a',
    cursor: 'pointer', textDecoration: 'none',
    transition: 'all 0.15s',
  }
  if (href) return <Link href={href} title={title} style={style}>{children}</Link>
  return <button onClick={onClick} title={title} style={style}>{children}</button>
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Results component
// ─────────────────────────────────────────────────────────────────────────────
function ResultsInner() {
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)
  const [visible, setVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Load result from sessionStorage
    try {
      const raw = sessionStorage.getItem('tc_result')
      if (raw) setResult(JSON.parse(raw))
    } catch { /* ignore */ }

    // Check login
    try {
      const session = localStorage.getItem('tc_session')
      setIsLoggedIn(!!session)
    } catch { /* ignore */ }

    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Keyboard shortcut: Tab+Enter → restart
  useEffect(() => {
    let tabDown = false
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); tabDown = true }
      if (e.key === 'Enter' && tabDown) router.push('/typing')
    }
    const up = (e: KeyboardEvent) => { if (e.key === 'Tab') tabDown = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [router])

  // ── No result state ──────────────────────────────────────────────────────
  if (!result) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 24, padding: 24,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          📊
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            fontSize: 20, color: '#f0f0f8', marginBottom: 8,
          }}>
            No result found
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13, color: '#55556a',
          }}>
            Complete a typing test to see your results here
          </p>
        </div>
        <Link href="/typing" style={{
          padding: '12px 32px', borderRadius: 10,
          background: '#e8ff57', color: '#0c0c10',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15,
          textDecoration: 'none',
        }}>
          Start a test →
        </Link>
      </div>
    )
  }

  const {
    wpm, rawWpm, acc, consistency,
    correct, incorrect, extra, missed,
    dur, mode, wpmData, rawData, errData,
  } = result

  const { grade, color: gradeColor, label: gradeLabel } = getGrade(wpm)
  const modeLabel = `time ${dur}`
  const langLabel = mode === 'code' ? 'code' : 'english'

  // Fade-up animation helper
  const fadeUp = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ${delay}s ease, transform 0.5s ${delay}s ease`,
  })

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '90px 24px 60px',
    }}>
      <div style={{ width: '100%', maxWidth: 780 }}>

        {/* ── SECTION 1: WPM + ACC + Chart ──────────────────────────────────── */}
        <div style={{
          ...fadeUp(0),
          background: '#131318',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '28px 32px',
          marginBottom: 10,
          display: 'grid',
          gridTemplateColumns: '110px 1fr',
          gap: 36, alignItems: 'center',
        }}>
          {/* Left: WPM + ACC stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12, color: '#55556a', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                wpm
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 76, color: '#e8ff57',
                lineHeight: 1, letterSpacing: '-0.04em',
              }}>
                <Counter to={wpm} />
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12, color: '#55556a', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                acc
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 76, color: '#e8ff57',
                lineHeight: 1, letterSpacing: '-0.04em',
              }}>
                <Counter to={acc} suffix="%" />
              </div>
            </div>
          </div>

          {/* Right: Chart */}
          <div>
            <WpmChart wpmData={wpmData} rawData={rawData} errData={errData} />
            {/* Legend */}
            <div style={{
              display: 'flex', gap: 20, marginTop: 10, justifyContent: 'flex-end',
            }}>
              {[
                { color: '#e8ff57', label: 'wpm' },
                { color: '#9090a8', label: 'raw' },
                { color: '#ff6b6b', label: 'errors' },
              ].map(l => (
                <div key={l.label} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#55556a',
                }}>
                  <span style={{
                    display: 'inline-block', width: 20, height: 2,
                    background: l.color, borderRadius: 2,
                  }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Detailed stats ─────────────────────────────────────── */}
        <div style={{
          ...fadeUp(0.08),
          background: '#131318',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '22px 32px',
          marginBottom: 10,
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 1px 80px 1px minmax(0,1fr) 1px 90px 1px 80px',
            gap: 0, alignItems: 'start',
          }}>

            {/* Test type */}
            <div style={{ paddingRight: 24 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: '#55556a', marginBottom: 10,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                test type
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 14,
                color: '#e8ff57', lineHeight: 2,
              }}>
                {modeLabel}<br />{langLabel}
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.05)', alignSelf: 'stretch', margin: '0 24px' }} />

            {/* Raw */}
            <div>
              <Stat label="raw" value={rawWpm} accent />
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.05)', alignSelf: 'stretch', margin: '0 24px' }} />

            {/* Characters */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: '#55556a', marginBottom: 10,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                characters
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: 28, color: '#f0f0f8',
                letterSpacing: '-0.02em', lineHeight: 1,
                display: 'flex', gap: 2, flexWrap: 'wrap',
              }}>
                <span style={{ color: '#57ffd8' }}>{correct}</span>
                <span style={{ color: '#55556a', fontWeight: 400, fontSize: 24 }}>/</span>
                <span style={{ color: '#ff6b6b' }}>{incorrect}</span>
                <span style={{ color: '#55556a', fontWeight: 400, fontSize: 24 }}>/</span>
                <span style={{ color: '#9090a8' }}>{extra}</span>
                <span style={{ color: '#55556a', fontWeight: 400, fontSize: 24 }}>/</span>
                <span style={{ color: '#55556a' }}>{missed}</span>
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: '#3a3a50', marginTop: 6,
                display: 'flex', gap: 8,
              }}>
                <span style={{ color: '#57ffd8' }}>correct</span>
                <span>/</span>
                <span style={{ color: '#ff6b6b' }}>incorrect</span>
                <span>/</span>
                <span>extra</span>
                <span>/</span>
                <span>missed</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.05)', alignSelf: 'stretch', margin: '0 24px' }} />

            {/* Consistency */}
            <div>
              <Stat label="consistency" value={`${consistency}%`} accent />
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.05)', alignSelf: 'stretch', margin: '0 24px' }} />

            {/* Time */}
            <div>
              <Stat label="time" value={`${dur}s`} accent />
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Grade + Actions ───────────────────────────────────── */}
        <div style={{
          ...fadeUp(0.16),
          background: '#131318',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 18, padding: '18px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 20,
          flexWrap: 'wrap',
        }}>
          {/* Left: grade badge + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Grade */}
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              border: `1px solid ${gradeColor}30`,
              background: `${gradeColor}08`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 22, color: gradeColor, lineHeight: 1,
              }}>
                {grade}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 8, color: gradeColor, opacity: 0.6,
                marginTop: 2, letterSpacing: '0.05em',
              }}>
                {gradeLabel.toLowerCase()}
              </span>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)' }} />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <ActionBtn href="/typing" title="next test" highlight>›</ActionBtn>
              <ActionBtn onClick={() => router.push('/typing')} title="restart">↺</ActionBtn>
              <ActionBtn href="/leaderboard" title="leaderboard">≡</ActionBtn>
              <ActionBtn href="/profile" title="history">⏮</ActionBtn>
            </div>
          </div>

          {/* Right: save status */}
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
          }}>
            {isLoggedIn ? (
              <span style={{ color: '#57ffd8', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#57ffd8', display: 'inline-block',
                }} />
                result saved to your profile
              </span>
            ) : (
              <span style={{ color: '#55556a' }}>
                <Link href="/login" style={{ color: '#e8ff57', textDecoration: 'none' }}>
                  sign in
                </Link>
                {' '}to save your result
              </span>
            )}
          </div>
        </div>

        {/* ── Keyboard hint ─────────────────────────────────────────────────── */}
        <p style={{
          ...fadeUp(0.24),
          textAlign: 'center', marginTop: 24,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12, color: '#3a3a50',
        }}>
          press{' '}
          <kbd style={{
            padding: '2px 7px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 5, color: '#55556a',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          }}>
            tab
          </kbd>
          {' '}+{' '}
          <kbd style={{
            padding: '2px 7px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 5, color: '#55556a',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          }}>
            enter
          </kbd>
          {' '}to restart
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Export with Suspense boundary
// ─────────────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.06)',
            borderTopColor: '#e8ff57',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: '#55556a', fontSize: 13,
          }}>
            loading results…
          </span>
        </div>
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}
