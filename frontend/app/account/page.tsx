import type { Metadata } from "next"
import { Suspense } from "react"

import { AccountPageClient } from "@/components/account/account-page-client"

const title = "Your Account | Maison Snow"
const description =
  "Manage your Maison Snow orders, profile, and addresses in your personal space."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/account" },
  openGraph: {
    title,
    description,
    url: "/account",
    siteName: "Maison Snow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

function AccountFallback() {
  return (
    <div className="min-h-screen bg-account-main">
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-sm bg-border" />
          <div className="h-32 w-full max-w-2xl rounded-sm bg-border/80" />
          <div className="h-32 w-full max-w-2xl rounded-sm bg-border/80" />
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountPageClient />
    </Suspense>
  )
}
