"use client"

import Image from "next/image"
import Link from "next/link"
import { Fragment, useEffect, useMemo, useState } from "react"
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
  formatShippingAddress,
  type CheckoutOrderPayload,
} from "@/components/checkout/checkout-payment-step"

const STEPS = [
  { id: "email", label: "Email" },
  { id: "info", label: "Info & Shipping" },
  { id: "payment", label: "Payment" },
  { id: "confirmed", label: "Confirmed" },
] as const

type ShipMethod = "standard" | "express"

/** Mock express fee (shown as PLN in UI; added numerically to subtotal for demo). */
const EXPRESS_FEE = 25

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

type EmailUiState = "collect" | "checking" | "signin"

type AddressFieldKey = "streetName" | "buildingNumber" | "apartment" | "city" | "postal"

const BUILDING_NUMBER_REGEX = /^[0-9]+[A-Za-z0-9/]*$/
const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/

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
      if (!trimmed) return "Apartment is required"
      if (!/^\d+$/.test(trimmed)) return "Apartment number must contain digits only"
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
          onChange={(e) => onChange(e.target.value)}
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
  const [shipMethod, setShipMethod] = useState<ShipMethod>("standard")
  const [signInError, setSignInError] = useState<string | null>(null)
  const [paymentMountKey, setPaymentMountKey] = useState(0)

  const isAuthenticated = sessionStatus === "authenticated" && Boolean(session?.user)

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

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    [lines],
  )

  const shippingFee = step >= 1 && shipMethod === "express" ? EXPRESS_FEE : 0
  const shippingRight =
    step < 1
      ? "Calculated at next step"
      : shipMethod === "standard"
        ? "Free"
        : "25 PLN"
  const total = step < 1 ? subtotal : subtotal + shippingFee

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
                <h2 className="font-serif text-xl text-foreground mb-4">Shipping Address</h2>
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
                      label="Apartment"
                      value={apartment}
                      onChange={setApartment}
                      onBlur={() => touchAddressField("apartment")}
                      touched={Boolean(addressTouched.apartment)}
                      error={getAddressFieldError("apartment", apartment)}
                      placeholder="e.g. 12"
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

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">Shipping Method</h2>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Shipping method">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={shipMethod === "standard"}
                    onClick={() => setShipMethod("standard")}
                    className={`rounded-sm border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      shipMethod === "standard"
                        ? "border-gold bg-cream-dark/40"
                        : "border-border bg-card hover:border-gold/40"
                    }`}
                  >
                    <p className="font-medium text-foreground">Standard</p>
                    <p className="mt-1 text-sm text-gold">Free</p>
                    <p className="mt-2 text-xs text-muted-foreground">5 to 7 business days</p>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={shipMethod === "express"}
                    onClick={() => setShipMethod("express")}
                    className={`rounded-sm border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      shipMethod === "express"
                        ? "border-gold bg-cream-dark/40"
                        : "border-border bg-card hover:border-gold/40"
                    }`}
                  >
                    <p className="font-medium text-foreground">Express</p>
                    <p className="mt-1 text-sm text-gold">25 PLN</p>
                    <p className="mt-2 text-xs text-muted-foreground">2 to 3 business days</p>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  touchAllAddressFields()
                  if (!isShippingAddressValid) return
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
                onBack={() => setStep(1)}
                buildOrderPayload={(stripePaymentId, orderId): CheckoutOrderPayload => ({
                  orderId,
                  email: email.trim().toLowerCase(),
                  userId: session?.user?.id,
                  shippingName: fullName.trim(),
                  shippingPhone: phone.trim(),
                  shippingAddress: formatShippingAddress(
                    streetName,
                    buildingNumber,
                    apartment,
                    city,
                    postal,
                  ),
                  shippingCost: shippingFee,
                  stripePaymentId,
                  items: lines.map((line) => ({
                    productId: line.productId,
                    productName: line.name,
                    price: line.unitPrice,
                    size: line.size ?? "One size",
                    quantity: line.quantity,
                  })),
                })}
                onSuccess={() => {
                  for (const line of lines) {
                    removeLine(line.lineId)
                  }
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
