import type { Metadata } from "next"
import { Suspense } from "react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { ShopPageClient } from "@/components/shop/shop-page-client"
import { ShopPageSkeleton } from "@/components/shop/shop-page-skeleton"

export const metadata: Metadata = {
  title: "Shop | Maison Snow",
  description:
    "Browse Maison Snow—luxury purses, jewelry, scarves, and dresses with timeless elegance.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop | Maison Snow",
    description:
      "Browse Maison Snow—luxury purses, jewelry, scarves, and dresses with timeless elegance.",
    url: "/shop",
    siteName: "Maison Snow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop | Maison Snow",
    description:
      "Browse Maison Snow—luxury purses, jewelry, scarves, and dresses with timeless elegance.",
  },
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<ShopPageSkeleton />}>
        <ShopPageClient />
      </Suspense>
      <Footer />
    </main>
  )
}
