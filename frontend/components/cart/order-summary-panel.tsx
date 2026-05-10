import type { ReactNode } from "react"

import { formatPrice } from "@/lib/shop-data"

export function PaymentIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-2" aria-label="Accepted payment methods">
      <span className="sr-only">Visa, Mastercard, and Stripe accepted</span>
      <svg width="40" height="26" viewBox="0 0 40 26" className="shrink-0" aria-hidden>
        <rect width="40" height="26" rx="3" fill="#1A1F71" />
        <text x="20" y="17" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="system-ui,sans-serif" fontWeight="700">
          VISA
        </text>
      </svg>
      <svg width="40" height="26" viewBox="0 0 40 26" className="shrink-0" aria-hidden>
        <rect width="40" height="26" rx="3" fill="#f5f5f5" stroke="#E8E0D4" />
        <circle cx="17" cy="13" r="7" fill="#EB001B" opacity="0.9" />
        <circle cx="23" cy="13" r="7" fill="#F79E1B" opacity="0.9" />
      </svg>
      <svg width="48" height="26" viewBox="0 0 48 26" className="shrink-0" aria-hidden>
        <rect width="48" height="26" rx="3" fill="#635BFF" />
        <text x="24" y="17" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="system-ui,sans-serif" fontWeight="600">
          stripe
        </text>
      </svg>
    </div>
  )
}

type OrderSummaryPanelProps = {
  subtotal: number
  shippingRight: string
  total: number
  /** Optional block above the “Order summary” title (e.g. read-only line items). */
  lead?: ReactNode
  footer?: ReactNode
}

export function OrderSummaryPanel({
  subtotal,
  shippingRight,
  total,
  lead,
  footer,
}: OrderSummaryPanelProps) {
  return (
    <aside className="rounded-sm border border-border bg-card p-6 shadow-sm lg:sticky lg:top-28 lg:self-start">
      {lead}
      <h2 className="font-serif text-xl tracking-wide text-foreground mb-6">Order summary</h2>
      <dl className="space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Items subtotal</dt>
          <dd className="font-medium tabular-nums text-foreground">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="text-right text-muted-foreground">{shippingRight}</dd>
        </div>
      </dl>
      <div className="my-6 h-px bg-gold/40" aria-hidden />
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <span className="text-sm tracking-widest uppercase text-muted-foreground">Total</span>
        <span className="font-serif text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
          {formatPrice(total)}
        </span>
      </div>
      {footer}
    </aside>
  )
}
