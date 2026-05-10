"use client"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { CATEGORY_TAGLINES, formatPrice, type ShopProduct } from "@/lib/shop-data"

export type ShopProductCardProps = {
  product: ShopProduct
  /** When set, opening the add flow also notifies parent (shop listing → confirmation modal). */
  onAddedToCart?: (product: ShopProduct) => void
}

function CardActions({
  slug,
  product,
  onAddedToCart,
}: {
  slug: string
  product: ShopProduct
  onAddedToCart?: (product: ShopProduct) => void
}) {
  const { addProduct } = useCart()
  const detailHref = `/product/${slug}`

  const actionBtn =
    "flex h-9 min-h-9 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-sm px-1 text-[10px] font-medium tracking-widest uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 sm:h-10 sm:min-h-10 sm:px-2 sm:text-[11px]"

  const handleAdd = () => {
    addProduct({ product, quantity: 1 })
    onAddedToCart?.(product)
  }

  return (
    <div className="mx-auto flex w-full max-w-[min(100%,17rem)] flex-row items-stretch gap-1.5 sm:max-w-none sm:gap-2">
      <button
        type="button"
        className={cn(actionBtn, "bg-primary text-primary-foreground hover:bg-primary/90")}
        onClick={handleAdd}
      >
        Add to Cart
      </button>
      <Link
        href={detailHref}
        className={cn(
          actionBtn,
          "border border-primary bg-background/95 text-primary hover:bg-primary hover:text-primary-foreground",
        )}
      >
        Quick View
      </Link>
    </div>
  )
}

export function ShopProductCard({ product, onAddedToCart }: ShopProductCardProps) {
  const detailHref = `/product/${product.slug}`

  return (
    <article className="group rounded-sm border border-transparent">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-card lg:mb-4">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 lg:group-hover:scale-[1.04]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 bg-black/40 p-3 sm:p-4 lg:flex lg:items-center lg:justify-center">
          <div className="pointer-events-auto w-full px-1">
            <CardActions slug={product.slug} product={product} onAddedToCart={onAddedToCart} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-center rounded-sm border border-border bg-card px-2 py-2.5 sm:px-3 sm:py-3 lg:hidden">
        <CardActions slug={product.slug} product={product} onAddedToCart={onAddedToCart} />
      </div>

      <div className="text-center space-y-1">
        <Link
          href={detailHref}
          className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <h3 className="font-serif text-base md:text-lg text-foreground transition-colors lg:group-hover:text-gold">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          {CATEGORY_TAGLINES[product.category].label}
        </p>
        <p className="text-gold font-medium tracking-wide">{formatPrice(product.price)}</p>
      </div>
    </article>
  )
}
