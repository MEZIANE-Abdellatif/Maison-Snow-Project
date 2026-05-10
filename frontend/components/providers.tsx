"use client"

import type { ReactNode } from "react"

import { CartProvider } from "@/contexts/cart-context"
import { MockAuthProvider } from "@/contexts/mock-auth-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <MockAuthProvider>{children}</MockAuthProvider>
    </CartProvider>
  )
}
