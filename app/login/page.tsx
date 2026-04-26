'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !pw) { setError('Please fill in all fields'); return }
    setLoading(true)
    const result = loginUser(email, pw)
    setLoading(false)
    if (!result.success) { setError(result.error || 'Login failed'); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e8ff57', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13, color: '#0c0c10' }}>TC</div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#f0f0f8' }}>Type<span style={{ color: '#e8ff57' }}>Craft</span></span>
          </Link>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: '#9090a8', fontFamily: 'DM Sans, sans-serif' }}>Sign in to track your progress</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#ff6b6b' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', padding: '12px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#f0f0f8', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#9090a8', marginBottom: 8 }}>Password</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', background: '#1a1a22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#f0f0f8', outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, background: loading ? '#55556a' : '#e8ff57', color: '#0c0c10', transition: 'background 0.15s' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#55556a', fontFamily: 'DM Sans, sans-serif' }}>
          No account?{' '}
          <Link href="/register" style={{ color: '#e8ff57', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
