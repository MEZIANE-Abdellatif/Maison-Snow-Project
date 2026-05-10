"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { clearMockSession, MOCK_AUTH_CHANGE_EVENT, readMockSession, type MockSession } from "@/lib/mock-auth"

type MockAuthContextValue = {
  session: MockSession | null
  /** Mirrors a future `session` check — `true` when mock session exists. */
  isLoggedIn: boolean
  /** First name for display, or a short fallback from email. */
  displayFirstName: string
  signOut: () => void
  refresh: () => void
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null)

function readSessionClient(): MockSession | null {
  return readMockSession()
}

function displayNameFromSession(s: MockSession | null): string {
  if (!s) return ""
  const first = s.firstName?.trim()
  if (first) return first
  const local = s.email.split("@")[0]
  return local || "Guest"
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null)

  const sync = useCallback(() => {
    setSession(readSessionClient())
  }, [])

  useEffect(() => {
    sync()
    const onChange = () => sync()
    window.addEventListener(MOCK_AUTH_CHANGE_EVENT, onChange)
    window.addEventListener("storage", onChange)
    return () => {
      window.removeEventListener(MOCK_AUTH_CHANGE_EVENT, onChange)
      window.removeEventListener("storage", onChange)
    }
  }, [sync])

  const signOut = useCallback(() => {
    clearMockSession()
    setSession(null)
  }, [])

  const value = useMemo<MockAuthContextValue>(
    () => ({
      session,
      isLoggedIn: Boolean(session?.email),
      displayFirstName: displayNameFromSession(session),
      signOut,
      refresh: sync,
    }),
    [session, signOut, sync],
  )

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
}

export function useMockAuth(): MockAuthContextValue {
  const ctx = useContext(MockAuthContext)
  if (!ctx) {
    throw new Error("useMockAuth must be used within MockAuthProvider")
  }
  return ctx
}
