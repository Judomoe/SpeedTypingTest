const FAQ = [
  { q: 'How is WPM calculated?', a: 'Characters typed divided by 5 (avg word length), multiplied by 60 divided by elapsed seconds. Only correct characters count.' },
  { q: 'How do I improve fast?', a: 'Use the courses. Start with home row, prioritize accuracy over speed, practice 15 minutes daily. Consistency beats marathon sessions.' },
  { q: 'What is touch typing?', a: 'Typing without looking at the keyboard. Each finger owns specific keys. Dramatically improves speed and reduces strain.' },
  { q: 'How do multiplayer races work?', a: 'Join or create a room. All players get the same text. First to finish (with fewest errors) wins.' },
  { q: 'Is my progress saved?', a: 'Yes, if you are signed in. All test results, lesson progress, and personal bests sync to your account.' },
]

const SHORTCUTS = [
  { key: 'Tab', action: 'Restart current test' },
  { key: 'Esc', action: 'Cancel and go home' },
  { key: 'Ctrl + R', action: 'New random text' },
  { key: 'Ctrl + 1–4', action: 'Switch duration (15/30/60/120s)' },
  { key: 'Ctrl + M', action: 'Switch typing mode' },
]

export default function HelpPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 720, margin: '0 auto', padding: '80px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 10 }}>Help Center</h1>
        <p style={{ color: '#9090a8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>Everything you need to master TypeCraft</p>
      </div>

      {/* Getting started */}
      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><span>🚀</span> Getting Started</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[['1','Create account','Sign up free to save progress and compete'],['2','Take a course','Learn proper finger placement step by step'],['3','Practice daily','Even 10 min/day builds lasting muscle memory']].map(([n,t,d]) => (
            <div key={n} style={{ background: '#1a1a22', borderRadius: 12, padding: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e8ff57', color: '#0c0c10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{n}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{t}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9090a8', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcuts */}
      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><span>⌨️</span> Keyboard Shortcuts</h2>
        {SHORTCUTS.map(s => (
          <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#9090a8', fontSize: 14 }}>{s.action}</span>
            <kbd style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e8ff57', padding: '4px 10px', border: '1px solid rgba(232,255,87,0.2)', background: 'rgba(232,255,87,0.06)', borderRadius: 6 }}>{s.key}</kbd>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}><span>❓</span> FAQ</h2>
        {FAQ.map(f => (
          <details key={f.q} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 4 }}>
            <summary style={{ padding: '14px 0', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {f.q} <span style={{ color: '#55556a', fontSize: 12 }}>▼</span>
            </summary>
            <p style={{ padding: '0 0 16px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9090a8', lineHeight: 1.7 }}>{f.a}</p>
          </details>
        ))}
      </div>

      <div style={{ background: 'rgba(232,255,87,0.04)', border: '1px solid rgba(232,255,87,0.1)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Still need help?</h3>
        <p style={{ color: '#9090a8', marginBottom: 16, fontFamily: 'DM Sans, sans-serif' }}>Our team responds within 24 hours</p>
        <a href="mailto:hello@typecraft.io" style={{ display: 'inline-block', padding: '11px 24px', borderRadius: 10, background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Contact support →</a>
      </div>
    </div>
  )
}
