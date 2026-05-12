"use client"

import Image from "next/image"
import { format } from "date-fns"
import { useCallback, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  MOCK_ADMIN_ORDERS,
  type AdminOrder,
  type DeliveryStatus,
  type PaymentStatus,
} from "@/lib/admin-mock-data"
import { formatPrice } from "@/lib/shop-data"
import { authPrimaryButtonClass } from "@/components/auth/auth-field-styles"
import { cn } from "@/lib/utils"

const FILTERS = ["All", "Processing", "Shipped", "Delivered"] as const
type FilterKey = (typeof FILTERS)[number]

function paymentBadgeClass(s: PaymentStatus) {
  switch (s) {
    case "Paid":
      return "border-emerald-800/20 bg-emerald-50 text-emerald-900"
    case "Pending":
      return "border-gold/45 bg-gold/12 text-foreground"
    case "Failed":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    default:
      return ""
  }
}

function deliveryBadgeClass(s: DeliveryStatus) {
  switch (s) {
    case "Processing":
      return "border-gold/45 bg-gold/12 text-foreground"
    case "Shipped":
      return "border-transparent bg-primary text-primary-foreground"
    case "Delivered":
      return "border-emerald-800/20 bg-emerald-50 text-emerald-900"
    default:
      return ""
  }
}

export function AdminOrdersPageClient() {
  const [orders, setOrders] = useState<AdminOrder[]>(() => [...MOCK_ADMIN_ORDERS])
  const [filter, setFilter] = useState<FilterKey>("All")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draftDelivery, setDraftDelivery] = useState<DeliveryStatus>("Processing")

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId],
  )

  const filtered = useMemo(() => {
    if (filter === "All") return orders
    return orders.filter((o) => o.deliveryStatus === filter)
  }, [orders, filter])

  const openDetail = useCallback((order: AdminOrder) => {
    setSelectedId(order.id)
    setDraftDelivery(order.deliveryStatus)
    setSheetOpen(true)
  }, [])

  const applyStatusUpdate = useCallback(() => {
    if (!selectedId) return
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, deliveryStatus: draftDelivery } : o)),
    )
    setSheetOpen(false)
    setSelectedId(null)
  }, [selectedId, draftDelivery])

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <h1 className="font-serif text-3xl tracking-wide text-foreground md:text-4xl">Orders</h1>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter orders by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "min-h-9 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors",
              filter === f
                ? "border-gold bg-gold/12 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-gold/40 hover:bg-muted/40",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center py-20">
          <p className="font-serif text-xl text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Order ID
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Items</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Delivery</TableHead>
                <TableHead className="w-[4.5rem] text-[10px] uppercase tracking-wider text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell className="max-w-[12rem] truncate text-sm">{row.customerEmail}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(row.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">{row.itemsCount}</TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">{formatPrice(row.total)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-sm border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                        paymentBadgeClass(row.paymentStatus),
                      )}
                    >
                      {row.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-sm border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                        deliveryBadgeClass(row.deliveryStatus),
                      )}
                    >
                      {row.deliveryStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => openDetail(row)}
                      className="rounded-sm text-sm font-medium text-gold underline-offset-4 transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[min(100vw,28rem)] border-l border-gold/45 bg-card p-0 sm:max-w-xl [&>button]:hidden"
        >
          {selected ? (
            <div className="flex h-full flex-col overflow-y-auto">
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle className="font-serif text-2xl font-normal tracking-wide text-foreground">
                  {selected.id}
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selected.date), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-6 px-6 py-6">
                <section>
                  <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Customer
                  </h2>
                  <p className="text-sm font-medium text-foreground">{selected.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selected.customerEmail}</p>
                  <p className="text-sm text-muted-foreground">{selected.phone}</p>
                  <div className="mt-3 text-sm leading-relaxed text-foreground">
                    {selected.shippingAddressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Items
                  </h2>
                  <ul className="space-y-4">
                    {selected.lines.map((line) => (
                      <li key={line.id} className="flex gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-border">
                          <Image src={line.image} alt={line.imageAlt} fill className="object-cover" sizes="56px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{line.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {line.size ? `Size ${line.size}` : "—"} · Qty {line.qty}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm tabular-nums text-foreground">
                          {formatPrice(line.price * line.qty)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="h-px w-full bg-gold/35" aria-hidden />

                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Order total</span>
                  <span className="font-serif text-lg tabular-nums text-foreground">{formatPrice(selected.total)}</span>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="delivery-status"
                    className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Delivery status
                  </label>
                  <Select value={draftDelivery} onValueChange={(v) => setDraftDelivery(v as DeliveryStatus)}>
                    <SelectTrigger id="delivery-status" className="min-h-11 w-full rounded-sm border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border">
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-auto flex flex-col gap-4 border-t border-border pt-6">
                  <Button type="button" className={cn(authPrimaryButtonClass, "w-full")} onClick={applyStatusUpdate}>
                    Update Status
                  </Button>
                  <button
                    type="button"
                    onClick={() => setSheetOpen(false)}
                    className="text-center text-sm font-medium text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-light"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
