import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'basic', label: 'Basics', icon: '⌨️' },
  { id: 'prog',  label: 'Programming', icon: '💻' },
  { id: 'num',   label: 'Numbers & Symbols', icon: '#' },
]

const COURSES = {
  basic: [
    { id: 1,  title: 'Home Row — Left Hand',  desc: 'Master the foundation: A S D F G',       keys: ['a','s','d','f','g'],              duration: '5 min',  difficulty: 'easy'   },
    { id: 2,  title: 'Home Row — Right Hand', desc: 'Complete the home row: H J K L ;',        keys: ['h','j','k','l',';'],              duration: '5 min',  difficulty: 'easy'   },
    { id: 3,  title: 'Bottom Row',            desc: 'Reach down: Z X C V B N M',               keys: ['z','x','c','v','b','n','m'],      duration: '8 min',  difficulty: 'easy'   },
    { id: 4,  title: 'Top Row — Left',        desc: 'Stretch up: Q W E R T',                   keys: ['q','w','e','r','t'],              duration: '8 min',  difficulty: 'medium' },
    { id: 5,  title: 'Top Row — Right',       desc: 'Complete the top: Y U I O P',              keys: ['y','u','i','o','p'],              duration: '8 min',  difficulty: 'medium' },
    { id: 6,  title: 'Capital Letters',       desc: 'Using Shift correctly with both hands',    keys: ['⇧'],                              duration: '10 min', difficulty: 'medium' },
    { id: 7,  title: 'Common Words',          desc: '100 most common English words',            keys: [],                                 duration: '12 min', difficulty: 'medium' },
    { id: 8,  title: 'Full Keyboard',         desc: 'All keys together — the full workout',     keys: [],                                 duration: '15 min', difficulty: 'hard'   },
    { id: 9,  title: 'Speed Burst 1',         desc: 'Short bursts targeting 40+ WPM',           keys: [],                                 duration: '10 min', difficulty: 'hard'   },
    { id: 10, title: 'Speed Burst 2',         desc: 'Push for 60+ WPM with accuracy',           keys: [],                                 duration: '10 min', difficulty: 'hard'   },
  ],
  prog: [
    { id: 1, title: 'Brackets & Braces',   desc: '() [] {} — developer essentials',            keys: ['(',')','[',']','{','}'],           duration: '8 min',  difficulty: 'medium' },
    { id: 2, title: 'Operators',           desc: '= + - * / == != <= >= && ||',                keys: ['+','-','*','/','=','!'],           duration: '10 min', difficulty: 'medium' },
    { id: 3, title: 'Special Characters', desc: '@ # $ % ^ & * ! ~ \' " \\',                  keys: ['@','#','$','%','^','&'],           duration: '10 min', difficulty: 'hard'   },
    { id: 4, title: 'JavaScript Snippets',desc: 'Real JS code patterns: const, arrow fns',     keys: [],                                 duration: '15 min', difficulty: 'hard'   },
    { id: 5, title: 'Python Snippets',    desc: 'Real Python code: def, for, with, lambda',    keys: [],                                 duration: '15 min', difficulty: 'hard'   },
  ],
  num: [
    { id: 1, title: 'Number Row',           desc: '0–9 digits with both hands',                keys: ['1','2','3','4','5','6','7','8','9','0'], duration: '6 min',  difficulty: 'easy'   },
    { id: 2, title: 'Decimals & Dates',     desc: 'Numbers with dots, commas and slashes',     keys: ['.',',','/'],                      duration: '8 min',  difficulty: 'medium' },
    { id: 3, title: 'Numbers & Symbols',    desc: 'Combining digits with % $ # @',             keys: ['%','$','#','@'],                  duration: '10 min', difficulty: 'hard'   },
  ],
}

const DIFF_COLOR = { easy: '#57ffd8', medium: '#e8ff57', hard: '#ff6b6b' }
const DIFF_BG    = { easy: 'rgba(87,255,216,0.08)', medium: 'rgba(232,255,87,0.08)', hard: 'rgba(255,107,107,0.08)' }

export default function CoursesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tc_completed') || '{}') } catch { return {} }
  })

  function startLesson(tab, id) {
    navigate(`/typing?lesson=${id}&tab=${tab}`)
  }

  function markDone(tab, id) {
    const key = `${tab}-${id}`
    const next = { ...completed, [key]: true }
    setCompleted(next)
    localStorage.setItem('tc_completed', JSON.stringify(next))
  }

  const courses = COURSES[activeTab]
  const doneCount = courses.filter(c => completed[`${activeTab}-${c.id}`]).length

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 900, margin: '0 auto', padding: '80px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📖</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 10 }}>Courses</h1>
        <p style={{ color: '#9090a8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>Structured lessons from home row to speed demon.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 22px', borderRadius: 10, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14,
            background: activeTab === t.id ? '#e8ff57' : '#131318',
            color: activeTab === t.id ? '#0c0c10' : '#9090a8',
            border: activeTab === t.id ? '1px solid transparent' : '1px solid rgba(255,255,255,0.06)',
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#e8ff57', borderRadius: 3, width: `${(doneCount / courses.length) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e8ff57', whiteSpace: 'nowrap' }}>
          {doneCount} / {courses.length} done
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {courses.map((lesson, idx) => {
          const key = `${activeTab}-${lesson.id}`
          const isDone = !!completed[key]
          const isLocked = idx > 0 && !completed[`${activeTab}-${courses[idx - 1].id}`]

          return (
            <div key={lesson.id} style={{
              background: '#131318',
              border: `1px solid ${isDone ? 'rgba(87,255,216,0.2)' : isLocked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 14, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
              opacity: isLocked ? 0.45 : 1,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: isDone ? 'rgba(87,255,216,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isDone ? 'rgba(87,255,216,0.3)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18,
                color: isDone ? '#57ffd8' : '#55556a',
              }}>{isDone ? '✓' : lesson.id}</div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 17, color: isDone ? '#57ffd8' : '#f0f0f8' }}>{lesson.title}</h3>
                  <span style={{ padding: '2px 10px', borderRadius: 100, background: DIFF_BG[lesson.difficulty], color: DIFF_COLOR[lesson.difficulty], fontFamily: 'JetBrains Mono, monospace', fontSize: 11, border: `1px solid ${DIFF_COLOR[lesson.difficulty]}30` }}>{lesson.difficulty}</span>
                </div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9090a8', fontSize: 14, marginBottom: lesson.keys.length ? 8 : 0 }}>{lesson.desc}</p>
                {lesson.keys.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {lesson.keys.map(k => (
                      <span key={k} style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#e8ff57' }}>{k}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>⏱ {lesson.duration}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {isDone && (
                    <button onClick={() => startLesson(activeTab, lesson.id)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(87,255,216,0.2)', background: 'transparent', color: '#57ffd8', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>Retry</button>
                  )}
                  <button
                    disabled={isLocked}
                    onClick={() => { if (!isLocked) { if (!isDone) startLesson(activeTab, lesson.id); else markDone(activeTab, lesson.id) } }}
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: isLocked ? 'not-allowed' : 'pointer', background: isLocked ? '#1a1a22' : isDone ? 'rgba(255,255,255,0.04)' : '#e8ff57', color: isLocked ? '#55556a' : isDone ? '#9090a8' : '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13 }}>
                    {isLocked ? '🔒 Locked' : isDone ? 'Done ✓' : 'Start →'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 40, background: 'rgba(232,255,87,0.04)', border: '1px solid rgba(232,255,87,0.1)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 17, color: '#e8ff57', marginBottom: 10 }}>💡 Pro tips</h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Always return fingers to the home row (ASDF · JKL;) after each keystroke.',
            'Prioritise accuracy over speed — speed comes naturally with practice.',
            'Complete lessons in order; each one builds on the previous.',
            'Ten minutes of daily focused practice beats one hour once a week.',
          ].map(tip => (
            <li key={tip} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9090a8', display: 'flex', gap: 10 }}>
              <span style={{ color: '#e8ff57', flexShrink: 0 }}>→</span> {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
