import { useSettings } from '../context/SettingsContext'

export default function SettingsPage() {
  const { settings, update, reset } = useSettings()

  const Toggle = ({ k }) => (
    <button onClick={() => update(k, !settings[k])} style={{
      width: 44, height: 24, borderRadius: 12,
      background: settings[k] ? '#e8ff57' : 'rgba(255,255,255,0.08)',
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
    }}>
      <span style={{ position:'absolute', top:3, left: settings[k] ? 23 : 3, width:18, height:18, borderRadius:'50%', background: settings[k] ? '#0c0c10' : '#55556a', transition:'left 0.2s' }} />
    </button>
  )

  const Section = ({ icon, title, children }) => (
    <div style={{ background:'#131318', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
      <div style={{ padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <span style={{ fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:16 }}>{title}</span>
      </div>
      {children}
    </div>
  )

  const Row = ({ label, sub, control }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:500, fontSize:15, color:'#f0f0f8' }}>{label}</div>
        {sub && <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'#55556a', marginTop:2 }}>{sub}</div>}
      </div>
      {control}
    </div>
  )

  const Select = ({ k, opts }) => (
    <select value={settings[k]} onChange={e => update(k, e.target.value)} style={{
      padding:'6px 12px', background:'#1a1a22', border:'1px solid rgba(255,255,255,0.1)',
      borderRadius:8, color:'#f0f0f8', fontFamily:'JetBrains Mono, monospace', fontSize:13, outline:'none', cursor:'pointer',
    }}>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ minHeight:'100vh', paddingTop:60, maxWidth:680, margin:'0 auto', padding:'80px 24px 60px' }}>
      <h1 style={{ fontFamily:'Outfit, sans-serif', fontWeight:800, fontSize:40, letterSpacing:'-0.03em', marginBottom:8 }}>Settings</h1>
      <p style={{ color:'#9090a8', fontFamily:'DM Sans, sans-serif', marginBottom:36 }}>Personalize your TypeCraft experience. Changes apply instantly across all pages.</p>

      <Section icon="🎨" title="Appearance">
        <Row label="Font" sub="Monospace font for typing area" control={
          <Select k="font" opts={['JetBrains Mono','Fira Code','Source Code Pro','IBM Plex Mono','Courier New','Consolas']} />
        } />
        <Row label="Font size" sub={`Current: ${settings.fontSize}px`} control={
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <input type="range" min={14} max={28} value={settings.fontSize} onChange={e => update('fontSize', +e.target.value)}
              style={{ width:100, accentColor:'#e8ff57' }} />
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:14, color:'#e8ff57', width:28 }}>{settings.fontSize}</span>
          </div>
        } />
        <Row label="Caret style" sub="How the cursor looks" control={
          <div style={{ display:'flex', gap:4 }}>
            {['line','block','under'].map(s => (
              <button key={s} onClick={() => update('caretStyle', s)} style={{
                padding:'5px 12px', borderRadius:6,
                border:`1px solid ${settings.caretStyle===s ? '#e8ff57' : 'rgba(255,255,255,0.08)'}`,
                background: settings.caretStyle===s ? 'rgba(232,255,87,0.08)' : 'transparent',
                color: settings.caretStyle===s ? '#e8ff57' : '#55556a',
                fontFamily:'JetBrains Mono, monospace', fontSize:12, cursor:'pointer',
              }}>{s}</button>
            ))}
          </div>
        } />
      </Section>

      <Section icon="⚙️" title="Behavior">
        <Row label="Show live WPM" sub="Display WPM counter while typing" control={<Toggle k="showLiveWpm" />} />
        <Row label="Show virtual keyboard" sub="Finger placement guide" control={<Toggle k="showKbd" />} />
        <Row label="Sound effects" sub="Keyboard click sounds" control={<Toggle k="sound" />} />
      </Section>

      <Section icon="🌍" title="Language">
        <Row label="Word language" sub="Language for words mode" control={
          <Select k="language" opts={['english','arabic','french','spanish','german','italian']} />
        } />
      </Section>

      {/* Live preview */}
      <div style={{ background:'#131318', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14, padding:24, marginBottom:24 }}>
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'#55556a', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.08em' }}>
          Preview
        </div>
        <p style={{ fontFamily:`'${settings.font}', monospace`, fontSize:settings.fontSize, lineHeight:1.9, color:'#55556a' }}>
          <span style={{ color:'#57ffd8' }}>the quick brown </span>
          <span style={{ color:'#f0f0f8' }}>f</span>
          <span style={{ display:'inline-block', width: settings.caretStyle==='line' ? 2 : settings.caretStyle==='block' ? '0.65em' : '0.65em', height: settings.caretStyle==='under' ? 2 : '1.1em', background:'#e8ff57', verticalAlign: settings.caretStyle==='under' ? 'bottom' : 'text-bottom', animation:'blink 1.1s step-end infinite' }} />
          <span style={{ color:'#55556a' }}>ox jumps over</span>
        </p>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:8 }}>
        <button onClick={reset} style={{ padding:'11px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'transparent', color:'#9090a8', fontFamily:'DM Sans, sans-serif', fontWeight:500, fontSize:14, cursor:'pointer' }}>Reset defaults</button>
        <button style={{ padding:'11px 24px', borderRadius:10, border:'none', background:'#e8ff57', color:'#0c0c10', fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}
          onClick={() => alert('Settings saved! They apply instantly across all pages.')}>Save settings ✓</button>
      </div>
    </div>
  )
}
