'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getSession, logoutUser, type AuthUser } from '@/lib/auth-client'

const NAV = [
  { href: '/', label: 'home' },
  { href: '/typing', label: 'type' },
  { href: '/courses', label: 'courses' },
  { href: '/multiplayer', label: 'versus' },
  { href: '/leaderboard', label: 'ranks' },
  { href: '/help', label: 'help' },
]

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setUser(getSession())
  }, [path])

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, padding: '0 28px',
        background: 'rgba(12,12,16,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#e8ff57',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 14, color: '#0c0c10',
          }}>TC</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#f0f0f8', letterSpacing: '-0.02em' }}>
            Type<span style={{ color: '#e8ff57' }}>Craft</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} style={{
              padding: '6px 14px', borderRadius: 8,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 13, textDecoration: 'none',
              color: path === n.href ? '#e8ff57' : '#9090a8',
              background: path === n.href ? 'rgba(232,255,87,0.08)' : 'transparent',
              transition: 'all 0.15s',
            }}>{n.label}</Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/settings" style={{
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9090a8', textDecoration: 'none', fontSize: 16,
          }}>⚙</Link>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 12px 5px 5px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#e8ff57',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 12, color: '#0c0c10',
                }}>{user.username[0].toUpperCase()}</div>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: '#f0f0f8' }}>{user.username}</span>
                <span style={{ color: '#55556a', fontSize: 10 }}>▾</span>
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: '#131318', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: 6, minWidth: 160,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                  {[
                    { href: '/profile', label: '👤  Profile' },
                    { href: '/settings', label: '⚙️  Settings' },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'block', padding: '9px 14px', borderRadius: 8,
                        fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9090a8',
                        textDecoration: 'none', transition: 'background 0.1s',
                      }}>
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                  <button onClick={handleLogout} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '9px 14px', borderRadius: 8, border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#ff6b6b',
                  }}>
                    🚪  Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '7px 14px', borderRadius: 8,
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                color: '#9090a8', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>sign in</Link>
              <Link href="/register" style={{
                padding: '7px 16px', borderRadius: 8,
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                color: '#0c0c10', textDecoration: 'none',
                background: '#e8ff57',
              }}>get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
