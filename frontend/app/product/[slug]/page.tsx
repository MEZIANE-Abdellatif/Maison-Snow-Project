import type { Metadata } from "next"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { ProductDetailPageClient } from "@/components/product/product-detail-page-client"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `${slug.replace(/-/g, " ")} | Maison Snow`,
    description: "Maison Snow luxury fashion.",
    alternates: { canonical: `/product/${slug}` },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ProductDetailPageClient slug={slug} />
      <Footer />
    </main>
  )
}
