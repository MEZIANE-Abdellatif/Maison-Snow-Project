import type { Metadata } from "next"
import { Suspense } from "react"

import { RegisterAuthPage } from "@/components/auth/register-auth-page"

export const metadata: Metadata = {
  title: "Create Account | Maison Snow",
  description: "Create your Maison Snow account.",
  alternates: { canonical: "/register" },
  openGraph: {
    title: "Create Account | Maison Snow",
    description: "Create your Maison Snow account.",
    url: "/register",
    siteName: "Maison Snow",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Create Account | Maison Snow",
    description: "Create your Maison Snow account.",
  },
}

function AuthFallback() {
  return (
    <main className="min-h-screen min-h-dvh bg-cream flex flex-col items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <RegisterAuthPage />
    </Suspense>
  )
}
