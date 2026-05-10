"use client"

import Image from "next/image"
import Link from "next/link"
import { Lock, Minus, Plus, ShoppingBag } from "lucide-react"

import {
  OrderSummaryPanel,
  PaymentIcons,
} from "@/components/cart/order-summary-panel"
import { useCart, type CartLine } from "@/contexts/cart-context"
import { CATEGORY_TAGLINES, formatPrice } from "@/lib/shop-data"

function CartLineRow({ line }: { line: CartLine }) {
  const { setLineQuantity, removeLine } = useCart()
  const categoryLabel = CATEGORY_TAGLINES[line.category].label
  const lineTotal = line.unitPrice * line.quantity

  const dec = () => setLineQuantity(line.lineId, line.quantity - 1)
  const inc = () => setLineQuantity(line.lineId, line.quantity + 1)

  return (
    <li className="rounded-sm border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <Link
          href={`/product/${line.slug}`}
          className="relative h-28 w-20 shrink-0 overflow-hidden rounded-sm border border-border bg-card sm:h-32 sm:w-24"
        >
          <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
        </Link>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Link
              href={`/product/${line.slug}`}
              className="font-serif text-lg text-foreground hover:text-gold transition-colors"
            >
              {line.name}
            </Link>
            <p className="mt-1 text-xs tracking-widest uppercase text-muted-foreground">
              {categoryLabel}
            </p>
            {line.size ? (
              <p className="mt-2 text-sm text-foreground">
                <span className="text-muted-foreground">Size </span>
                {line.size}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div
              className="inline-flex w-fit items-stretch overflow-hidden rounded-md border border-border bg-card"
              role="group"
              aria-label={`Quantity for ${line.name}`}
            >
              <button
                type="button"
                onClick={dec}
                disabled={line.quantity <= 1}
                className="flex min-h-11 min-w-11 items-center justify-center text-foreground hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/50"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="flex min-w-[2.75rem] items-center justify-center border-x border-border px-2 text-sm font-medium tabular-nums">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={inc}
                disabled={line.quantity >= 10}
                className="flex min-h-11 min-w-11 items-center justify-center text-foreground hover:bg-muted transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="text-sm tabular-nums text-foreground">
                <span className="text-muted-foreground">Line total </span>
                <span className="font-medium text-gold">{formatPrice(lineTotal)}</span>
              </p>
              <button
                type="button"
                onClick={() => removeLine(line.lineId)}
                className="text-sm text-gold tracking-wide underline-offset-4 hover:text-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

function CartOrderSummary({ subtotal }: { subtotal: number }) {
  return (
    <OrderSummaryPanel
      subtotal={subtotal}
      shippingRight="Calculated at next step"
      total={subtotal}
      footer={
        <>
          <Link
            href="/checkout"
            className="flex min-h-12 w-full items-center justify-center bg-primary px-6 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Proceed to Checkout
          </Link>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
            <span>Secure checkout</span>
          </p>
          <PaymentIcons />
        </>
      }
    />
  )
}

export function CartPageClient() {
  const { lines } = useCart()
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)

  if (lines.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pt-32">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-gold"
            aria-hidden
          >
            <ShoppingBag className="h-8 w-8" strokeWidth={1.25} />
          </div>
          <h1 className="font-serif text-3xl tracking-wide text-foreground md:text-4xl">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Discover pieces crafted for lasting elegance in the boutique.
          </p>
          <Link
            href="/shop"
            className="mt-8 flex min-h-12 w-full max-w-xs items-center justify-center bg-primary px-8 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-32">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 flex-1 lg:w-[65%] lg:flex-none lg:max-w-[65%]">
          <h1 className="font-serif text-3xl tracking-wide text-foreground md:text-4xl lg:text-5xl mb-8 md:mb-10">
            Your Cart
          </h1>

          <ul className="m-0 list-none space-y-4 p-0">
            {lines.map((line) => (
              <CartLineRow key={line.lineId} line={line} />
            ))}
          </ul>

          <div className="mt-10">
            <Link
              href="/shop"
              className="text-sm text-gold tracking-wide underline-offset-4 hover:text-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-[35%] lg:max-w-md">
          <CartOrderSummary subtotal={subtotal} />
        </div>
      </div>
    </div>
  )
}
