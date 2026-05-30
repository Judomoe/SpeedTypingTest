import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const STATS = [
  { target: 280, suffix: 'K+', label: 'active typists' },
  { target: 12, suffix: 'M+', label: 'tests completed' },
  { target: 147, suffix: ' WPM', label: 'record speed' },
]

const FEATURES = [
  { icon: '⚡', title: 'Speed Tests', desc: 'Word, quote, code, and zen modes. 15s to 5min. Real-time WPM & accuracy.', href: '/typing', color: '#e8ff57' },
  { icon: '📖', title: 'Structured Courses', desc: 'Step-by-step touch typing from home row to full keyboard mastery.', href: '/courses', color: '#57ffd8' },
  { icon: '⚔️', title: 'Live Versus', desc: 'Race real opponents in real-time. Create private rooms or jump into matchmaking.', href: '/multiplayer', color: '#c084fc' },
  { icon: '🏆', title: 'Global Ranks', desc: 'Daily, weekly, all-time boards. Climb the ladder. Earn badges.', href: '/leaderboard', color: '#ff6b6b' },
]

// Ease-out cubic: rockets through the start, decelerates into the final number
function AnimatedStat({ target, suffix, label }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.ceil(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 44, color: '#e8ff57', letterSpacing: '-0.03em' }}>
        {count}{suffix}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a', marginTop: 4 }}>
        {label}
      </div>
    </div>
  )
}

export default function Home() {
  // Hide CTA section when user is logged in
  // Change 'authToken' to whatever key your auth system stores
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('tc_session')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60 }}>

      <style>{`
        /* ── Feature cards: pop-out on hover ── */
        .feature-card {
          transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.4),
                      border-color 0.3s ease,
                      box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: scale(1.06) translateY(-6px);
          border-color: var(--card-color) !important;
          box-shadow: 0 20px 40px -12px var(--card-glow);
        }

        /* ── Primary button: pop-out + yellow glow ── */
        .btn-primary {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.4), box-shadow 0.3s ease;
          display: inline-block;
        }
        .btn-primary:hover {
          transform: scale(1.07) translateY(-3px);
          box-shadow: 0 12px 28px -8px rgba(232, 255, 87, 0.65);
        }

        /* ── Secondary button: pop-out + subtle glow ── */
        .btn-secondary {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.4), box-shadow 0.3s ease, border-color 0.3s ease;
          display: inline-block;
        }
        .btn-secondary:hover {
          transform: scale(1.07) translateY(-3px);
          border-color: rgba(255,255,255,0.25) !important;
          box-shadow: 0 12px 28px -8px rgba(255, 255, 255, 0.18);
        }

        /* ── CTA card: pop-out on hover ── */
        .cta-card {
          transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.4), box-shadow 0.3s ease;
        }
        .cta-card:hover {
          transform: scale(1.025) translateY(-6px);
          box-shadow: 0 24px 50px -16px rgba(232, 255, 87, 0.18);
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,255,87,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(87,255,216,0.04) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <section style={{ textAlign: 'center', padding: '100px 24px 80px' }}>
          <div className="fade-up-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            border: '1px solid rgba(232,255,87,0.2)', background: 'rgba(232,255,87,0.05)',
            marginBottom: 32, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e8ff57',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8ff57', display: 'inline-block', animation: 'glowPulse 2s ease-in-out infinite' }} />
            v2.0 — multiplayer races now live
          </div>

          <h1 className="fade-up-2" style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: 'clamp(52px, 8vw, 96px)', lineHeight: 1, letterSpacing: '-0.04em',
            color: '#f0f0f8', marginBottom: 20,
          }}>
            <span style={{ color: '#e8ff57' }}>Type Faster.</span><br />
            <span style={{ color: '#e8ff57' }}>Think Sharper.</span>
          </h1>

          <p className="fade-up-3" style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 20,
            color: '#9090a8', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.6,
          }}>
            The typing platform built to make MonkeyType and KeyBR obsolete. Beautiful, fast, and designed to matter.
          </p>

          <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/typing" className="btn-primary" style={{
              padding: '14px 32px', borderRadius: 12, fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: 16, color: '#0c0c10', background: '#e8ff57', textDecoration: 'none',
            }}>Start typing free →</Link>
            <Link to="/courses" className="btn-secondary" style={{
              padding: '14px 32px', borderRadius: 12, fontFamily: 'Outfit, sans-serif',
              fontWeight: 600, fontSize: 16, color: '#f0f0f8', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
            }}>Browse courses</Link>
          </div>
        </section>

        {/* Stats — eased count-up */}
        <section style={{ display: 'flex', justifyContent: 'center', gap: 64, padding: '0 24px 80px', flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <AnimatedStat key={s.label} target={s.target} suffix={s.suffix} label={s.label} />
          ))}
        </section>

        <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{
            background: '#131318', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, padding: 40, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
              {['#ff6b6b','#e8ff57','#57ffd8'].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
              <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.04)', marginLeft: 12 }} />
            </div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, lineHeight: 2, userSelect: 'none' }}>
              <span style={{ color: '#57ffd8' }}>the quick brown fox jumps over </span>
              <span style={{ color: '#ff6b6b' }}>t</span>
              <span style={{ display: 'inline-block', width: 2, height: '1.1em', background: '#e8ff57', verticalAlign: 'text-bottom', marginLeft: 1, animation: 'blink 1.1s step-end infinite' }} />
              <span style={{ color: '#55556a' }}>he lazy dog and disappears</span>
            </p>
            <div style={{ display: 'flex', gap: 40, marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[['112','wpm'],['97%','acc'],['2','errors'],['22s','left']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 32, color: '#e8ff57', letterSpacing: '-0.02em' }}>{v}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — pop-out on hover */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 120px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', marginBottom: 12 }}>Everything in one place</h2>
            <p style={{ color: '#9090a8', fontSize: 18 }}>One platform to learn, compete, and dominate.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <Link key={f.title} to={f.href} style={{ textDecoration: 'none' }}>
                <div
                  className="feature-card"
                  style={{
                    '--card-color': f.color,
                    '--card-glow': `${f.color}30`,
                    background: '#131318', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16, padding: 28, height: '100%', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: f.color, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9090a8', lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
                  <div style={{ marginTop: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: f.color }}>explore →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA — hidden when logged in, pop-out on hover */}
        {!isLoggedIn && (
          <section style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 120px', textAlign: 'center' }}>
            <div
              className="cta-card"
              style={{
                background: 'linear-gradient(135deg, rgba(232,255,87,0.06) 0%, rgba(87,255,216,0.06) 100%)',
                border: '1px solid rgba(232,255,87,0.15)', borderRadius: 20, padding: '60px 40px',
              }}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginBottom: 16 }}>Ready to level up?</h2>
              <p style={{ color: '#9090a8', marginBottom: 32, fontSize: 17 }}>Free forever. No credit card needed.</p>
              <Link to="/register" className="btn-primary" style={{
                display: 'inline-block', padding: '14px 36px', borderRadius: 12,
                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16,
                color: '#0c0c10', background: '#e8ff57', textDecoration: 'none',
              }}>Create free account</Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}