"use client"

import { useEffect, type ReactNode } from "react"
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout"

import { getStripe } from "@/lib/stripe-client"

type CheckoutStripeElementsProps = {
  clientSecret: string
  children: ReactNode
}

function removeStripeBadgeNodes() {
  document
    .querySelectorAll<HTMLIFrameElement>(
      'iframe[name="stripe-badge-iframe"], iframe[src*="stripe"]',
    )
    .forEach((node) => {
      if (node.name === "stripe-badge-iframe" || node.src.includes("badge")) {
        node.remove()
      }
    })
}

/** Checkout Sessions Elements — mount only on the payment step; unmount cleans up stray badge iframes. */
export function CheckoutStripeElements({ clientSecret, children }: CheckoutStripeElementsProps) {
  useEffect(() => {
    return () => {
      removeStripeBadgeNodes()
    }
  }, [])

  return (
    <CheckoutElementsProvider
      stripe={getStripe()}
      options={{
        clientSecret,
        elementsOptions: {
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#C9A84C",
              colorBackground: "#F5EFE0",
              colorText: "#0D0D0D",
              fontFamily: "inherit",
              borderRadius: "4px",
            },
          },
        },
      }}
    >
      {children}
    </CheckoutElementsProvider>
  )
}
