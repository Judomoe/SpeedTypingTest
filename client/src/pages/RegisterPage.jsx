import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Fields defined OUTSIDE component so React doesn't remount on each render
function Field({ label, type, value, onChange, placeholder, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} required
        placeholder={placeholder}
        style={{ width: '100%', padding: '12px 16px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'DM Sans, sans-serif', fontSize: 15, outline: 'none' }}
      />
      {hint && <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (username.length < 3) return setError('Username must be at least 3 characters')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#e8ff57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 22, color: '#0c0c10', margin: '0 auto 20px' }}>TC</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginBottom: 8 }}>Create account</h1>
          <p style={{ color: '#9090a8', fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>Free forever. No credit card needed.</p>
        </div>

        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="speedtyper42" hint="3–20 characters, shown on leaderboard" />
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" hint="Minimum 8 characters" />

            <div style={{ marginBottom: 24 }}>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, transition: 'width 0.3s, background 0.3s',
                  width: password.length === 0 ? '0%' : password.length < 8 ? '33%' : password.length < 12 ? '66%' : '100%',
                  background: password.length < 8 ? '#ff6b6b' : password.length < 12 ? '#e8ff57' : '#57ffd8',
                }} />
              </div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginTop: 4 }}>
                {password.length === 0 ? '' : password.length < 8 ? 'weak' : password.length < 12 ? 'good' : 'strong'}
              </p>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: loading ? '#2a2a35' : '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account…' : 'Get started →'}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />
          <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9090a8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#e8ff57', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
