import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:4000/api'

const DEFAULT_SETTINGS = {
  font: 'JetBrains Mono',
  fontSize: 20,
  caretStyle: 'line',
  showLiveWpm: true,
  showKbd: true,
  sound: false,
  language: 'english',
  theme: 'dark',
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem('tc_settings')
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS
    } catch { return DEFAULT_SETTINGS }
  })

  // Apply font/size to CSS vars whenever settings change
  useEffect(() => {
    document.documentElement.style.setProperty('--typing-font', `'${settings.font}', monospace`)
    document.documentElement.style.setProperty('--typing-size', `${settings.fontSize}px`)
    localStorage.setItem('tc_settings', JSON.stringify(settings))

    // Sync to server if logged in
    const session = getSession()
    if (session) {
      fetch(`${API}/auth/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify(settings),
      }).catch(() => {})
    }
  }, [settings])

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateMany = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  return (
    <SettingsContext.Provider value={{ settings, update, updateMany, reset }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}

// ─── Auth helpers (shared here so import is simple) ─────────────────────────
export function getSession() {
  try {
    const s = localStorage.getItem('tc_session')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function setSession(data) {
  localStorage.setItem('tc_session', JSON.stringify(data))
}

export function clearSession() {
  localStorage.removeItem('tc_session')
}
