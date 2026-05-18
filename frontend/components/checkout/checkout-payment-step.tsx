"use client"

import { useEffect, useState } from "react"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { Loader2 } from "lucide-react"

import { getStripe } from "@/lib/stripe-client"

export type CheckoutOrderPayload = {
  orderId: string
  email: string
  userId?: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shippingCost: number
  items: {
    productId: string
    productName: string
    price: number
    size: string
    quantity: number
  }[]
  stripePaymentId: string
}

type CheckoutPaymentStepProps = {
  total: number
  buildOrderPayload: (stripePaymentId: string, orderId: string) => CheckoutOrderPayload
  onSuccess: () => void
  onBack: () => void
}

function PaymentForm({
  orderId,
  buildOrderPayload,
  onSuccess,
  onBack,
}: Omit<CheckoutPaymentStepProps, "total"> & { orderId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  const handlePay = async () => {
    if (!stripe || !elements) return

    setIsPaying(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/checkout`,
      },
    })

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.")
      setIsPaying(false)
      return
    }

    if (paymentIntent?.status !== "succeeded") {
      setErrorMessage("Payment was not completed. Please try again.")
      setIsPaying(false)
      return
    }

    const payload = buildOrderPayload(paymentIntent.id, orderId)

    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: payload.orderId,
        email: payload.email,
        userId: payload.userId,
        shippingName: payload.shippingName,
        shippingPhone: payload.shippingPhone,
        shippingAddress: payload.shippingAddress,
        shippingCost: payload.shippingCost,
        items: payload.items,
        stripePaymentId: payload.stripePaymentId,
        paymentStatus: "PAID",
      }),
    })

    if (!orderRes.ok) {
      const data = (await orderRes.json().catch(() => ({}))) as { error?: string }
      setErrorMessage(data.error ?? "Payment succeeded but order could not be created. Contact support.")
      setIsPaying(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="space-y-8">
      <PaymentElement
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
        }}
      />

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isPaying}
          className="flex min-h-12 items-center justify-center border-2 border-border px-6 py-3 text-xs tracking-widest uppercase text-foreground transition-colors hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 sm:w-auto"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void handlePay()}
          disabled={!stripe || !elements || isPaying}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-primary px-6 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40"
        >
          {isPaying ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              Processing
            </>
          ) : (
            "Pay now"
          )}
        </button>
      </div>
    </div>
  )
}

function createCheckoutOrderId() {
  return crypto.randomUUID()
}

export function CheckoutPaymentStep({
  total,
  buildOrderPayload,
  onSuccess,
  onBack,
}: CheckoutPaymentStepProps) {
  const [orderId] = useState(createCheckoutOrderId)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [isLoadingIntent, setIsLoadingIntent] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function createIntent() {
      setIsLoadingIntent(true)
      setInitError(null)

      try {
        const res = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            currency: "pln",
            orderId,
          }),
        })

        const data = (await res.json()) as { clientSecret?: string; error?: string }

        if (cancelled) return

        if (!res.ok || !data.clientSecret) {
          setInitError(data.error ?? "Could not start payment. Please try again.")
          setClientSecret(null)
          return
        }

        setClientSecret(data.clientSecret)
      } catch {
        if (!cancelled) {
          setInitError("Could not start payment. Please try again.")
        }
      } finally {
        if (!cancelled) {
          setIsLoadingIntent(false)
        }
      }
    }

    void createIntent()

    return () => {
      cancelled = true
    }
  }, [total, orderId])

  if (isLoadingIntent) {
    return (
      <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden />
        <span>Preparing secure payment…</span>
      </div>
    )
  }

  if (initError || !clientSecret) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive" role="alert">
          {initError ?? "Payment could not be initialized."}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
        >
          Back to shipping
        </button>
      </div>
    )
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
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
      }}
    >
      <PaymentForm
        orderId={orderId}
        buildOrderPayload={buildOrderPayload}
        onSuccess={onSuccess}
        onBack={onBack}
      />
    </Elements>
  )
}

export function formatShippingAddress(
  streetName: string,
  buildingNumber: string,
  apartment: string,
  city: string,
  postal: string,
): string {
  const line1 = `${streetName.trim()} ${buildingNumber.trim()}, ${apartment.trim()}`
  return [line1, `${postal.trim()} ${city.trim()}`, "Poland"].filter(Boolean).join("\n")
}

export function formatParcelLockerShippingAddress(lockerName: string, lockerAddress: string): string {
  return [`InPost parcel locker — ${lockerName.trim()}`, lockerAddress.trim(), "Poland"].filter(Boolean).join("\n")
}
