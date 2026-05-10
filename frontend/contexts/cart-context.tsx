"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import type { ApparelSize, ProductCategory, ShopProduct } from "@/lib/shop-data"

export type CartLine = {
  lineId: string
  productId: string
  slug: string
  name: string
  category: ProductCategory
  image: string
  unitPrice: number
  quantity: number
  /** Set when added from PDP with sizes; null for shop / no-size items */
  size: ApparelSize | null
}

export type AddProductInput = {
  product: ShopProduct
  quantity?: number
  size?: ApparelSize | null
}

const MAX_LINE_QTY = 10

function lineIdFor(productId: string, size: ApparelSize | null) {
  return `${productId}::${size ?? "_"}`
}

type CartContextValue = {
  lines: CartLine[]
  count: number
  addProduct: (input: AddProductInput) => void
  setLineQuantity: (lineId: string, quantity: number) => void
  removeLine: (lineId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  )

  const addProduct = useCallback((input: AddProductInput) => {
    const { product, quantity = 1, size = null } = input
    const q = Math.max(1, Math.min(MAX_LINE_QTY, Math.floor(quantity)))
    const lineSize: ApparelSize | null = product.hasSizes ? size : null
    const lineId = lineIdFor(product.id, lineSize)

    setLines((prev) => {
      const idx = prev.findIndex((l) => l.lineId === lineId)
      if (idx >= 0) {
        const next = [...prev]
        const merged = Math.min(MAX_LINE_QTY, next[idx].quantity + q)
        next[idx] = { ...next[idx], quantity: merged }
        return next
      }
      return [
        ...prev,
        {
          lineId,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          image: product.image,
          unitPrice: product.price,
          quantity: q,
          size: lineSize,
        },
      ]
    })
  }, [])

  const setLineQuantity = useCallback((lineId: string, quantity: number) => {
    const q = Math.floor(quantity)
    if (q <= 0) {
      setLines((prev) => prev.filter((l) => l.lineId !== lineId))
      return
    }
    const capped = Math.min(MAX_LINE_QTY, Math.max(1, q))
    setLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, quantity: capped } : l)),
    )
  }, [])

  const removeLine = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId))
  }, [])

  const value = useMemo(
    () => ({
      lines,
      count,
      addProduct,
      setLineQuantity,
      removeLine,
    }),
    [lines, count, addProduct, setLineQuantity, removeLine],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider")
  }
  return ctx
}
