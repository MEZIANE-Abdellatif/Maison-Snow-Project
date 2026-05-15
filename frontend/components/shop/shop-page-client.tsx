"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddedToCartModal } from "@/components/shop/added-to-cart-modal"
import { ShopPageSkeleton } from "@/components/shop/shop-page-skeleton"
import { ShopProductCard } from "@/components/shop/shop-product-card"
import { fetchProducts, type ShopSortKey } from "@/lib/products-api"
import { CATEGORY_TAGLINES, parseCategoryParam, type CategorySlug, type ShopProduct } from "@/lib/shop-data"

const PILL_ORDER: { slug: CategorySlug; label: string }[] = [
  { slug: "all", label: "All" },
  { slug: "purse", label: "Purse" },
  { slug: "jewelry", label: "Jewelry" },
  { slug: "scarf", label: "Scarf" },
  { slug: "dress", label: "Dress" },
]

export function ShopPageClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = parseCategoryParam(searchParams.get("category"))
  const [sort, setSort] = useState<ShopSortKey>("newest")
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addedProduct, setAddedProduct] = useState<ShopProduct | null>(null)

  const setCategory = useCallback(
    (slug: CategorySlug) => {
      const params = new URLSearchParams(searchParams.toString())
      if (slug === "all") {
        params.delete("category")
      } else {
        params.set("category", slug)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await fetchProducts({
          category: category === "all" ? undefined : category,
          sort,
        })
        if (!cancelled) setProducts(data)
      } catch {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [category, sort])

  const hero = useMemo(() => {
    if (category === "all") {
      return {
        title: "The Boutique",
        tagline:
          "A curated edit of purses, jewelry, scarves, and dresses—each piece chosen for lasting beauty.",
      }
    }
    const meta = CATEGORY_TAGLINES[category]
    return { title: meta.label, tagline: meta.tagline }
  }, [category])

  if (loading) {
    return <ShopPageSkeleton />
  }

  return (
    <>
      <AddedToCartModal
        product={addedProduct}
        onClose={() => setAddedProduct(null)}
      />
      <header className="border-b border-border bg-cream-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 md:pt-32 md:pb-16 text-center">
          <span className="text-gold tracking-[0.3em] text-xs uppercase block mb-3">
            Maison Snow
          </span>
          <h1 className="font-serif text-3xl md:text-5xl tracking-wide text-foreground mb-4">
            {hero.title}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {hero.tagline}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-8"
          role="toolbar"
          aria-label="Filter by category"
        >
          {PILL_ORDER.map(({ slug, label }) => {
            const active = category === slug
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setCategory(slug)}
                className={[
                  "min-h-11 rounded-full border px-5 sm:px-6 text-xs sm:text-sm tracking-widest uppercase transition-colors duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-gold text-gold bg-background"
                    : "border-border text-foreground/70 hover:border-gold/50 hover:text-foreground bg-card",
                ].join(" ")}
                aria-pressed={active}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Label
              htmlFor="shop-sort"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Sort by
            </Label>
            <Select value={sort} onValueChange={(v) => setSort(v as ShopSortKey)}>
              <SelectTrigger
                id="shop-sort"
                className="min-h-11 w-full sm:min-w-[220px] border-border bg-card"
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price low to high</SelectItem>
                <SelectItem value="price-desc">Price high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-20 md:py-28 text-center px-4">
            <p className="font-serif text-2xl md:text-3xl text-foreground mb-3">
              No products found
            </p>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
              Try another category or browse the full boutique.
            </p>
            <Link
              href="/shop"
              className="inline-flex min-h-11 items-center justify-center border-2 border-gold text-gold px-10 text-xs tracking-widest uppercase hover:bg-gold hover:text-primary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Browse all
            </Link>
          </div>
        ) : (
          <>
            <h2 className="sr-only">Products</h2>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 list-none p-0 m-0">
              {products.map((product) => (
                <li key={product.id}>
                  <ShopProductCard
                    product={product}
                    onAddedToCart={setAddedProduct}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
