import type { Metadata } from "next"

import { CheckoutPageClient } from "@/components/checkout/checkout-page-client"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Checkout | Maison Snow",
  description: "Complete your Maison Snow order.",
  alternates: { canonical: "/checkout" },
  openGraph: {
    title: "Checkout | Maison Snow",
    description: "Complete your Maison Snow order.",
    url: "/checkout",
    siteName: "Maison Snow",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Checkout | Maison Snow",
    description: "Complete your Maison Snow order.",
  },
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CheckoutPageClient />
      <Footer />
    </main>
  )
}
