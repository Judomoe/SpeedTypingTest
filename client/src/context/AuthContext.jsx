import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, setSession, clearSession } from './SettingsContext'

const API = 'http://localhost:4000/api'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) setUser(session.user)
    setLoading(false)
  }, [])

  async function register(username, email, password) {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setSession(data)
    setUser(data.user)
    return data
  }

  async function login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setSession(data)
    setUser(data.user)
    return data
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  async function saveScore(result) {
    const session = getSession()
    if (!session) return
    try {
      await fetch(`${API}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({
          wpm: result.wpm, rawWpm: result.rawWpm, accuracy: result.acc,
          errors: result.errors, correct: result.correct, incorrect: result.incorrect,
          missed: result.missed, consistency: result.consistency, duration: result.dur,
          mode: result.mode, language: 'english',
          wpmData: result.wpmData, rawData: result.rawData, errData: result.errData,
        }),
      })
    } catch { /* offline – ignore */ }

    // Also save to localStorage history
    try {
      const history = JSON.parse(localStorage.getItem('tc_history') || '[]')
      history.unshift({ ...result, timestamp: new Date().toISOString() })
      localStorage.setItem('tc_history', JSON.stringify(history.slice(0, 200)))
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, saveScore }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
