"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { Minus, Plus } from "lucide-react"

import { AddedToCartModal } from "@/components/shop/added-to-cart-modal"
import { ShopProductCard } from "@/components/shop/shop-product-card"
import { useCart } from "@/contexts/cart-context"
import { CATEGORY_TAGLINES, formatPrice, type ShopProduct } from "@/lib/shop-data"

type ProductDetailClientProps = {
  product: ShopProduct
  related: ShopProduct[]
}

export function ProductDetailClient({
  product,
  related,
}: ProductDetailClientProps) {
  const { addProduct } = useCart()
  const [imageIndex, setImageIndex] = useState(0)
  const [size, setSize] = useState<string | null>(() =>
    product.hasSizes ? (product.sizes[0] ?? null) : null,
  )
  const [qty, setQty] = useState(1)
  const [addedProduct, setAddedProduct] = useState<ShopProduct | null>(null)

  const activeSrc = product.images[imageIndex] ?? product.image

  const categoryHref = `/shop?category=${product.category}`
  const categoryLabel = CATEGORY_TAGLINES[product.category].label

  const decQty = () => setQty((q) => Math.max(1, q - 1))
  const incQty = () => setQty((q) => Math.min(10, q + 1))

  const sizeLabel = useMemo(() => {
    if (!product.hasSizes || !size) return null
    return `Size ${size}`
  }, [product.hasSizes, size])

  return (
    <>
      <AddedToCartModal
        product={addedProduct}
        onClose={() => setAddedProduct(null)}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 lg:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
          {/* Gallery — full width on mobile, 60% desktop */}
          <div className="w-full lg:w-[60%] shrink-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-card mb-4">
              <Image
                key={activeSrc}
                src={activeSrc}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>

            <div
              className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory"
              role="group"
              aria-label="Product images"
            >
              {product.images.map((src, i) => {
                const selected = i === imageIndex
                return (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Show image ${i + 1}`}
                    onClick={() => setImageIndex(i)}
                    className={[
                      "relative h-24 w-20 shrink-0 overflow-hidden snap-start transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      selected
                        ? "ring-2 ring-gold ring-offset-2 ring-offset-background"
                        : "border border-border hover:border-gold/50",
                    ].join(" ")}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                      aria-hidden
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Details — below image on mobile, 40% desktop */}
          <div className="w-full lg:w-[40%] lg:min-w-0 flex flex-col gap-6">
            <nav aria-label="Breadcrumb">
              <Link
                href={categoryHref}
                className="inline-block text-sm text-gold tracking-widest uppercase hover:text-gold-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
              >
                {categoryLabel}
              </Link>
            </nav>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide text-foreground mb-3">
                {product.name}
              </h1>
              <p className="text-gold text-xl md:text-2xl font-medium tracking-wide">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {product.description}
            </p>

            {product.hasSizes ? (
              <div>
                <p
                  id="size-label"
                  className="text-xs tracking-widest uppercase text-muted-foreground mb-3"
                >
                  Size
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby="size-label"
                >
                  {product.sizes.map((s) => {
                    const active = size === s
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={[
                          "min-h-11 min-w-11 px-4 rounded-full border text-sm tracking-widest uppercase transition-colors duration-300",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          active
                            ? "border-gold text-gold bg-background"
                            : "border-border text-foreground/70 hover:border-gold/50 hover:text-foreground bg-card",
                        ].join(" ")}
                        aria-pressed={active}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div>
              <p
                id="qty-label"
                className="text-xs tracking-widest uppercase text-muted-foreground mb-3"
              >
                Quantity
              </p>
              <div
                className="inline-flex items-stretch border border-border rounded-md overflow-hidden bg-card"
                role="group"
                aria-labelledby="qty-label"
              >
                <button
                  type="button"
                  onClick={decQty}
                  disabled={qty <= 1}
                  className="min-h-11 min-w-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" aria-hidden />
                </button>
                <span className="min-w-[3rem] flex items-center justify-center text-sm font-medium tabular-nums border-x border-border px-2">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={incQty}
                  disabled={qty >= 10}
                  className="min-h-11 min-w-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/50"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <button
                type="button"
                className="w-full min-h-12 bg-primary text-primary-foreground text-sm tracking-widest uppercase py-3 px-6 hover:bg-primary/90 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={
                  sizeLabel
                    ? `Add to cart, ${sizeLabel}, quantity ${qty}`
                    : `Add to cart, quantity ${qty}`
                }
                onClick={() => {
                  addProduct({
                    product,
                    quantity: qty,
                    size: product.hasSizes ? size : null,
                  })
                  setAddedProduct(product)
                }}
              >
                Add to cart
              </button>
              <button
                type="button"
                className="self-center text-sm text-gold tracking-wide hover:text-gold-light transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
              >
                Save to wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section
          className="border-t border-border bg-cream-dark/40 py-16 md:py-20 px-4 sm:px-6 lg:px-8"
          aria-labelledby="related-heading"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-14">
              <span className="text-gold tracking-[0.3em] text-xs uppercase block mb-3">
                Maison Snow
              </span>
              <h2
                id="related-heading"
                className="font-serif text-2xl md:text-3xl tracking-wide text-foreground"
              >
                You may also like
              </h2>
            </div>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 list-none p-0 m-0">
              {related.map((p) => (
                <li key={p.id}>
                  <ShopProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  )
}
