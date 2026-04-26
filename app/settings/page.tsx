'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [font, setFont] = useState('JetBrains Mono')
  const [fontSize, setFontSize] = useState(20)
  const [showKbd, setShowKbd] = useState(true)
  const [sound, setSound] = useState(false)
  const [liveWpm, setLiveWpm] = useState(true)
  const [caretStyle, setCaretStyle] = useState('line')
  const [lang, setLang] = useState('english')

  const Toggle = ({ v, set }: { v: boolean, set: (x: boolean) => void }) => (
    <button onClick={() => set(!v)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: v ? '#e8ff57' : 'rgba(255,255,255,0.08)',
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
    }}>
      <span style={{ position: 'absolute', top: 3, left: v ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: v ? '#0c0c10' : '#55556a', transition: 'left 0.2s' }} />
    </button>
  )

  const Section = ({ icon, title, children }: any) => (
    <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16 }}>{title}</span>
      </div>
      {children}
    </div>
  )

  const Row = ({ label, sub, control }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 15, color: '#f0f0f8' }}>{label}</div>
        {sub && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a', marginTop: 2 }}>{sub}</div>}
      </div>
      {control}
    </div>
  )

  const Select = ({ val, set, opts }: any) => (
    <select value={val} onChange={e => set(e.target.value)} style={{ padding: '6px 12px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f8', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
      {opts.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', marginBottom: 8 }}>Settings</h1>
      <p style={{ color: '#9090a8', fontFamily: 'DM Sans, sans-serif', marginBottom: 36 }}>Personalize your TypeCraft experience</p>

      <Section icon="🎨" title="Appearance">
        <Row label="Font" sub="Monospace font for typing area" control={<Select val={font} set={setFont} opts={['JetBrains Mono','Fira Code','Source Code Pro','IBM Plex Mono']} />} />
        <Row label="Font size" sub={`Current: ${fontSize}px`} control={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={14} max={28} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={{ width: 100, accentColor: '#e8ff57' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#e8ff57', width: 28 }}>{fontSize}</span>
          </div>
        } />
        <Row label="Caret style" sub="How the cursor looks" control={
          <div style={{ display: 'flex', gap: 4 }}>
            {['line','block','under'].map(s => (
              <button key={s} onClick={() => setCaretStyle(s)} style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${caretStyle === s ? '#e8ff57' : 'rgba(255,255,255,0.08)'}`, background: caretStyle === s ? 'rgba(232,255,87,0.08)' : 'transparent', color: caretStyle === s ? '#e8ff57' : '#55556a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        } />
      </Section>

      <Section icon="⚙️" title="Behavior">
        <Row label="Show live WPM" sub="Display WPM counter while typing" control={<Toggle v={liveWpm} set={setLiveWpm} />} />
        <Row label="Show virtual keyboard" sub="Finger placement guide" control={<Toggle v={showKbd} set={setShowKbd} />} />
        <Row label="Sound effects" sub="Keyboard click sounds" control={<Toggle v={sound} set={setSound} />} />
      </Section>

      <Section icon="🌍" title="Language">
        <Row label="Word language" sub="Language for words mode" control={<Select val={lang} set={setLang} opts={['english','arabic','french','spanish','german','italian']} />} />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <button style={{ padding: '11px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#9090a8', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Reset defaults</button>
        <button style={{ padding: '11px 24px', borderRadius: 10, border: 'none', background: '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Save settings</button>
      </div>
    </div>
  )
}
