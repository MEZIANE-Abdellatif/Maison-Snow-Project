"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { ProductDetailClient } from "@/components/product/product-detail-client"
import { ShopPageSkeleton } from "@/components/shop/shop-page-skeleton"
import { fetchProductBySlug, fetchProducts } from "@/lib/products-api"
import type { ShopProduct } from "@/lib/shop-data"

type ProductDetailPageClientProps = {
  slug: string
}

export function ProductDetailPageClient({ slug }: ProductDetailPageClientProps) {
  const router = useRouter()
  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [related, setRelated] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const detail = await fetchProductBySlug(slug)
        if (cancelled) return

        if (!detail) {
          router.replace("/shop")
          return
        }

        setProduct(detail)

        const sameCategory = await fetchProducts({
          category: detail.category,
          limit: 5,
        })
        if (!cancelled) {
          setRelated(sameCategory.filter((p) => p.id !== detail.id).slice(0, 4))
        }
      } catch {
        if (!cancelled) router.replace("/shop")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug, router])

  if (loading || !product) {
    return (
      <div className="pt-8">
        <ShopPageSkeleton />
      </div>
    )
  }

  return <ProductDetailClient product={product} related={related} />
}
