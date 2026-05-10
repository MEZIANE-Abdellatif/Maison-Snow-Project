import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { ProductDetailClient } from "@/components/product/product-detail-client"
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/shop-data"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) {
    return {
      title: "Product | Maison Snow",
      description: "Maison Snow luxury fashion.",
    }
  }
  const title = `${product.name} | Maison Snow`
  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157)}…`
      : product.description
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${product.slug}`,
      siteName: "Maison Snow",
      type: "website",
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) {
    notFound()
  }
  const related = getRelatedProducts(product.category, product.id, 4)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <ProductDetailClient product={product} related={related} />
      <Footer />
    </main>
  )
}
