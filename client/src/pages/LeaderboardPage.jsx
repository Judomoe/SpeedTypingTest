import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:4000/api'
const MEDAL = ['🥇','🥈','🥉']
const COUNTRY_FLAGS = { EG:'🇪🇬', US:'🇺🇸', JP:'🇯🇵', KR:'🇰🇷', DE:'🇩🇪', GB:'🇬🇧', FR:'🇫🇷', CA:'🇨🇦', SE:'🇸🇪', AU:'🇦🇺', BR:'🇧🇷', IN:'🇮🇳' }

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('all')
  const [mode, setMode] = useState('words')
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`${API}/leaderboard?mode=${mode}&period=${period}`)
      .then(r => r.json())
      .then(d => {
        setLeaders(d.leaders || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load leaderboard. Is the server running?')
        setLoading(false)
      })
  }, [period, mode])

  const podium = leaders.slice(0, 3)

  return (
    <div style={{ minHeight:'100vh', paddingTop:60, maxWidth:860, margin:'0 auto', padding:'80px 24px 60px' }}>
      <div style={{ textAlign:'center', marginBottom:56 }}>
        <div style={{ fontSize:52, marginBottom:12 }}>🏆</div>
        <h1 style={{ fontFamily:'Outfit, sans-serif', fontWeight:900, fontSize:52, letterSpacing:'-0.04em', marginBottom:10 }}>Leaderboard</h1>
        <p style={{ color:'#9090a8', fontFamily:'JetBrains Mono, monospace', fontSize:14 }}>The world's fastest. Where do you stand?</p>
      </div>

      <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:48, flexWrap:'wrap' }}>
        {[['today','Today'],['week','This Week'],['all','All Time']].map(([v,l]) => (
          <button key={v} onClick={() => setPeriod(v)} style={{
            padding:'8px 20px', borderRadius:8,
            border:`1px solid ${period===v ? '#e8ff57' : 'rgba(255,255,255,0.08)'}`,
            background: period===v ? 'rgba(232,255,87,0.08)' : 'transparent',
            fontFamily:'JetBrains Mono, monospace', fontSize:13,
            color: period===v ? '#e8ff57' : '#9090a8', cursor:'pointer',
          }}>{l}</button>
        ))}
        <div style={{ width:1, background:'rgba(255,255,255,0.08)' }} />
        {['words','quotes','code'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'8px 20px', borderRadius:8,
            border:`1px solid ${mode===m ? '#57ffd8' : 'rgba(255,255,255,0.08)'}`,
            background: mode===m ? 'rgba(87,255,216,0.08)' : 'transparent',
            fontFamily:'JetBrains Mono, monospace', fontSize:13,
            color: mode===m ? '#57ffd8' : '#9090a8', cursor:'pointer',
          }}>{m}</button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.06)', borderTopColor:'#e8ff57', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
          <p style={{ fontFamily:'JetBrains Mono, monospace', color:'#55556a', fontSize:13 }}>Loading leaderboard…</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign:'center', padding:40 }}>
          <p style={{ color:'#ff6b6b', fontFamily:'JetBrains Mono, monospace', fontSize:14 }}>{error}</p>
        </div>
      )}

      {!loading && !error && leaders.length === 0 && (
        <div style={{ textAlign:'center', padding:60 }}>
          <p style={{ fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:20, color:'#f0f0f8', marginBottom:8 }}>No scores yet</p>
          <p style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color:'#55556a' }}>Be the first to set a record!</p>
        </div>
      )}

      {!loading && !error && leaders.length >= 3 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:20, marginBottom:48 }}>
          {[podium[1], podium[0], podium[2]].map((p, i) => {
            if (!p) return null
            const heights = [110, 140, 90]
            const colors = ['#b0b0b8','#e8ff57','#cd7f32']
            const pos = [2,1,3]
            return (
              <div key={p.username} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div style={{ fontSize:20 }}>{p.country ? (COUNTRY_FLAGS[p.country] || '🌍') : '🌍'}</div>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, color:'#f0f0f8', fontWeight:600 }}>{p.username}</div>
                <div style={{ fontFamily:'Outfit, sans-serif', fontWeight:800, fontSize:24, color:colors[i] }}>{p.wpm}</div>
                <div style={{ width:80, height:heights[i], borderRadius:'10px 10px 0 0', background:`${colors[i]}15`, border:`2px solid ${colors[i]}30`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit, sans-serif', fontWeight:900, fontSize:36, color:colors[i] }}>{pos[i]}</div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && leaders.length > 0 && (
        <div style={{ background:'#131318', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'50px 1fr 80px 80px 80px', padding:'12px 24px', borderBottom:'1px solid rgba(255,255,255,0.05)', fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#55556a', textTransform:'uppercase', letterSpacing:'0.08em' }}>
            <span>#</span><span>player</span>
            <span style={{ textAlign:'right' }}>wpm</span>
            <span style={{ textAlign:'right' }}>acc</span>
            <span style={{ textAlign:'right' }}>tests</span>
          </div>

          {leaders.map(p => {
            const isYou = user && p.username === user.username
            return (
              <div key={p.rank} style={{
                display:'grid', gridTemplateColumns:'50px 1fr 80px 80px 80px',
                alignItems:'center', padding:'16px 24px',
                borderBottom:'1px solid rgba(255,255,255,0.04)',
                background: isYou ? 'rgba(232,255,87,0.04)' : 'transparent',
                borderLeft: isYou ? '3px solid #e8ff57' : '3px solid transparent',
              }}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:16 }}>
                  {p.rank <= 3 ? MEDAL[p.rank-1] : <span style={{ color:'#55556a' }}>{p.rank}</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:34, height:34, borderRadius:'50%', background: isYou ? '#e8ff57' : 'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:13, color: isYou ? '#0c0c10' : '#9090a8' }}>
                    {p.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily:'DM Sans, sans-serif', fontWeight:500, fontSize:14, color: isYou ? '#e8ff57' : '#f0f0f8' }}>
                      {p.username} {isYou && <span style={{ fontSize:11, color:'#55556a' }}>(you)</span>}
                    </div>
                    <div style={{ fontSize:13 }}>{p.country ? (COUNTRY_FLAGS[p.country] || p.country) : '🌍'}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right', fontFamily:'Outfit, sans-serif', fontWeight:700, fontSize:20, color: p.rank<=3 ? ['#e8ff57','#b0b0b8','#cd7f32'][p.rank-1] : '#f0f0f8' }}>{p.wpm}</div>
                <div style={{ textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontSize:13, color:'#9090a8' }}>{p.acc}%</div>
                <div style={{ textAlign:'right', fontFamily:'JetBrains Mono, monospace', fontSize:13, color:'#55556a' }}>{(p.tests||0).toLocaleString()}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
