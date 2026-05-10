import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "My Orders | Maison Snow",
  description: "Your Maison Snow orders.",
  alternates: { canonical: "/account/orders" },
}

export default function AccountOrdersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-32">
        <h1 className="font-serif text-3xl tracking-wide text-foreground md:text-4xl mb-4">My Orders</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-8">
          Order history will appear here when connected to a backend.
        </p>
        <Link
          href="/account"
          className="text-sm text-gold underline-offset-4 hover:text-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
        >
          Back to account
        </Link>
      </div>
      <Footer />
    </main>
  )
}
