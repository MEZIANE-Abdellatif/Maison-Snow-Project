"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { fetchProducts } from "@/lib/products-api"
import { formatPrice, type ShopProduct } from "@/lib/shop-data"

export function NewArrivals() {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchProducts({ limit: 4, sort: "newest" })
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
  }, [])

  return (
    <section id="new-arrivals" className="py-24 px-4 bg-cream-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gold tracking-[0.3em] text-sm uppercase block mb-4">Fresh Additions</span>
          <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-foreground mb-4">
            New Arrivals
          </h2>
          <p className="text-foreground/70 max-w-md mx-auto">
            Discover our latest pieces, crafted with the finest materials and timeless design.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/3 mx-auto" />
                </div>
              ))
            : products.map((product) => {
                const href = `/product/${product.slug}`
                return (
                  <article key={product.id} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        aria-hidden
                      />

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 bg-black/35">
                        <Link
                          href={href}
                          className="pointer-events-auto inline-flex min-h-11 items-center justify-center bg-primary px-6 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-gold hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
                        >
                          Quick View
                        </Link>
                      </div>
                    </div>

                    <div className="text-center">
                      <Link
                        href={href}
                        className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
                      >
                        <h3 className="font-serif text-lg text-foreground mb-1 transition-colors group-hover:text-gold">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gold font-medium tracking-wide">{formatPrice(product.price)}</p>
                    </div>
                  </article>
                )
              })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center border-2 border-primary text-primary px-12 py-3 text-sm tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
