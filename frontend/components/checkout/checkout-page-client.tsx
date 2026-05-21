"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { Check, Loader2, Lock } from "lucide-react"

import { cn } from "@/lib/utils"

import { checkEmail } from "@/lib/checkout-mock-email"

import {
  OrderSummaryPanel,
  PaymentIcons,
} from "@/components/cart/order-summary-panel"
import { useCart } from "@/contexts/cart-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPrice } from "@/lib/shop-data"
import {
  CheckoutPaymentStep,
  formatParcelLockerShippingAddress,
  formatShippingAddress,
  type CheckoutOrderPayload,
} from "@/components/checkout/checkout-payment-step"
import { InPostGeowidget, INPOST_MOCK_LOCKERS } from "@/components/InPostGeowidget"
import type { UserAddress } from "@/lib/address-api"

const STEPS = [
  { id: "email", label: "Email" },
  { id: "info", label: "Info & Shipping" },
  { id: "payment", label: "Payment" },
  { id: "confirmed", label: "Confirmed" },
] as const

type DeliveryMode = "parcel_locker" | "home"
type HomeCarrier = "inpost_courier" | "poczta_polska"

const FEE_PARCEL_LOCKER = 12
const FEE_HOME_INPOST = 15
const FEE_HOME_POCHTA = 12

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

type EmailUiState = "collect" | "checking" | "signin"

type AddressFieldKey = "streetName" | "buildingNumber" | "apartment" | "city" | "postal"

const BUILDING_NUMBER_REGEX = /^[0-9]+[A-Za-z0-9/]*$/
const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/

function normalizePolishPostalInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 5)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}-${digits.slice(2)}`
}

function getAddressFieldError(field: AddressFieldKey, value: string): string | null {
  const trimmed = value.trim()

  switch (field) {
    case "streetName":
      if (!trimmed) return "Street name is required"
      if (trimmed.length < 3) return "Street name must be at least 3 characters"
      return null
    case "buildingNumber":
      if (!trimmed) return "Building number is required"
      if (!BUILDING_NUMBER_REGEX.test(trimmed)) {
        return "Enter a valid building number (e.g. 10, 10A, 10/2)"
      }
      return null
    case "apartment":
      if (!trimmed) return "Apartment / floor is required"
      if (trimmed.length < 2) return "Enter at least 2 characters"
      return null
    case "city":
      if (!trimmed) return "City is required"
      if (trimmed.length < 2) return "City must be at least 2 characters"
      return null
    case "postal":
      if (!trimmed) return "Postal code is required"
      if (!POSTAL_CODE_REGEX.test(trimmed)) {
        return "Please enter a valid Polish postal code (00-000)"
      }
      return null
    default:
      return null
  }
}

function isAddressFieldValid(field: AddressFieldKey, value: string): boolean {
  return getAddressFieldError(field, value) === null
}

type AddressFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  touched: boolean
  error: string | null
  placeholder?: string
  autoComplete?: string
  /** Transform raw input (e.g. postal auto-format) */
  normalizeOnChange?: (raw: string) => string
}

function AddressField({
  id,
  label,
  value,
  onChange,
  onBlur,
  touched,
  error,
  placeholder,
  autoComplete,
  normalizeOnChange,
}: AddressFieldProps) {
  const showError = touched && Boolean(error)
  const showValid = touched && !error && value.trim().length > 0

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs tracking-widest uppercase text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            const next = normalizeOnChange ? normalizeOnChange(e.target.value) : e.target.value
            onChange(next)
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          className={cn(
            "min-h-11 bg-card pr-10 transition-colors focus-visible:border-gold focus-visible:ring-gold/60",
            showError ? "border-destructive" : "border-border",
          )}
        />
        {showValid ? (
          <Check
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600"
            strokeWidth={2.5}
            aria-hidden
          />
        ) : null}
      </div>
      {showError ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function CheckoutProgress({ step }: { step: number }) {
  return (
    <nav aria-label="Checkout progress" className="mb-10 md:mb-14">
      <ol className="mx-auto flex max-w-4xl list-none items-start justify-center gap-0 p-0 px-1">
        {STEPS.map((s, i) => {
          const done = step === 3 || i < step
          const current = step < 3 && i === step

          return (
            <Fragment key={s.id}>
              {i > 0 ? (
                <li
                  aria-hidden
                  className="flex h-9 min-h-9 min-w-0 flex-1 list-none items-center px-1 sm:px-2"
                >
                  <div
                    className={`h-0.5 w-full rounded-full ${step > i - 1 || step === 3 ? "bg-gold" : "bg-border"}`}
                  />
                </li>
              ) : null}
              <li className="flex w-[4.5rem] shrink-0 list-none flex-col items-center gap-2 sm:w-24">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-semibold tabular-nums transition-colors ${
                    done
                      ? "border-gold bg-gold text-primary-foreground"
                      : current
                        ? "border-gold bg-transparent text-gold"
                        : "border-border bg-transparent text-muted-foreground"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : i + 1}
                </span>
                <span
                  className={`text-center text-[9px] font-medium leading-tight tracking-widest uppercase sm:text-[10px] ${
                    done ? "text-gold" : current ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.label.split(" ")[0]}</span>
                </span>
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

function ReadOnlyCartLines() {
  const { lines } = useCart()
  return (
    <ul className="mb-6 space-y-4 border-b border-border pb-6">
      {lines.map((line) => (
        <li key={line.lineId} className="flex gap-3 text-sm">
          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-sm border border-border bg-muted/30">
            <Image src={line.image} alt={line.name} fill sizes="44px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-medium leading-snug text-foreground">{line.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Qty {line.quantity}</p>
          </div>
          <p className="shrink-0 tabular-nums text-foreground">
            {formatPrice(line.unitPrice * line.quantity)}
          </p>
        </li>
      ))}
    </ul>
  )
}

export function CheckoutPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lines, removeLine } = useCart()
  const { data: session, status: sessionStatus } = useSession()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState("")
  const [emailUi, setEmailUi] = useState<EmailUiState>("collect")
  const [welcomeName, setWelcomeName] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [streetName, setStreetName] = useState("")
  const [buildingNumber, setBuildingNumber] = useState("")
  const [apartment, setApartment] = useState("")
  const [city, setCity] = useState("")
  const [postal, setPostal] = useState("")
  const [addressTouched, setAddressTouched] = useState<Partial<Record<AddressFieldKey, boolean>>>({})
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("parcel_locker")
  const [homeCarrier, setHomeCarrier] = useState<HomeCarrier>("inpost_courier")
  const [selectedLockerId, setSelectedLockerId] = useState("")
  const [lockerTouched, setLockerTouched] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const [paymentMountKey, setPaymentMountKey] = useState(0)
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [usingSavedAddress, setUsingSavedAddress] = useState(false)
  const [activeSavedAddressId, setActiveSavedAddressId] = useState<string | null>(null)

  const isAuthenticated = sessionStatus === "authenticated" && Boolean(session?.user)

  const applySavedAddress = useCallback((addr: UserAddress) => {
    setStreetName(addr.street)
    setBuildingNumber(addr.building)
    setApartment(addr.apartment)
    setCity(addr.city)
    setPostal(addr.postalCode)
    setUsingSavedAddress(true)
    setActiveSavedAddressId(addr.id)
    setAddressTouched({})
  }, [])

  const clearSavedAddressForm = useCallback(() => {
    setStreetName("")
    setBuildingNumber("")
    setApartment("")
    setCity("")
    setPostal("")
    setUsingSavedAddress(false)
    setActiveSavedAddressId(null)
    setAddressTouched({})
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !session?.user) return

    if (session.user.email) {
      setEmail(session.user.email)
    }
    const name = [session.user.firstName, session.user.lastName].filter(Boolean).join(" ").trim()
    if (name) {
      setFullName(name)
    }
    setStep(1)
  }, [isAuthenticated, session])

  useEffect(() => {
    if (!isAuthenticated || step !== 1) return

    let cancelled = false

    async function loadSavedAddresses() {
      try {
        const res = await fetch("/api/users/addresses")
        if (!res.ok || cancelled) return
        const data = (await res.json()) as UserAddress[]
        if (cancelled) return
        setSavedAddresses(data)
        if (data.length === 0) return
        const defaultAddr = data.find((a) => a.isDefault) ?? data[0]
        applySavedAddress(defaultAddr)
      } catch {
        if (!cancelled) setSavedAddresses([])
      }
    }

    void loadSavedAddresses()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, step, applySavedAddress])

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines],
  )

  const shippingFee = useMemo(() => {
    if (step < 1) return 0
    if (deliveryMode === "parcel_locker") return FEE_PARCEL_LOCKER
    return homeCarrier === "inpost_courier" ? FEE_HOME_INPOST : FEE_HOME_POCHTA
  }, [step, deliveryMode, homeCarrier])

  const shippingRight = useMemo(() => {
    if (step < 1) return "Calculated at next step"
    if (deliveryMode === "parcel_locker") return `${formatPrice(FEE_PARCEL_LOCKER)}`
    if (homeCarrier === "inpost_courier") return `${formatPrice(FEE_HOME_INPOST)}`
    return `${formatPrice(FEE_HOME_POCHTA)}`
  }, [step, deliveryMode, homeCarrier])
  const total = step < 1 ? subtotal : subtotal + shippingFee

  const buildOrderPayload = useCallback(
    (stripePaymentId: string, orderId: string): CheckoutOrderPayload => ({
      orderId,
      email: email.trim().toLowerCase(),
      userId: session?.user?.id,
      shippingName: fullName.trim(),
      shippingPhone: phone.trim(),
      shippingAddress: (() => {
        if (deliveryMode === "parcel_locker") {
          const locker = INPOST_MOCK_LOCKERS.find((l) => l.id === selectedLockerId)
          return locker
            ? formatParcelLockerShippingAddress(locker.name, locker.address)
            : ""
        }
        return formatShippingAddress(streetName, buildingNumber, apartment, city, postal)
      })(),
      shippingCost: shippingFee,
      stripePaymentId,
      items: lines.map((line) => ({
        productId: line.productId,
        productName: line.name,
        price: line.unitPrice,
        size: line.size ?? "One size",
        quantity: line.quantity,
      })),
    }),
    [
      email,
      session?.user?.id,
      fullName,
      phone,
      deliveryMode,
      selectedLockerId,
      streetName,
      buildingNumber,
      apartment,
      city,
      postal,
      shippingFee,
      lines,
    ],
  )

  useEffect(() => {
    const returnSessionId = searchParams.get("session_id")
    if (!returnSessionId || lines.length === 0) return

    const sessionId = returnSessionId
    let cancelled = false

    async function completeReturn() {
      try {
        const res = await fetch(
          `/api/stripe/checkout-session/status?session_id=${encodeURIComponent(sessionId)}`,
        )
        const data = (await res.json()) as {
          status: string | null
          payment_status: string | null
          paymentIntentId: string | null
          orderId: string | null
          error?: string
        }

        if (cancelled) return

        if (
          data.status !== "complete" ||
          data.payment_status !== "paid" ||
          !data.paymentIntentId ||
          !data.orderId
        ) {
          setStep(2)
          router.replace("/checkout")
          return
        }

        const payload = buildOrderPayload(data.paymentIntentId, data.orderId)
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
          setStep(2)
          router.replace("/checkout")
          return
        }

        for (const line of lines) {
          removeLine(line.lineId)
        }
        setPaymentMountKey((key) => key + 1)
        setStep(3)
        router.replace("/checkout")
      } catch {
        if (!cancelled) {
          setStep(2)
          router.replace("/checkout")
        }
      }
    }

    void completeReturn()

    return () => {
      cancelled = true
    }
  }, [searchParams, lines, removeLine, router, buildOrderPayload])

  const emailValid = emailLooksValid(email)
  /** Guest path still requires a valid email; link stays off until the address is complete. */
  const guestLinkEnabled = emailValid
  const showPasswordBlock = emailUi === "signin"

  const touchAddressField = (field: AddressFieldKey) => {
    setAddressTouched((prev) => ({ ...prev, [field]: true }))
  }

  const touchAllAddressFields = () => {
    setAddressTouched({
      streetName: true,
      buildingNumber: true,
      apartment: true,
      city: true,
      postal: true,
    })
  }

  const isShippingAddressValid = useMemo(
    () =>
      isAddressFieldValid("streetName", streetName) &&
      isAddressFieldValid("buildingNumber", buildingNumber) &&
      isAddressFieldValid("apartment", apartment) &&
      isAddressFieldValid("city", city) &&
      isAddressFieldValid("postal", postal),
    [streetName, buildingNumber, apartment, city, postal],
  )

  const onEmailChange = (value: string) => {
    setEmail(value)
    setEmailUi("collect")
    setWelcomeName(null)
    setPassword("")
  }

  const continueAsGuest = () => {
    setStep(1)
  }

  const runEmailContinue = async () => {
    if (!emailValid) return
    if (emailUi === "signin") {
      if (!password.trim()) return
      setSignInError(null)
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })
      if (result?.error) {
        setSignInError("Invalid email or password")
        return
      }
      setStep(1)
      return
    }
    setEmailUi("checking")
    setSignInError(null)
    const result = await checkEmail(email)
    if (!result.found) {
      setEmailUi("collect")
      setStep(1)
      return
    }
    setWelcomeName(result.name)
    setEmailUi("signin")
  }

  if (lines.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pt-32">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-serif text-3xl tracking-wide text-foreground md:text-4xl">
            Your bag is empty
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Add pieces from the boutique before checking out.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-primary px-10 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Start shopping
          </Link>
        </div>
      </div>
    )
  }

  const summaryFooter =
    step < 3 ? (
      <>
        <p className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          <span>Secure checkout</span>
        </p>
        <PaymentIcons />
      </>
    ) : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-32">
      <CheckoutProgress step={step} />

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <div className="min-w-0 flex-1 lg:w-[65%] lg:max-w-[65%]">
          {step === 0 && !isAuthenticated ? (
            <section aria-labelledby="checkout-email-heading" className="max-w-xl">
              <h1
                id="checkout-email-heading"
                className="font-serif text-3xl tracking-wide text-foreground md:text-4xl mb-2"
              >
                Welcome to Maison Snow
              </h1>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Sign in for a faster experience or continue as guest
              </p>
              <div className="space-y-2">
                <Label htmlFor="checkout-email" className="text-xs tracking-widest uppercase text-muted-foreground">
                  Email
                </Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    disabled={emailUi === "checking"}
                    className="min-h-11 min-w-0 flex-1 border-border bg-card disabled:opacity-60"
                    placeholder="you@example.com"
                  />
                  <button
                    type="button"
                    disabled={
                      emailUi === "checking" ||
                      (emailUi !== "signin" && !emailValid) ||
                      (emailUi === "signin" && !password.trim())
                    }
                    onClick={() => void runEmailContinue()}
                    className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 bg-primary px-5 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 sm:w-auto"
                  >
                    {emailUi === "checking" ? (
                      <>
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                        Checking
                      </>
                    ) : emailUi === "signin" ? (
                      "Sign in & Continue"
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${showPasswordBlock ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className={`space-y-3 pt-4 transition-opacity duration-300 ease-out ${showPasswordBlock ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      {welcomeName ? (
                        <p className="text-sm text-muted-foreground">
                          Welcome back, <span className="text-foreground font-medium">{welcomeName}</span>
                        </p>
                      ) : null}
                      <div className="space-y-2">
                        <Label htmlFor="checkout-password" className="text-xs tracking-widest uppercase text-muted-foreground">
                          Password
                        </Label>
                        <Input
                          id="checkout-password"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          tabIndex={showPasswordBlock ? undefined : -1}
                          aria-hidden={!showPasswordBlock}
                          className="min-h-11 border-border bg-card"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {signInError ? (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {signInError}
                </p>
              ) : null}

              <p className="mt-5 text-center">
                {guestLinkEnabled ? (
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="border-0 bg-transparent p-0 text-center text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                  >
                    or continue as guest
                  </button>
                ) : (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <span className="inline-block cursor-not-allowed rounded-sm outline-none">
                        <button
                          type="button"
                          aria-disabled
                          tabIndex={-1}
                          className="pointer-events-none cursor-not-allowed border-0 bg-transparent p-0 text-center text-xs text-muted-foreground/45 underline-offset-4 rounded-sm"
                        >
                          or continue as guest
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6} className="max-w-[min(280px,calc(100vw-2rem))] text-center">
                      Enter your email to continue as a guest
                    </TooltipContent>
                  </Tooltip>
                )}
              </p>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="max-w-xl space-y-10" aria-labelledby="checkout-shipping-heading">
              <h1 id="checkout-shipping-heading" className="font-serif text-3xl tracking-wide text-foreground md:text-4xl">
                Info &amp; Shipping
              </h1>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-xs tracking-widest uppercase text-muted-foreground">
                      Full name
                    </Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      className="min-h-11 border-border bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs tracking-widest uppercase text-muted-foreground">
                      Phone number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      className="min-h-11 border-border bg-card"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">Delivery</h2>
                <p className="mb-4 text-xs tracking-widest uppercase text-muted-foreground" id="delivery-mode-label">
                  Delivery method
                </p>
                <div
                  className="grid gap-3 sm:grid-cols-2"
                  role="radiogroup"
                  aria-labelledby="delivery-mode-label"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={deliveryMode === "parcel_locker"}
                    onClick={() => setDeliveryMode("parcel_locker")}
                    className={`rounded-sm border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      deliveryMode === "parcel_locker"
                        ? "border-gold bg-cream-dark/40"
                        : "border-border bg-card hover:border-gold/40"
                    }`}
                  >
                    <p className="font-medium text-foreground">Parcel Locker</p>
                    <p className="mt-1 text-sm text-gold">InPost — 12 PLN</p>
                    <p className="mt-2 text-xs text-muted-foreground">1-2 days</p>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={deliveryMode === "home"}
                    onClick={() => setDeliveryMode("home")}
                    className={`rounded-sm border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      deliveryMode === "home"
                        ? "border-gold bg-cream-dark/40"
                        : "border-border bg-card hover:border-gold/40"
                    }`}
                  >
                    <p className="font-medium text-foreground">Home Delivery</p>
                    <p className="mt-1 text-sm text-muted-foreground">Choose carrier below</p>
                    <p className="mt-2 text-xs text-muted-foreground"> </p>
                  </button>
                </div>

                {deliveryMode === "parcel_locker" ? (
                  <div className="mt-8 space-y-2">
                    <InPostGeowidget
                      selectedLockerId={selectedLockerId}
                      onLockerSelect={(id) => {
                        setSelectedLockerId(id)
                        setLockerTouched(false)
                      }}
                    />
                    {lockerTouched && !selectedLockerId ? (
                      <p className="text-sm text-destructive" role="alert">
                        Please select a parcel locker
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {deliveryMode === "home" ? (
                  <div className="mt-8 space-y-8">
                    <div>
                      <p className="mb-3 text-xs tracking-widest uppercase text-muted-foreground" id="home-carrier-label">
                        Carrier
                      </p>
                      <div
                        className="grid gap-3 sm:grid-cols-2"
                        role="radiogroup"
                        aria-labelledby="home-carrier-label"
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={homeCarrier === "inpost_courier"}
                          onClick={() => setHomeCarrier("inpost_courier")}
                          className={`rounded-sm border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            homeCarrier === "inpost_courier"
                              ? "border-gold bg-cream-dark/40"
                              : "border-border bg-card hover:border-gold/40"
                          }`}
                        >
                          <p className="font-medium text-foreground">InPost courier</p>
                          <p className="mt-1 text-sm text-gold">15 PLN</p>
                          <p className="mt-2 text-xs text-muted-foreground">1-2 business days</p>
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={homeCarrier === "poczta_polska"}
                          onClick={() => setHomeCarrier("poczta_polska")}
                          className={`rounded-sm border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                            homeCarrier === "poczta_polska"
                              ? "border-gold bg-cream-dark/40"
                              : "border-border bg-card hover:border-gold/40"
                          }`}
                        >
                          <p className="font-medium text-foreground">Poczta Polska</p>
                          <p className="mt-1 text-sm text-gold">12 PLN</p>
                          <p className="mt-2 text-xs text-muted-foreground">4-7 business days</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg text-foreground mb-4">Delivery address</h3>
                      {usingSavedAddress ? (
                        <p className="mb-4 text-sm text-muted-foreground">
                          Using your saved address.{" "}
                          <button
                            type="button"
                            onClick={clearSavedAddressForm}
                            className="text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                          >
                            Change
                          </button>
                        </p>
                      ) : null}
                      {savedAddresses.length === 2 ? (
                        <p className="mb-4 text-sm text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => {
                              const other = savedAddresses.find((a) => a.id !== activeSavedAddressId)
                              if (other) applySavedAddress(other)
                            }}
                            className="text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                          >
                            Use other address
                          </button>
                        </p>
                      ) : null}
                      <div className="space-y-4">
                        <AddressField
                          id="street-name"
                          label="Street name"
                          value={streetName}
                          onChange={setStreetName}
                          onBlur={() => touchAddressField("streetName")}
                          touched={Boolean(addressTouched.streetName)}
                          error={getAddressFieldError("streetName", streetName)}
                          placeholder="e.g. ul. Marszałkowska"
                          autoComplete="address-line1"
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <AddressField
                            id="building-number"
                            label="Building number"
                            value={buildingNumber}
                            onChange={setBuildingNumber}
                            onBlur={() => touchAddressField("buildingNumber")}
                            touched={Boolean(addressTouched.buildingNumber)}
                            error={getAddressFieldError("buildingNumber", buildingNumber)}
                            placeholder="e.g. 10"
                          />
                          <AddressField
                            id="apartment"
                            label="Apartment / Floor"
                            value={apartment}
                            onChange={setApartment}
                            onBlur={() => touchAddressField("apartment")}
                            touched={Boolean(addressTouched.apartment)}
                            error={getAddressFieldError("apartment", apartment)}
                            placeholder="e.g. Apt 5, Floor 2, House, Villa"
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <AddressField
                            id="city"
                            label="City"
                            value={city}
                            onChange={setCity}
                            onBlur={() => touchAddressField("city")}
                            touched={Boolean(addressTouched.city)}
                            error={getAddressFieldError("city", city)}
                            placeholder="e.g. Warszawa"
                            autoComplete="address-level2"
                          />
                          <AddressField
                            id="postal"
                            label="Postal code"
                            value={postal}
                            onChange={setPostal}
                            onBlur={() => touchAddressField("postal")}
                            touched={Boolean(addressTouched.postal)}
                            error={getAddressFieldError("postal", postal)}
                            placeholder="00-000"
                            autoComplete="postal-code"
                            normalizeOnChange={normalizePolishPostalInput}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-xs tracking-widest uppercase text-muted-foreground">
                            Country
                          </Label>
                          <div className="relative">
                            <Input
                              id="country"
                              value="Poland"
                              disabled
                              readOnly
                              aria-readonly
                              className="min-h-11 border-border bg-muted/30 pr-10 text-foreground"
                            />
                            <Lock
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold"
                              aria-hidden
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (deliveryMode === "parcel_locker") {
                    setLockerTouched(true)
                    if (!selectedLockerId) return
                  } else {
                    touchAllAddressFields()
                    if (!isShippingAddressValid) return
                  }
                  setPaymentMountKey((key) => key + 1)
                  setStep(2)
                }}
                className="flex min-h-12 w-full max-w-md items-center justify-center bg-primary px-6 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Continue to Payment
              </button>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="max-w-xl space-y-8" aria-labelledby="checkout-payment-heading">
              <h1 id="checkout-payment-heading" className="font-serif text-3xl tracking-wide text-foreground md:text-4xl">
                Payment
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pay securely with card. Your order is created only after payment succeeds.
              </p>
              <CheckoutPaymentStep
                key={paymentMountKey}
                total={total}
                customerEmail={email.trim().toLowerCase()}
                onBack={() => {
                  setPaymentMountKey((key) => key + 1)
                  setStep(1)
                }}
                buildOrderPayload={buildOrderPayload}
                onSuccess={() => {
                  for (const line of lines) {
                    removeLine(line.lineId)
                  }
                  setPaymentMountKey((key) => key + 1)
                  setStep(3)
                }}
              />
            </section>
          ) : null}

          {step === 3 ? (
            <section className="max-w-xl text-center" aria-labelledby="checkout-confirmed-heading">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-gold">
                <Check className="h-8 w-8" strokeWidth={2} aria-hidden />
              </div>
              <h1 id="checkout-confirmed-heading" className="font-serif text-3xl tracking-wide text-foreground md:text-4xl">
                Order confirmed
              </h1>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Thank you for your order. A confirmation email will be sent shortly.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/shop"
                  className="inline-flex min-h-11 items-center justify-center border-2 border-primary px-10 text-xs tracking-widest uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Continue shopping
                </Link>
                <Link
                  href="/"
                  className="text-sm text-gold hover:text-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm"
                >
                  Back to home
                </Link>
              </div>
            </section>
          ) : null}
        </div>

        <div className="w-full shrink-0 lg:w-[35%] lg:max-w-md">
          <OrderSummaryPanel
            lead={<ReadOnlyCartLines />}
            subtotal={subtotal}
            shippingRight={shippingRight}
            total={total}
            footer={summaryFooter}
          />
        </div>
      </div>
    </div>
  )
}
