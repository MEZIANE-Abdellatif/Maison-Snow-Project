import type { Metadata } from "next"

import { CartPageClient } from "@/components/cart/cart-page-client"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "Your Cart | Maison Snow",
  description: "Review your Maison Snow selections and proceed to checkout.",
  alternates: { canonical: "/cart" },
  openGraph: {
    title: "Your Cart | Maison Snow",
    description: "Review your Maison Snow selections and proceed to checkout.",
    url: "/cart",
    siteName: "Maison Snow",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Your Cart | Maison Snow",
    description: "Review your Maison Snow selections and proceed to checkout.",
  },
}

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CartPageClient />
      <Footer />
    </main>
  )
}
