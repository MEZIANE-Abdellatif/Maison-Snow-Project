"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  CATEGORY_CARD_IMAGES,
  fetchCategories,
  type ApiCategory,
} from "@/lib/products-api"
import type { ProductCategory } from "@/lib/shop-data"

function toCategorySlug(slug: string): ProductCategory | null {
  if (slug === "purse" || slug === "jewelry" || slug === "scarf" || slug === "dress") {
    return slug
  }
  return null
}

export function Categories() {
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchCategories()
        if (!cancelled) setCategories(data)
      } catch {
        if (!cancelled) setCategories([])
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
    <section id="categories" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold tracking-[0.3em] text-sm uppercase">We Start With</span>
            <div className="h-px w-12 bg-gold" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-foreground">
            Our Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full rounded-sm" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              ))
            : categories.map((category) => {
                const slug = toCategorySlug(category.slug)
                const image =
                  slug != null ? CATEGORY_CARD_IMAGES[slug] : "/images/product1.jpg"

                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${category.slug}`}
                    className="group block cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label={`Shop ${category.name} collection`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-cream-dark mb-4">
                      <Image
                        src={image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        aria-hidden
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute top-4 left-0 right-0 text-center">
                        <span className="inline-block bg-background/90 px-6 py-2 text-sm tracking-[0.2em] uppercase font-medium text-foreground">
                          {category.name}
                        </span>
                      </div>
                    </div>

                    <p className="text-center text-foreground/70 text-sm leading-relaxed group-hover:text-foreground transition-colors">
                      {category.description ?? ""}
                    </p>
                  </Link>
                )
              })}
        </div>
      </div>
    </section>
  )
}
