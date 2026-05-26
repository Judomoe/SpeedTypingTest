import { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQ = [
  {
    q: 'How is WPM calculated?',
    a: 'WPM = (correct characters / 5) ÷ (elapsed time in minutes). Dividing by 5 treats a "word" as the average English word length. Only correctly typed characters count.',
  },
  {
    q: 'What is Raw WPM?',
    a: 'Raw WPM counts every keystroke regardless of correctness. The gap between WPM and Raw WPM shows how many characters were typed but had to be deleted.',
  },
  {
    q: 'What does consistency mean?',
    a: 'Consistency measures how steady your speed is throughout the test. 100% means perfectly even pacing. Lower values mean your speed varied a lot between seconds.',
  },
  {
    q: 'Why do I need to click before typing?',
    a: 'The typing area is blurred until you click on it (or anywhere on the page) to prevent accidental typing and give you a moment to read the text.',
  },
  {
    q: 'What is Zen mode?',
    a: 'Zen mode is free-form — no target text, no timer. Just type whatever you want. Press "Finish" when you\'re done to stop the WPM counter.',
  },
  {
    q: 'How do I restart a test?',
    a: 'Press Tab at any time to instantly restart, or click the Reset button below the typing area.',
  },
  {
    q: 'How does Versus mode work?',
    a: 'Create or join a room with up to 8 players. The host starts the countdown and all players race through the same text. Progress is shown live for all players.',
  },
  {
    q: 'Are my scores saved?',
    a: 'Scores are always saved to your local browser history. If you create a free account and sign in, they\'re also saved to the server and appear on the leaderboard.',
  },
]

const SHORTCUTS = [
  { keys: ['Tab'], desc: 'Restart / reset test' },
  { keys: ['Tab', 'Enter'], desc: 'Next test from Results page' },
  { keys: ['Esc'], desc: 'Blur / unfocus typing area' },
]

export default function HelpPage() {
  const [open, setOpen] = useState(null)

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 760, margin: '0 auto', padding: '80px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>💬</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 10 }}>Help & FAQ</h1>
        <p style={{ color: '#9090a8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>Everything you need to know about TypeCraft.</p>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 48 }}>
        {[
          { icon: '⌨️', label: 'Start Typing', href: '/typing' },
          { icon: '📖', label: 'Browse Courses', href: '/courses' },
          { icon: '⚔️', label: 'Versus Mode', href: '/multiplayer' },
        ].map(l => (
          <Link key={l.href} to={l.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 20px' }}>
            <span style={{ fontSize: 24 }}>{l.icon}</span>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#f0f0f8' }}>{l.label}</span>
          </Link>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>⌨️ Keyboard shortcuts</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SHORTCUTS.map(s => (
            <div key={s.desc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#9090a8', fontSize: 15 }}>{s.desc}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {s.keys.map((k, i) => (
                  <>
                    {i > 0 && <span key={`plus-${i}`} style={{ color: '#55556a', fontSize: 12 }}>+</span>}
                    <kbd key={k} style={{ padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'rgba(255,255,255,0.04)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e8ff57' }}>{k}</kbd>
                  </>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ accordion */}
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Frequently asked questions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FAQ.map((item, i) => (
          <div key={i} style={{ background: '#131318', border: `1px solid ${open === i ? 'rgba(232,255,87,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, overflow: 'hidden' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, color: open === i ? '#e8ff57' : '#f0f0f8' }}>{item.q}</span>
              <span style={{ color: '#55556a', fontSize: 18, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 22px 18px', fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#9090a8', lineHeight: 1.7 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Typing tips */}
      <div style={{ marginTop: 40, background: 'rgba(87,255,216,0.04)', border: '1px solid rgba(87,255,216,0.1)', borderRadius: 14, padding: 28 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#57ffd8', marginBottom: 16 }}>🎯 Typing tips for beginners</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['Posture first', 'Sit straight, elbows at 90°, wrists floating above the keyboard.'],
            ['Home row anchor', 'Left fingers on A S D F, right fingers on J K L ;. Always return here.'],
            ['Don\'t look down', 'Cover your hands with a cloth if you need to break the habit.'],
            ['Slow down to speed up', 'Typing at 80% of your max speed with perfect accuracy is faster long-term.'],
            ['Practice daily', 'Even 10 minutes a day compounds quickly. Consistency beats marathon sessions.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#57ffd8', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, paddingTop: 2 }}>→</span>
              <div>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#f0f0f8' }}>{title}: </span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#9090a8' }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#55556a', fontSize: 14 }}>
          Still stuck? The best way to get answers is to just start typing.{' '}
          <Link to="/typing" style={{ color: '#e8ff57', textDecoration: 'none' }}>Go to the typing page →</Link>
        </p>
      </div>
    </div>
  )
}
