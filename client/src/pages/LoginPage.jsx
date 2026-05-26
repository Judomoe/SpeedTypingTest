import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#e8ff57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 22, color: '#0c0c10', margin: '0 auto 20px' }}>TC</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#9090a8', fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>Sign in to track your progress</p>
        </div>

        <div style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 32 }}>
          {error && (
            <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 16px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'DM Sans, sans-serif', fontSize: 15, outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0f0f8', fontFamily: 'DM Sans, sans-serif', fontSize: 15, outline: 'none' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: loading ? '#2a2a35' : '#e8ff57', color: '#0c0c10', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />

          <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9090a8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#e8ff57', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#55556a' }}>
          Or{' '}
          <Link to="/typing" style={{ color: '#9090a8', textDecoration: 'none' }}>continue without an account →</Link>
        </p>
      </div>
    </div>
  )
}
