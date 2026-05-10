"use client"

import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatPrice, type ShopProduct } from "@/lib/shop-data"

type AddedToCartModalProps = {
  product: ShopProduct | null
  onClose: () => void
}

export function AddedToCartModal({ product, onClose }: AddedToCartModalProps) {
  const open = product !== null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        panelMotion="fade"
        overlayClassName="z-[90] bg-black/40 duration-300"
        className="z-[100] w-full max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-sm border border-border bg-cream p-0 shadow-xl sm:max-w-md"
      >
        {product ? (
          <div className="relative px-6 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12">
            <DialogClose asChild>
              <button
                type="button"
                className="absolute right-3 top-3 rounded-sm p-2 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                aria-label="Close"
              >
                <span className="block text-lg leading-none font-light" aria-hidden>
                  ×
                </span>
              </button>
            </DialogClose>

            <div className="flex flex-col items-center text-center">
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold text-gold"
                aria-hidden
              >
                <Check className="h-7 w-7 stroke-[2]" strokeLinecap="round" strokeLinejoin="round" />
              </div>

              <DialogTitle className="font-serif text-xl tracking-wide text-foreground sm:text-2xl">
                Item added to your cart
              </DialogTitle>

              <div className="mt-6 flex w-full max-w-md flex-col items-center gap-5 border-t border-border pt-6">
                <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-sm border border-border bg-card shadow-sm sm:w-32">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 112px, 128px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-serif text-lg text-foreground">{product.name}</p>
                  <p className="mt-1 text-sm text-gold tracking-wide">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex min-h-11 w-full items-center justify-center bg-primary px-6 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  Go to Cart
                </Link>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-center border-2 border-primary bg-transparent px-6 py-3 text-xs tracking-widest uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    Continue Shopping
                  </button>
                </DialogClose>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
