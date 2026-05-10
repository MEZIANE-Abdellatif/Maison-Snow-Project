"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import {
  authGoldLinkClass,
  authHeadingClass,
  authIconButtonClass,
  authInputClass,
  authLabelClass,
  authMutedLinkClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-field-styles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sanitizeAuthReturnUrl, withReturnUrl } from "@/lib/auth-return-url"
import { setMockSession } from "@/lib/mock-auth"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = useMemo(
    () => sanitizeAuthReturnUrl(searchParams.get("returnUrl")),
    [searchParams],
  )

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    setMockSession({ email: email.trim() })
    router.push(returnUrl)
    router.refresh()
  }

  return (
    <>
      <h1 className={`${authHeadingClass} mb-4 text-center sm:mb-5`}>Sign in</h1>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <Label htmlFor="login-email" className={authLabelClass}>
            Email
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={authInputClass}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="login-password" className={authLabelClass}>
            Password
          </Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${authInputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={authIconButtonClass}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-0">
          <Link href={withReturnUrl("/forgot-password", returnUrl)} className={`text-xs ${authGoldLinkClass}`}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={submitting} className={authPrimaryButtonClass}>
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-2 sm:my-6 sm:gap-3" aria-hidden>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/50 to-gold/25" />
        <svg className="h-2.5 w-2.5 shrink-0 text-gold" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L16 8L8 16L0 8L8 0Z" />
        </svg>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/50 to-gold/25" />
      </div>

      <p className="text-center">
        <Link href="/checkout" className={authMutedLinkClass}>
          or continue as guest
        </Link>
      </p>
    </>
  )
}
