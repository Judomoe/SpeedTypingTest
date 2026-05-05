import Link from 'next/link'

const STATS = [
  { n: '280K+', label: 'active typists' },
  { n: '12M+', label: 'tests completed' },
  { n: '147 WPM', label: 'record speed' },
]

const FEATURES = [
  { icon: '⚡', title: 'Speed Tests', desc: 'Word, quote, code, and zen modes. 15s to 5min durations. Real-time WPM & accuracy.', href: '/typing', color: '#e8ff57' },
  { icon: '📖', title: 'Structured Courses', desc: 'Step-by-step touch typing from home row to full keyboard mastery.', href: '/courses', color: '#57ffd8' },
  { icon: '⚔️', title: 'Live Versus', desc: 'Race real opponents in real-time. Create private rooms or jump into matchmaking.', href: '/multiplayer', color: '#c084fc' },
  { icon: '🏆', title: 'Global Ranks', desc: 'Daily, weekly, all-time boards. Climb the ladder. Earn badges.', href: '/leaderboard', color: '#ff6b6b' },
]

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 60 }}>

      {/* Ambient BG orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,255,87,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(87,255,216,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,132,252,0.03) 0%, transparent 70%)', transform: 'translate(-50%,-50%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <section style={{ textAlign: 'center', padding: '100px 24px 80px' }}>
          <div className="fade-up-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100,
            border: '1px solid rgba(232,255,87,0.2)',
            background: 'rgba(232,255,87,0.05)',
            marginBottom: 32,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#e8ff57',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8ff57', display: 'inline-block', animation: 'glowPulse 2s ease-in-out infinite' }} />
            v2.0 — multiplayer races now live
          </div>

          <h1 className="fade-up-2" style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: 'clamp(52px, 8vw, 96px)',
            lineHeight: 1, letterSpacing: '-0.04em',
            color: '#f0f0f8', marginBottom: 20,
          }}>
            <span style={{ color: '#e8ff57' }}>Type Faster</span><br />
            <span style={{ color: '#e8ff57' }}>Think sharper.</span>
          </h1>

          <p className="fade-up-3" style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 20,
            color: '#9090a8', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.6,
          }}>
            The typing platform built to make MonkeyType and KeyBR obsolete. Beautiful, fast, and designed to matter.
          </p>

          <div className="fade-up-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/typing" style={{
              padding: '14px 32px', borderRadius: 12,
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16,
              color: '#0c0c10', background: '#e8ff57', textDecoration: 'none',
              transition: 'transform 0.15s',
            }}>
              Start typing free →
            </Link>
            <Link href="/courses" style={{
              padding: '14px 32px', borderRadius: 12,
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16,
              color: '#f0f0f8', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
            }}>
              Browse courses
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section style={{ display: 'flex', justifyContent: 'center', gap: 64, padding: '0 24px 80px', flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 44, color: '#e8ff57', letterSpacing: '-0.03em' }}>{s.n}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* Live demo teaser */}
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{
            background: '#131318', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, padding: 40, position: 'relative', overflow: 'hidden',
          }}>
            {/* Top bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff6b6b' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e8ff57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#57ffd8' }} />
              <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.04)', marginLeft: 12 }} />
            </div>
            {/* Fake typing line */}
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, lineHeight: 2, userSelect: 'none' }}>
              <span style={{ color: '#57ffd8' }}>the quick brown fox jumps over </span>
              <span style={{ color: '#ff6b6b' }}>t</span>
              <span style={{ display: 'inline-block', width: 2, height: '1.1em', background: '#e8ff57', verticalAlign: 'text-bottom', marginLeft: 1, animation: 'blink 1.1s step-end infinite' }} />
              <span style={{ color: '#55556a' }}>he lazy dog and disappears</span>
            </p>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 40, marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[['112', 'wpm'], ['97%', 'acc'], ['2', 'errors'], ['22s', 'left']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 32, color: '#e8ff57', letterSpacing: '-0.02em' }}>{v}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            {/* Glow */}
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,255,87,0.08) 0%, transparent 70%)' }} />
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 120px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', marginBottom: 12 }}>Everything in one place</h2>
            <p style={{ color: '#9090a8', fontSize: 18 }}>One platform to learn, compete, and dominate.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <Link key={f.title} href={f.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#131318', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: 28,
                  transition: 'border-color 0.2s, transform 0.2s',
                  cursor: 'pointer', height: '100%',
                }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: f.color, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9090a8', lineHeight: 1.6, fontSize: 15 }}>{f.desc}</p>
                  <div style={{ marginTop: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: f.color }}>explore →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px 120px', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,255,87,0.06) 0%, rgba(87,255,216,0.06) 100%)',
            border: '1px solid rgba(232,255,87,0.15)', borderRadius: 20, padding: '60px 40px',
          }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginBottom: 16 }}>Ready to level up?</h2>
            <p style={{ color: '#9090a8', marginBottom: 32, fontSize: 17 }}>Free forever. No credit card needed.</p>
            <Link href="/register" style={{
              display: 'inline-block', padding: '14px 36px', borderRadius: 12,
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16,
              color: '#0c0c10', background: '#e8ff57', textDecoration: 'none',
            }}>Create free account</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
