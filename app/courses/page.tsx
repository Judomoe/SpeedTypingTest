'use client'
import { useState } from 'react'
import Link from 'next/link'

const TABS = ['basic lessons', 'programming', 'numbers']

const BASIC = [
  { id: 1, keys: 'f  d  j  k', fingers: 'index fingers — home row', diff: 'starter', goal: 'Master your left and right index home-row keys' },
  { id: 2, keys: 'f→g  j→h', fingers: 'index reach — center keys', diff: 'starter', goal: 'Extend your index fingers to G and H' },
  { id: 3, keys: 's  a  l  ;', fingers: 'middle & ring — home row', diff: 'starter', goal: 'Add the outer home-row keys to your muscle memory' },
  { id: 4, keys: 'd→e  k→i', fingers: 'middle finger — top row', diff: 'starter', goal: 'Reach up with your middle fingers to E and I' },
  { id: 5, keys: 'review 1–4', fingers: 'combined home & top row', diff: 'basic', goal: 'Combine all keys learned so far' },
  { id: 6, keys: 'shift + 1–4', fingers: 'capital letters', diff: 'basic', goal: 'Practice shift key for capitalization' },
  { id: 7, keys: 'f→r  j→u', fingers: 'index top row', diff: 'basic', goal: 'Reach further up with your index fingers to R and U' },
  { id: 8, keys: 'full alphabet', fingers: 'all fingers', diff: 'intermediate', goal: 'Type using every letter of the alphabet' },
  { id: 9, keys: 'common words', fingers: 'real vocabulary', diff: 'intermediate', goal: 'Build speed with the 100 most common English words' },
  { id: 10, keys: 'speed drill', fingers: '60s challenge', diff: 'advanced', goal: 'Push your WPM with a timed speed drill' },
]

const PROG = [
  { id: 1, keys: '( ) [ ] { }', fingers: 'brackets & braces', diff: 'starter', goal: 'Master the six bracket characters used in every language' },
  { id: 2, keys: '= + - * /', fingers: 'arithmetic operators', diff: 'starter', goal: 'Type arithmetic and comparison operators fluently' },
  { id: 3, keys: '@ # $ % ^ &', fingers: 'special symbols', diff: 'basic', goal: 'Build speed on symbols you use in every codebase' },
  { id: 4, keys: 'JavaScript', fingers: 'real code snippets', diff: 'intermediate', goal: 'Type real JS functions, arrow functions, and callbacks' },
  { id: 5, keys: 'Python', fingers: 'real code snippets', diff: 'intermediate', goal: 'Type real Python functions, list comprehensions, and defs' },
]

const NUMS = [
  { id: 1, keys: '1–9, 0', fingers: 'number row', diff: 'starter', goal: 'Learn the number row without looking' },
  { id: 2, keys: '1.23  4.56', fingers: 'decimals & fractions', diff: 'basic', goal: 'Type decimal numbers and common fractions accurately' },
  { id: 3, keys: '10%  $9.99', fingers: 'currencies & symbols', diff: 'intermediate', goal: 'Combine numbers with common currency and percent symbols' },
]

const DIFF_COLOR: Record<string, string> = {
  starter: '#57ffd8',
  basic: '#e8ff57',
  intermediate: '#c084fc',
  advanced: '#ff6b6b',
}

const LESSON_ICON: Record<string, string> = {
  starter: '🟢', basic: '🟡', intermediate: '🟣', advanced: '🔴',
}

function tabKey(tab: string) {
  if (tab === 'programming') return 'prog'
  if (tab === 'numbers') return 'num'
  return 'basic'
}

export default function CoursesPage() {
  const [tab, setTab] = useState('basic lessons')

  const lessons = tab === 'programming' ? PROG : tab === 'numbers' ? NUMS : BASIC
  const tk = tabKey(tab)

  return (
    <div style={{ minHeight: '100vh', maxWidth: 860, margin: '0 auto', padding: '80px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Typing Courses
        </h1>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9090a8', fontSize: 14, lineHeight: 1.8 }}>
          Structured lessons to build correct finger placement and lasting speed.<br />
          Complete each lesson with ≥ 20 WPM before moving on.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 18px', borderRadius: 8,
            border: `1px solid ${tab === t ? '#e8ff57' : 'rgba(255,255,255,0.08)'}`,
            background: tab === t ? 'rgba(232,255,87,0.08)' : 'transparent',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
            color: tab === t ? '#e8ff57' : '#9090a8', cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {/* What you'll practice */}
      <div style={{
        background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
        padding: '16px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>
          {tab === 'basic lessons' && '🖐 Touch typing from home row to full keyboard — the right way'}
          {tab === 'programming' && '💻 Brackets, operators, and real code you\'ll type every day'}
          {tab === 'numbers' && '🔢 Number row, decimals, currencies, and percentage symbols'}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(DIFF_COLOR).map(([d, c]) => (
              <span key={d} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: c, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />{d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 1fr 110px 70px',
        padding: '8px 20px', marginBottom: 6,
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <span>#</span>
        <span>lesson</span>
        <span>focus</span>
        <span style={{ textAlign: 'right' }}>start</span>
      </div>

      {/* Lessons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lessons.map((l, idx) => {
          const isLocked = idx > 0 && tab === 'basic lessons' && idx >= 4
          return (
            <div key={l.id} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 110px 70px',
              alignItems: 'center', padding: '16px 20px', borderRadius: 12,
              background: '#131318',
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'border-color 0.15s',
              opacity: isLocked ? 0.45 : 1,
            }}>
              {/* Number */}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{l.id}</span>

              {/* Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 20 }}>{LESSON_ICON[l.diff]}</div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#f0f0f8', marginBottom: 4 }}>{l.keys}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 8px', borderRadius: 100,
                      color: DIFF_COLOR[l.diff], border: `1px solid ${DIFF_COLOR[l.diff]}30`, background: `${DIFF_COLOR[l.diff]}0a`,
                    }}>{l.diff}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#55556a' }}>{l.fingers}</span>
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#55556a', lineHeight: 1.4, paddingRight: 12 }}>
                {l.goal}
              </div>

              {/* Start button */}
              <div style={{ textAlign: 'right' }}>
                {isLocked ? (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>🔒</span>
                ) : (
                  <Link href={`/typing?lesson=${l.id}&tab=${tk}`} style={{
                    display: 'inline-block', padding: '7px 14px', borderRadius: 8,
                    fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13,
                    background: 'rgba(232,255,87,0.1)', color: '#e8ff57',
                    textDecoration: 'none', border: '1px solid rgba(232,255,87,0.15)',
                    transition: 'background 0.15s',
                  }}>
                    Start →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div style={{ marginTop: 32, background: 'rgba(87,255,216,0.03)', border: '1px solid rgba(87,255,216,0.1)', borderRadius: 14, padding: '18px 24px' }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: '#57ffd8', marginBottom: 8 }}>💡 How to use these lessons</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9090a8', lineHeight: 1.8 }}>
          Click <strong style={{ color: '#f0f0f8' }}>Start</strong> to open the typing test with the lesson text pre-loaded.
          Focus on <strong style={{ color: '#f0f0f8' }}>accuracy first</strong> — speed follows naturally.
          Aim for 20+ WPM before advancing, and use correct finger placement from the start.
          Return to earlier lessons any time to reinforce muscle memory.
        </div>
      </div>
    </div>
  )
}
