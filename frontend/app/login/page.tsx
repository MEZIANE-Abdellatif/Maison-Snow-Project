import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginPageClient } from "@/components/auth/login-page-client"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Sign in | Maison Snow",
  description: "Sign in to your Maison Snow account.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Sign in | Maison Snow",
    description: "Sign in to your Maison Snow account.",
    url: "/login",
    siteName: "Maison Snow",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign in | Maison Snow",
    description: "Sign in to your Maison Snow account.",
  },
}

function LoginFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pt-32">
      <p className="text-center text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<LoginFallback />}>
        <LoginPageClient />
      </Suspense>
      <Footer />
    </main>
  )
}
