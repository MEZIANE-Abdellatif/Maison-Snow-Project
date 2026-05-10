"use client"

import { AuthCardShell } from "@/components/auth/auth-card-shell"
import { ForgotPasswordBelowCard, ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export function ForgotAuthPage() {
  return (
    <AuthCardShell belowCard={<ForgotPasswordBelowCard />}>
      <ForgotPasswordForm />
    </AuthCardShell>
  )
}
