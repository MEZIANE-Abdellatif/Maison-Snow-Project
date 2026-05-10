"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

import { AuthCardShell } from "@/components/auth/auth-card-shell"
import { authGoldLinkClass } from "@/components/auth/auth-field-styles"
import { RegisterForm } from "@/components/auth/register-form"
import { sanitizeAuthReturnUrl, withReturnUrl } from "@/lib/auth-return-url"

export function RegisterAuthPage() {
  const searchParams = useSearchParams()
  const returnUrl = useMemo(
    () => sanitizeAuthReturnUrl(searchParams.get("returnUrl")),
    [searchParams],
  )

  return (
    <AuthCardShell
      belowCard={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={withReturnUrl("/login", returnUrl)} className={authGoldLinkClass}>
            Sign In
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCardShell>
  )
}
