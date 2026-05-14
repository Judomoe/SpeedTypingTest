const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export interface UserStats {
  totalTests: number
  bestWpm: number
  avgWpm: number
  avgAcc: number
  streak: number
  lastActive: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  country?: string
  isPro?: boolean
  createdAt: string
  stats?: UserStats
}

export interface TestResult {
  id?: string
  userId?: string
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
  language?: string
  wpmData: number[]
  rawData: number[]
  errData: number[]
  timestamp: string
}

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  username: string
  country: string
  wpm: number
  acc: number
  tests: number
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function saveSession(user: AuthUser, token: string) {
  if (!isBrowser()) return
  localStorage.setItem('tc_session', JSON.stringify(user))
  localStorage.setItem('tc_token', token)
  window.dispatchEvent(new Event('tc-auth-change'))
}

function saveCachedHistory(scores: TestResult[]) {
  if (!isBrowser()) return
  localStorage.setItem('tc_history', JSON.stringify(scores.slice(0, 200)))
}

export function getToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem('tc_token')
}

export function getSession(): AuthUser | null {
  if (!isBrowser()) return null
  try {
    const s = localStorage.getItem('tc_session')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data as T
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await apiFetch<{ user: AuthUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
    saveSession(data.user, data.token)
    saveCachedHistory([])
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Registration failed' }
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await apiFetch<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveSession(data.user, data.token)
    const profile = await getProfile()
    if (profile.success) saveCachedHistory(profile.scores)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
  }
}

export function logoutUser(): void {
  if (!isBrowser()) return
  localStorage.removeItem('tc_session')
  localStorage.removeItem('tc_token')
  localStorage.removeItem('tc_history')
  window.dispatchEvent(new Event('tc-auth-change'))
}

export async function refreshSession(): Promise<AuthUser | null> {
  if (!getToken()) return getSession()
  try {
    const data = await apiFetch<{ user: AuthUser }>('/auth/me')
    if (getToken()) saveSession(data.user, getToken()!)
    return data.user
  } catch {
    logoutUser()
    return null
  }
}

export async function saveTestResult(
  result: Omit<TestResult, 'timestamp'>,
): Promise<{ success: boolean; error?: string }> {
  const localResult: TestResult = { ...result, timestamp: new Date().toISOString() }
  if (!getToken()) {
    const history = getTestHistory()
    saveCachedHistory([localResult, ...history])
    return { success: false, error: 'Sign in to sync results to MongoDB Atlas' }
  }

  try {
    const data = await apiFetch<{ score: TestResult; user: AuthUser }>('/scores', {
      method: 'POST',
      body: JSON.stringify(result),
    })
    const history = getTestHistory()
    saveCachedHistory([data.score, ...history.filter(h => h.id !== data.score.id)])
    if (getToken()) saveSession(data.user, getToken()!)
    return { success: true }
  } catch (error) {
    const history = getTestHistory()
    saveCachedHistory([localResult, ...history])
    return { success: false, error: error instanceof Error ? error.message : 'Could not sync result' }
  }
}

export function getTestHistory(): TestResult[] {
  if (!isBrowser()) return []
  try {
    return JSON.parse(localStorage.getItem('tc_history') || '[]')
  } catch {
    return []
  }
}

export async function getProfile(): Promise<{ success: true; user: AuthUser; scores: TestResult[] } | { success: false; error: string; user: AuthUser | null; scores: TestResult[] }> {
  try {
    const data = await apiFetch<{ user: AuthUser; scores: TestResult[] }>('/profile/me')
    saveSession(data.user, getToken() || '')
    saveCachedHistory(data.scores)
    return { success: true, user: data.user, scores: data.scores }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not load profile',
      user: getSession(),
      scores: getTestHistory(),
    }
  }
}

export async function getLeaderboard(period: string, mode: string): Promise<{ success: true; leaders: LeaderboardEntry[] } | { success: false; error: string; leaders: LeaderboardEntry[] }> {
  try {
    const params = new URLSearchParams({ period, mode })
    const data = await apiFetch<{ leaders: LeaderboardEntry[] }>(`/leaderboard?${params}`)
    return { success: true, leaders: data.leaders }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not load leaderboard',
      leaders: [],
    }
  }
}
