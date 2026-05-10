"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

import { AuthCardShell } from "@/components/auth/auth-card-shell"
import { authGoldLinkClass } from "@/components/auth/auth-field-styles"
import { LoginForm } from "@/components/auth/login-form"
import { sanitizeAuthReturnUrl, withReturnUrl } from "@/lib/auth-return-url"

export function LoginAuthPage() {
  const searchParams = useSearchParams()
  const returnUrl = useMemo(
    () => sanitizeAuthReturnUrl(searchParams.get("returnUrl")),
    [searchParams],
  )

  return (
    <AuthCardShell
      belowCard={
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href={withReturnUrl("/register", returnUrl)} className={authGoldLinkClass}>
            Register
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthCardShell>
  )
}
