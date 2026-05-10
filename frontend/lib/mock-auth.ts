const STORAGE_KEY = "maison_snow_mock_session"

/** Fired after mock session is set or cleared so UI (e.g. navbar) can sync. */
export const MOCK_AUTH_CHANGE_EVENT = "maison-snow-mock-auth-change"

function notifyMockAuthChange() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(MOCK_AUTH_CHANGE_EVENT))
}

export type MockSession = {
  email: string
  firstName?: string
  lastName?: string
}

export function setMockSession(session: MockSession): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, at: Date.now() }))
    notifyMockAuthChange()
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearMockSession(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
    notifyMockAuthChange()
  } catch {
    /* ignore */
  }
}

export function readMockSession(): MockSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { email?: string }
    if (typeof data.email !== "string") return null
    return data as MockSession
  } catch {
    return null
  }
}
