"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import {
  authHeadingClass,
  authIconButtonClass,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-field-styles"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { sanitizeAuthReturnUrl } from "@/lib/auth-return-url"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = useMemo(
    () => sanitizeAuthReturnUrl(searchParams.get("returnUrl")),
    [searchParams],
  )

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const pwdStarted = password.length > 0

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmError(null)
    setSubmitError(null)
    if (!confirmPassword.trim()) {
      setConfirmError("Please confirm your password.")
      return
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.")
      return
    }
    if (!email.trim() || !password || !firstName.trim() || !lastName.trim()) return

    setSubmitting(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setSubmitError(data.error ?? "Could not create account. Please try again.")
        return
      }

      const signInResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setSubmitError("Account created but sign-in failed. Please sign in manually.")
        return
      }

      router.push(returnUrl)
      router.refresh()
    } catch {
      setSubmitError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <h1 className={`${authHeadingClass} mb-4 text-center sm:mb-5`}>Create Your Account</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
          <div className="space-y-1">
            <Label htmlFor="register-first" className={authLabelClass}>
              First name
            </Label>
            <Input
              id="register-first"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={authInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="register-last" className={authLabelClass}>
              Last name
            </Label>
            <Input
              id="register-last"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={authInputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="register-email" className={authLabelClass}>
            Email
          </Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={authInputClass}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="register-password" className={authLabelClass}>
            Password
          </Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pwdStarted ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`space-y-1 pt-0.5 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                pwdStarted ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
              }`}
              aria-hidden={!pwdStarted}
            >
              <Label htmlFor="register-confirm" className={authLabelClass}>
                Confirm password
              </Label>
              <Input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setConfirmError(null)
                }}
                tabIndex={pwdStarted ? 0 : -1}
                aria-hidden={!pwdStarted}
                aria-invalid={confirmError ? true : undefined}
                className={authInputClass}
              />
              {confirmError ? (
                <p className="text-xs text-destructive" role="alert">
                  {confirmError}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {submitError ? (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        ) : null}

        <button type="submit" disabled={submitting} className={authPrimaryButtonClass}>
          {submitting ? "Creating…" : "Create Account"}
        </button>
      </form>
    </>
  )
}
