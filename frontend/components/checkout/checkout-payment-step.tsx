"use client"

import { useCallback, useEffect, useState } from "react"
import { PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout"
import { Loader2 } from "lucide-react"

import { CheckoutStripeElements } from "@/components/checkout/checkout-stripe-elements"

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
  customerEmail: string
  buildOrderPayload: (stripePaymentId: string, orderId: string) => CheckoutOrderPayload
  onSuccess: () => void
  onBack: () => void
}

type SessionStatusResponse = {
  status: string | null
  payment_status: string | null
  paymentIntentId: string | null
  orderId: string | null
  error?: string
}

async function fetchSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
  const res = await fetch(`/api/stripe/checkout-session/status?session_id=${encodeURIComponent(sessionId)}`)
  const data = (await res.json()) as SessionStatusResponse
  if (!res.ok) {
    throw new Error(data.error ?? "Could not verify payment")
  }
  return data
}

function PaymentForm({
  checkoutSessionId,
  orderId,
  buildOrderPayload,
  onSuccess,
  onBack,
}: Omit<CheckoutPaymentStepProps, "total" | "customerEmail"> & {
  checkoutSessionId: string
  orderId: string
}) {
  const checkoutState = useCheckoutElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPaying, setIsPaying] = useState(false)

  const completeOrderIfPaid = useCallback(
    async (sessionId: string, resolvedOrderId: string) => {
      const status = await fetchSessionStatus(sessionId)

      if (status.status !== "complete" || status.payment_status !== "paid") {
        setErrorMessage("Payment was not completed. Please try again.")
        return false
      }

      if (!status.paymentIntentId) {
        setErrorMessage("Payment succeeded but could not be verified. Contact support.")
        return false
      }

      const payload = buildOrderPayload(status.paymentIntentId, resolvedOrderId)

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
        return false
      }

      onSuccess()
      return true
    },
    [buildOrderPayload, onSuccess],
  )

  const handlePay = async () => {
    if (checkoutState.type !== "success") return

    setIsPaying(true)
    setErrorMessage(null)

    const { checkout } = checkoutState
    const confirmResult = await checkout.confirm({
      returnUrl: `${window.location.origin}/checkout`,
    })

    if (confirmResult.type === "error") {
      setErrorMessage(confirmResult.error.message ?? "Payment failed. Please try again.")
      setIsPaying(false)
      return
    }

    try {
      await completeOrderIfPaid(checkoutSessionId, orderId)
    } catch {
      setErrorMessage("Could not verify payment. Please try again.")
    } finally {
      setIsPaying(false)
    }
  }

  if (checkoutState.type === "loading") {
    return (
      <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden />
        <span>Loading payment form…</span>
      </div>
    )
  }

  if (checkoutState.type === "error") {
    return (
      <p className="text-sm text-destructive" role="alert">
        {checkoutState.error.message}
      </p>
    )
  }

  const checkoutReady = checkoutState.type === "success"

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
          disabled={!checkoutReady || isPaying}
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
  customerEmail,
  buildOrderPayload,
  onSuccess,
  onBack,
}: CheckoutPaymentStepProps) {
  const [orderId] = useState(createCheckoutOrderId)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function createSession() {
      setIsLoadingSession(true)
      setInitError(null)

      try {
        const res = await fetch("/api/stripe/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            currency: "pln",
            orderId,
            customerEmail,
          }),
        })

        const data = (await res.json()) as {
          clientSecret?: string
          sessionId?: string
          error?: string
        }

        if (cancelled) return

        if (!res.ok || !data.clientSecret || !data.sessionId) {
          setInitError(data.error ?? "Could not start payment. Please try again.")
          setClientSecret(null)
          setCheckoutSessionId(null)
          return
        }

        setClientSecret(data.clientSecret)
        setCheckoutSessionId(data.sessionId)
      } catch {
        if (!cancelled) {
          setInitError("Could not start payment. Please try again.")
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSession(false)
        }
      }
    }

    void createSession()

    return () => {
      cancelled = true
    }
  }, [total, orderId, customerEmail])

  if (isLoadingSession) {
    return (
      <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-gold" aria-hidden />
        <span>Preparing secure payment…</span>
      </div>
    )
  }

  if (initError || !clientSecret || !checkoutSessionId) {
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
    <CheckoutStripeElements clientSecret={clientSecret}>
      <PaymentForm
        checkoutSessionId={checkoutSessionId}
        orderId={orderId}
        buildOrderPayload={buildOrderPayload}
        onSuccess={onSuccess}
        onBack={onBack}
      />
    </CheckoutStripeElements>
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
