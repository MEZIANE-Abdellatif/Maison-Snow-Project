import type { Metadata } from "next"
import { Suspense } from "react"

import { ForgotAuthPage } from "@/components/auth/forgot-auth-page"

export const metadata: Metadata = {
  title: "Reset Password | Maison Snow",
  description: "Reset your Maison Snow account password.",
  alternates: { canonical: "/forgot-password" },
  openGraph: {
    title: "Reset Password | Maison Snow",
    description: "Reset your Maison Snow account password.",
    url: "/forgot-password",
    siteName: "Maison Snow",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Reset Password | Maison Snow",
    description: "Reset your Maison Snow account password.",
  },
}

function AuthFallback() {
  return (
    <main className="min-h-screen min-h-dvh bg-cream flex flex-col items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </main>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <ForgotAuthPage />
    </Suspense>
  )
}
