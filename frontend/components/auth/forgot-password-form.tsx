"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import {
  authGoldLinkClass,
  authHeadingClass,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-field-styles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sanitizeAuthReturnUrl, withReturnUrl } from "@/lib/auth-return-url"

export function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const returnUrl = useMemo(
    () => sanitizeAuthReturnUrl(searchParams.get("returnUrl")),
    [searchParams],
  )

  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 400)
  }

  const loginHref = withReturnUrl("/login", returnUrl)

  return (
    <div className="relative min-h-0 sm:min-h-[220px]">
      <div
        className={`transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sent ? "pointer-events-none invisible absolute inset-0 -translate-y-2 opacity-0" : "relative translate-y-0 opacity-100"
        }`}
        aria-hidden={sent}
      >
        <h1 className={`${authHeadingClass} mb-1.5 text-center`}>Reset Your Password</h1>
        <p className="mb-4 text-center text-xs leading-snug text-muted-foreground sm:mb-5 sm:text-[13px]">
          Enter your email and we will send you a reset link
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="forgot-email" className={authLabelClass}>
              Email
            </Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={authInputClass}
            />
          </div>

          <button type="submit" disabled={submitting} className={authPrimaryButtonClass}>
            {submitting ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      </div>

      <div
        className={`transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sent ? "relative translate-y-0 opacity-100" : "pointer-events-none invisible absolute inset-0 translate-y-3 opacity-0"
        }`}
        aria-live="polite"
        aria-hidden={!sent}
      >
        {sent ? (
          <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <h1 className={`${authHeadingClass} mb-2`}>Reset Your Password</h1>
            <p className="mb-4 text-xs leading-snug text-muted-foreground sm:mb-5 sm:text-[13px]">
              Check your inbox — a reset link has been sent to{" "}
              <span className="font-medium text-foreground">{email.trim()}</span>
            </p>
            <Link href={loginHref} className={`inline-block text-xs ${authGoldLinkClass}`}>
              Back to Sign In
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ForgotPasswordBelowCard() {
  const searchParams = useSearchParams()
  const returnUrl = useMemo(
    () => sanitizeAuthReturnUrl(searchParams.get("returnUrl")),
    [searchParams],
  )

  return (
    <Link href={withReturnUrl("/login", returnUrl)} className={authGoldLinkClass}>
      Back to Sign In
    </Link>
  )
}
