import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { CATEGORY_TAGLINES, formatPrice, type ShopProduct } from "@/lib/shop-data"

type ShopProductCardProps = {
  product: ShopProduct
}

function CardActions({
  product,
  layout,
}: {
  product: ShopProduct
  layout: "overlay" | "inline"
}) {
  const detailHref = `/product/${product.slug}`
  const baseBtn =
    "min-h-11 text-xs tracking-widest uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"

  return (
    <div
      className={cn(
        "flex gap-2",
        layout === "overlay" &&
          "w-full max-w-[220px] flex-col sm:max-w-none sm:flex-row sm:justify-center",
        layout === "inline" && "flex-col sm:flex-row",
      )}
    >
      <button
        type="button"
        className={cn(
          baseBtn,
          "bg-primary px-3 text-primary-foreground hover:bg-primary/90 sm:flex-none sm:px-4",
          layout === "overlay" && "flex-1",
          layout === "inline" && "w-full sm:w-auto sm:flex-1",
        )}
      >
        Add to cart
      </button>
      <Link
        href={detailHref}
        className={cn(
          baseBtn,
          "inline-flex flex-1 items-center justify-center border-2 border-primary bg-background/95 px-3 text-center font-medium text-primary hover:bg-primary hover:text-primary-foreground sm:flex-none sm:px-4",
          layout === "inline" && "w-full sm:w-auto",
        )}
      >
        Show details
      </Link>
    </div>
  )
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const detailHref = `/product/${product.slug}`

  return (
    <article className="group rounded-sm">
      <div className="relative aspect-[3/4] overflow-hidden bg-card lg:mb-4">
        <Image
          src={product.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 lg:group-hover:scale-[1.04]"
          aria-hidden
        />
        {/* lg+: hover overlay — pointer events only while hovered */}
        <div className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 bg-primary/20 p-3 lg:flex lg:items-center lg:justify-center">
          <div className="pointer-events-auto">
            <CardActions product={product} layout="overlay" />
          </div>
        </div>
      </div>

      {/* &lt;lg: actions always visible under image */}
      <div className="mb-4 border-b border-border bg-card px-2 py-3 lg:hidden">
        <CardActions product={product} layout="inline" />
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
