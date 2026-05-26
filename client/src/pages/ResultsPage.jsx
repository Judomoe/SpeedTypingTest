import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

function getGrade(wpm) {
  if (wpm >= 120) return { grade: 'S', color: '#e8ff57', label: 'Legendary' }
  if (wpm >= 100) return { grade: 'A+', color: '#57ffd8', label: 'Elite' }
  if (wpm >= 80)  return { grade: 'A',  color: '#57ffd8', label: 'Excellent' }
  if (wpm >= 60)  return { grade: 'B',  color: '#c084fc', label: 'Good' }
  if (wpm >= 40)  return { grade: 'C',  color: '#9090a8', label: 'Average' }
  return            { grade: 'D',  color: '#ff6b6b', label: 'Keep going' }
}

function Counter({ to, suffix = '', duration = 800 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(to * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to, duration])
  return <>{val}{suffix}</>
}

function WpmChart({ wpmData, rawData, errData }) {
  const pathRef = useRef(null)
  const rawRef  = useRef(null)
  const [drawn, setDrawn] = useState(false)

  const W = 640, H = 220
  const pL = 44, pR = 36, pT = 16, pB = 32
  const cW = W - pL - pR, cH = H - pT - pB
  const n = wpmData.length

  useEffect(() => { const t = setTimeout(() => setDrawn(true), 80); return () => clearTimeout(t) }, [])

  if (!n) return null

  const maxWpm = Math.max(...wpmData, ...rawData, 10)
  const roundMax = Math.ceil(maxWpm / 10) * 10 + 20
  const maxErr = Math.max(...errData, 4)

  const toX  = i => pL + (n <= 1 ? cW / 2 : (i / (n - 1)) * cW)
  const toY  = v => pT + cH - Math.min(1, Math.max(0, v / roundMax)) * cH
  const toYE = v => pT + cH - Math.min(1, Math.max(0, v / maxErr)) * cH

  const smooth = (pts) => {
    if (!pts.length) return ''
    let d = `M${pts[0][0]},${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const [x0,y0] = pts[i-1], [x1,y1] = pts[i], mx = (x0+x1)/2
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`
    }
    return d
  }

  const wpmPts = wpmData.map((v,i) => [toX(i), toY(v)])
  const rawPts = rawData.map((v,i) => [toX(i), toY(v)])
  const avgWpm = wpmData.reduce((a,b) => a+b, 0) / n
  const wpmPath = smooth(wpmPts)
  const rawPath = smooth(rawPts)
  const areaPath = wpmPath + ` L${toX(n-1)},${pT+cH} L${pL},${pT+cH} Z`
  const yTicks = [0,0.25,0.5,0.75,1].map(p => ({ y: pT+p*cH, val: Math.round(roundMax*(1-p)) }))
  const step = Math.max(1, Math.ceil(n / 10))
  const xTicks = Array.from({length:n},(_,i)=>i).filter(i => i%step===0||i===n-1)
  const pathLen = pathRef.current?.getTotalLength() ?? 2000
  const rawLen  = rawRef.current?.getTotalLength()  ?? 2000

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e8ff57" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#e8ff57" stopOpacity="0"    />
        </linearGradient>
        <clipPath id="chartClip"><rect x={pL} y={0} width={cW} height={H} /></clipPath>
      </defs>
      {yTicks.map(({y,val}) => (
        <g key={val}>
          <line x1={pL} y1={y} x2={W-pR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <text x={pL-8} y={y+4} textAnchor="end" fill="#3a3a50" fontSize="10" fontFamily="JetBrains Mono, monospace">{val}</text>
        </g>
      ))}
      {xTicks.map(i => (
        <text key={i} x={toX(i)} y={H-4} textAnchor="middle" fill="#3a3a50" fontSize="10" fontFamily="JetBrains Mono, monospace">{i+1}</text>
      ))}
      <g clipPath="url(#chartClip)">
        <path d={areaPath} fill="url(#areaGrad)" />
        <line x1={pL} y1={toY(avgWpm)} x2={W-pR} y2={toY(avgWpm)} stroke="#e8ff57" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
        <path ref={rawRef} d={rawPath} fill="none" stroke="#9090a8" strokeWidth="1.5" opacity="0.35"
          style={{ strokeDasharray:rawLen, strokeDashoffset:drawn?0:rawLen, transition:'stroke-dashoffset 1.2s ease' }} />
        <path ref={pathRef} d={wpmPath} fill="none" stroke="#e8ff57" strokeWidth="2.5" strokeLinecap="round"
          style={{ strokeDasharray:pathLen, strokeDashoffset:drawn?0:pathLen, transition:'stroke-dashoffset 1s ease' }} />
        {wpmPts.map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#e8ff57" stroke="#0c0c10" strokeWidth="1.5"
            style={{ opacity:drawn?1:0, transition:`opacity 0.2s ${0.8+i*0.02}s` }} />
        ))}
        {errData.map((err,i) => {
          const prev = i>0?errData[i-1]:0
          if (err<=prev) return null
          return (
            <g key={i}>
              <circle cx={toX(i)} cy={toYE(err)} r="5" fill="rgba(255,107,107,0.15)" stroke="#ff6b6b" strokeWidth="1" />
              <text x={toX(i)} y={toYE(err)+4} textAnchor="middle" fill="#ff6b6b" fontSize="8" fontFamily="JetBrains Mono, monospace">✕</text>
            </g>
          )
        })}
      </g>
      <rect x={pL} y={pT} width={cW} height={cH} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
    </svg>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [visible, setVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    try { const raw = sessionStorage.getItem('tc_result'); if (raw) setResult(JSON.parse(raw)) } catch {}
    try { setIsLoggedIn(!!localStorage.getItem('tc_session')) } catch {}
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let tabDown = false
    const down = (e) => { if (e.key==='Tab'){e.preventDefault();tabDown=true} if (e.key==='Enter'&&tabDown) navigate('/typing') }
    const up = (e) => { if (e.key==='Tab') tabDown=false }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [navigate])

  if (!result) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:24, padding:24 }}>
        <div style={{ width:64,height:64,borderRadius:16,border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>📊</div>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily:'Outfit, sans-serif',fontWeight:700,fontSize:20,color:'#f0f0f8',marginBottom:8 }}>No result found</p>
          <p style={{ fontFamily:'JetBrains Mono, monospace',fontSize:13,color:'#55556a' }}>Complete a typing test to see your results here</p>
        </div>
        <Link to="/typing" style={{ padding:'12px 32px',borderRadius:10,background:'#e8ff57',color:'#0c0c10',fontFamily:'Outfit, sans-serif',fontWeight:700,fontSize:15,textDecoration:'none' }}>Start a test →</Link>
      </div>
    )
  }

  const { wpm, rawWpm, acc, consistency, correct, incorrect, extra, missed, dur, mode, wpmData, rawData, errData } = result
  const { grade, color: gradeColor, label: gradeLabel } = getGrade(wpm)
  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ${delay}s ease, transform 0.5s ${delay}s ease`,
  })

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'90px 24px 60px' }}>
      <div style={{ width:'100%', maxWidth:780 }}>
        <div style={{ ...fadeUp(0), background:'#131318', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'28px 32px', marginBottom:10, display:'grid', gridTemplateColumns:'110px 1fr', gap:36, alignItems:'center' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {['wpm','acc'].map((label,li) => (
              <div key={label}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'#55556a', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
                <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:900, fontSize:76, color:'#e8ff57', lineHeight:1, letterSpacing:'-0.04em' }}>
                  <Counter to={li===0?wpm:acc} suffix={li===1?'%':''} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <WpmChart wpmData={wpmData} rawData={rawData} errData={errData} />
            <div style={{ display:'flex', gap:20, marginTop:10, justifyContent:'flex-end' }}>
              {[{color:'#e8ff57',label:'wpm'},{color:'#9090a8',label:'raw'},{color:'#ff6b6b',label:'errors'}].map(l => (
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'JetBrains Mono, monospace', fontSize:10, color:'#55556a' }}>
                  <span style={{ display:'inline-block', width:20, height:2, background:l.color, borderRadius:2 }} />{l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...fadeUp(0.08), background:'#131318', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'22px 32px', marginBottom:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:'140px 1px 80px 1px minmax(0,1fr) 1px 90px 1px 80px', gap:0, alignItems:'start' }}>
            <div style={{ paddingRight:24 }}>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#55556a', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>test type</div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:14, color:'#e8ff57', lineHeight:2 }}>time {dur}<br />{mode}</div>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.05)', alignSelf:'stretch', margin:'0 24px' }} />
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#55556a', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>raw</div>
              <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:800, fontSize:40, color:'#e8ff57', letterSpacing:'-0.02em', lineHeight:1 }}>{rawWpm}</div>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.05)', alignSelf:'stretch', margin:'0 24px' }} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#55556a', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>characters</div>
              <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:800, fontSize:28, color:'#f0f0f8', letterSpacing:'-0.02em', lineHeight:1, display:'flex', gap:2, flexWrap:'wrap' }}>
                <span style={{ color:'#57ffd8' }}>{correct}</span>
                <span style={{ color:'#55556a', fontWeight:400, fontSize:24 }}>/</span>
                <span style={{ color:'#ff6b6b' }}>{incorrect}</span>
                <span style={{ color:'#55556a', fontWeight:400, fontSize:24 }}>/</span>
                <span style={{ color:'#9090a8' }}>{extra}</span>
                <span style={{ color:'#55556a', fontWeight:400, fontSize:24 }}>/</span>
                <span style={{ color:'#55556a' }}>{missed}</span>
              </div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, color:'#3a3a50', marginTop:6, display:'flex', gap:8 }}>
                <span style={{ color:'#57ffd8' }}>correct</span><span>/</span>
                <span style={{ color:'#ff6b6b' }}>incorrect</span><span>/</span>
                <span>extra</span><span>/</span><span>missed</span>
              </div>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.05)', alignSelf:'stretch', margin:'0 24px' }} />
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#55556a', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>consistency</div>
              <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:800, fontSize:40, color:'#e8ff57', letterSpacing:'-0.02em', lineHeight:1 }}>{consistency}%</div>
            </div>
            <div style={{ width:1, background:'rgba(255,255,255,0.05)', alignSelf:'stretch', margin:'0 24px' }} />
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#55556a', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>time</div>
              <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:800, fontSize:40, color:'#e8ff57', letterSpacing:'-0.02em', lineHeight:1 }}>{dur}s</div>
            </div>
          </div>
        </div>

        <div style={{ ...fadeUp(0.16), background:'#131318', border:'1px solid rgba(255,255,255,0.06)', borderRadius:18, padding:'18px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:52, height:52, borderRadius:12, border:`1px solid ${gradeColor}30`, background:`${gradeColor}08`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontFamily:'Outfit, sans-serif', fontWeight:900, fontSize:22, color:gradeColor, lineHeight:1 }}>{grade}</span>
              <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:8, color:gradeColor, opacity:0.6, marginTop:2, letterSpacing:'0.05em' }}>{gradeLabel.toLowerCase()}</span>
            </div>
            <div style={{ width:1, height:36, background:'rgba(255,255,255,0.06)' }} />
            <div style={{ display:'flex', gap:8 }}>
              {[
                { to: '/typing', label: '›', title: 'next test', highlight: true },
                { to: '/typing', label: '↺', title: 'restart' },
                { to: '/leaderboard', label: '≡', title: 'leaderboard' },
                { to: '/profile', label: '⏮', title: 'history' },
              ].map(btn => (
                <Link key={btn.label+btn.to} to={btn.to} title={btn.title} style={{
                  width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center',
                  borderRadius:10, border: btn.highlight ? '1px solid rgba(232,255,87,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  background: btn.highlight ? 'rgba(232,255,87,0.08)' : 'rgba(255,255,255,0.02)',
                  fontFamily:'JetBrains Mono, monospace', fontSize:18,
                  color: btn.highlight ? '#e8ff57' : '#55556a', textDecoration:'none',
                }}>{btn.label}</Link>
              ))}
            </div>
          </div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13 }}>
            {isLoggedIn ? (
              <span style={{ color:'#57ffd8', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#57ffd8', display:'inline-block' }} />
                result saved to your profile
              </span>
            ) : (
              <span style={{ color:'#55556a' }}>
                <Link to="/login" style={{ color:'#e8ff57', textDecoration:'none' }}>sign in</Link>{' '}to save your result
              </span>
            )}
          </div>
        </div>

        <p style={{ ...fadeUp(0.24), textAlign:'center', marginTop:24, fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'#3a3a50' }}>
          press{' '}
          <kbd style={{ padding:'2px 7px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:5, color:'#55556a', fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>tab</kbd>
          {' '}+{' '}
          <kbd style={{ padding:'2px 7px', border:'1px solid rgba(255,255,255,0.08)', borderRadius:5, color:'#55556a', fontFamily:'JetBrains Mono, monospace', fontSize:11 }}>enter</kbd>
          {' '}to restart
        </p>
      </div>
    </div>
  )
}
