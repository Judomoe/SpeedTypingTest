'use client'
import { useState } from 'react'

const ROOMS = [
  { id: '1', name: 'Elite Racers', players: 3, max: 4, mode: 'words', diff: 'hard', host: 'velocityKeys' },
  { id: '2', name: 'Code Warriors', players: 2, max: 4, mode: 'code', diff: 'medium', host: 'NightOwlType' },
  { id: '3', name: 'Chill Session', players: 1, max: 4, mode: 'quotes', diff: 'easy', host: 'newTyper42' },
]

const DIFF_C: Record<string, string> = { easy: '#57ffd8', medium: '#e8ff57', hard: '#ff6b6b' }

export default function MultiplayerPage() {
  const [tab, setTab] = useState('browse')
  const [code, setCode] = useState('')

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 860, margin: '0 auto', padding: '80px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>⚔️</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em', marginBottom: 10 }}>Versus Mode</h1>
        <p style={{ color: '#9090a8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}>Race real opponents. May the fastest fingers win.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, cursor: 'pointer' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#e8ff57', marginBottom: 8 }}>Quick Match</h3>
          <p style={{ color: '#9090a8', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>Jump in instantly with a random opponent. No waiting.</p>
          <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Find Match →</button>
        </div>
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔗</div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#57ffd8', marginBottom: 8 }}>Join with Code</h3>
          <p style={{ color: '#9090a8', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>Enter a room code from a friend.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ABCD-1234" maxLength={9}
              style={{ flex: 1, padding: '10px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f8', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, outline: 'none' }} />
            <button style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#57ffd8', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Join</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
          {['browse','create'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: tab === t ? 'rgba(232,255,87,0.1)' : 'transparent', color: tab === t ? '#e8ff57' : '#55556a' }}>{t}</button>
          ))}
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a' }}>{ROOMS.length} rooms active</span>
      </div>

      {tab === 'browse' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROOMS.map(r => (
            <div key={r.id} style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {r.mode === 'code' ? '💻' : r.mode === 'quotes' ? '💬' : '📝'}
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{r.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>
                    by {r.host} · {r.mode} · <span style={{ color: DIFF_C[r.diff] }}>{r.diff}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: r.max }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < r.players ? '#57ffd8' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8' }}>{r.players}/{r.max}</span>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'rgba(232,255,87,0.1)', color: '#e8ff57', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Join</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 28 }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Create a Room</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[['Room name','text','My Typing Race'],['Max players','number','4']].map(([l,t,p]:any) => (
              <div key={l}>
                <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8 }}>{l}</label>
                <input type={t} placeholder={p} style={{ width: '100%', padding: '11px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }} />
              </div>
            ))}
          </div>
          <button style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Create Room</button>
        </div>
      )}
    </div>
  )
}
