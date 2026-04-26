export interface AuthUser {
  id: string
  username: string
  email: string
  createdAt: string
}

interface StoredUser {
  id: string
  username: string
  email: string
  password: string
  createdAt: string
}

export interface TestResult {
  wpm: number
  rawWpm: number
  acc: number
  consistency: number
  errors: number
  correct: number
  incorrect: number
  extra: number
  missed: number
  dur: number
  mode: string
  wpmData: number[]
  rawData: number[]
  errData: number[]
  timestamp: string
}

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem('tc_users') || '[]') }
  catch { return [] }
}

function saveSession(user: StoredUser) {
  localStorage.setItem('tc_session', JSON.stringify({
    id: user.id, username: user.username,
    email: user.email, createdAt: user.createdAt,
  }))
}

export function getSession(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const s = localStorage.getItem('tc_session')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function registerUser(
  username: string, email: string, password: string
): { success: boolean; error?: string } {
  const users = getUsers()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { success: false, error: 'Email already registered' }
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
    return { success: false, error: 'Username already taken' }
  if (username.length < 3)
    return { success: false, error: 'Username must be at least 3 characters' }
  if (password.length < 8)
    return { success: false, error: 'Password must be at least 8 characters' }
  const user: StoredUser = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    username, email, password,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  localStorage.setItem('tc_users', JSON.stringify(users))
  saveSession(user)
  return { success: true }
}

export function loginUser(
  email: string, password: string
): { success: boolean; error?: string } {
  const users = getUsers()
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return { success: false, error: 'Invalid email or password' }
  saveSession(user)
  return { success: true }
}

export function logoutUser(): void {
  localStorage.removeItem('tc_session')
}

export function saveTestResult(result: Omit<TestResult, 'timestamp'>): void {
  try {
    const history: TestResult[] = JSON.parse(localStorage.getItem('tc_history') || '[]')
    history.unshift({ ...result, timestamp: new Date().toISOString() })
    localStorage.setItem('tc_history', JSON.stringify(history.slice(0, 200)))
  } catch { /* ignore storage errors */ }
}

export function getTestHistory(): TestResult[] {
  try { return JSON.parse(localStorage.getItem('tc_history') || '[]') }
  catch { return [] }
}
