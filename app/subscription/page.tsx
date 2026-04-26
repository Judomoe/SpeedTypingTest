import Link from 'next/link'

const PLANS = [
  { name: 'Free', price: '$0', period: 'forever', color: '#9090a8', features: ['✓ Unlimited speed tests','✓ 10 basic courses','✓ Global leaderboard','✓ 7-day history','✗ Advanced analytics','✗ Multiplayer','✗ Custom themes'], cta: 'Current plan', popular: false },
  { name: 'Pro', price: '$5', period: '/month', color: '#e8ff57', features: ['✓ Everything in Free','✓ All 60+ courses','✓ Multiplayer races','✓ Unlimited history','✓ Advanced analytics','✓ Custom themes & fonts','✓ Priority support'], cta: 'Start 7-day trial', popular: true },
  { name: 'Team', price: '$12', period: '/month', color: '#57ffd8', features: ['✓ Everything in Pro','✓ Up to 10 members','✓ Team leaderboard','✓ Admin dashboard','✓ Progress reports','✓ Custom word lists','✓ Dedicated support'], cta: 'Contact sales', popular: false },
]

export default function SubPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 960, margin: '0 auto', padding: '80px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 12 }}>Simple pricing</h1>
        <p style={{ color: '#9090a8', fontSize: 18, fontFamily: 'DM Sans, sans-serif' }}>Start free. Upgrade when you mean business.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {PLANS.map(p => (
          <div key={p.name} style={{ background: '#131318', border: `1px solid ${p.popular ? p.color + '30' : 'rgba(255,255,255,0.06)'}`, borderRadius: 18, padding: 28, position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: p.popular ? `0 0 60px ${p.color}0a` : 'none' }}>
            {p.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 20, background: p.color, color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12 }}>Most popular</div>}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: p.color, marginBottom: 8 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 48, letterSpacing: '-0.03em' }}>{p.price}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#55556a' }}>{p.period}</span>
              </div>
            </div>
            <div style={{ flex: 1, marginBottom: 24 }}>
              {p.features.map(f => (
                <div key={f} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: f.startsWith('✓') ? '#9090a8' : '#55556a', marginBottom: 8, textDecoration: f.startsWith('✗') ? 'line-through' : 'none' }}>{f}</div>
              ))}
            </div>
            <button style={{ width: '100%', padding: '13px', borderRadius: 10, border: p.popular ? 'none' : '1px solid rgba(255,255,255,0.1)', background: p.popular ? p.color : 'transparent', color: p.popular ? '#0c0c10' : p.color, fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{p.cta}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
