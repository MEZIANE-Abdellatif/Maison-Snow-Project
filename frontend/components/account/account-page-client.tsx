"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Package,
  Plus,
} from "lucide-react"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import { ADDRESS_COUNTRIES, type UserAddress } from "@/lib/address-api"
import type { MockOrder, MockOrderLine, OrderStatus } from "@/lib/account-mock-data"
import { Toaster } from "@/components/ui/sonner"
import { formatPrice } from "@/lib/shop-data"
import { authLabelClass, authPrimaryButtonClass } from "@/components/auth/auth-field-styles"
import { cn } from "@/lib/utils"

const TABS = ["orders", "profile", "addresses"] as const
type AccountTab = (typeof TABS)[number]

/** Content card floor; sidebar uses the same value as a fixed height (does not grow with the card). */
const accountColumnsMinH = "min-h-[max(600px,calc(100dvh-5rem-22rem))]"
const accountSidebarFixedH =
  "h-[max(600px,calc(100dvh-5rem-22rem))] max-h-[max(600px,calc(100dvh-5rem-22rem))] shrink-0"

function isAccountTab(value: string | null): value is AccountTab {
  return value === "orders" || value === "profile" || value === "addresses"
}

/** Account-only fields — explicit border + gold focus glow (design spec). */
const accountFieldClass = cn(
  "min-h-11 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm leading-tight text-foreground shadow-none transition-[border-color,box-shadow] duration-200 ease-out",
  "placeholder:text-muted-foreground/55 hover:border-foreground/20",
  "focus-visible:border-account-gold-accent focus-visible:shadow-[0_0_0_2px_rgba(201,168,76,0.15)] focus-visible:outline-none focus-visible:ring-0",
  "disabled:pointer-events-none disabled:opacity-50",
)

const accountSelectTriggerClass = cn(
  accountFieldClass,
  "flex h-11 w-full items-center justify-between border-border [&_svg]:text-muted-foreground",
  "focus-visible:ring-0 focus-visible:shadow-[0_0_0_2px_rgba(201,168,76,0.15)]",
)

const accountSectionCardClass =
  "rounded-sm border border-border bg-card p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8 lg:p-10"

const accountSectionTitleClass =
  "mb-8 border-l-[3px] border-account-gold-accent pl-4 font-serif text-3xl font-normal tracking-wide text-foreground md:text-4xl lg:text-[2.5rem]"

const goldLinkClass =
  "text-sm font-medium text-account-gold-accent underline-offset-4 decoration-account-gold-accent/45 underline decoration-1 transition-colors hover:text-gold-light hover:decoration-gold/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-account-gold-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm min-h-11 inline-flex items-center"

const mutedLinkClass =
  "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-account-gold-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm min-h-11 inline-flex items-center"

function AccountSectionCard({
  title,
  sectionId,
  children,
}: {
  title: string
  sectionId: string
  children: ReactNode
}) {
  const headingId = `account-section-${sectionId}`
  return (
    <section
      className={cn(
        accountSectionCardClass,
        "flex flex-col",
        accountColumnsMinH,
      )}
      aria-labelledby={headingId}
    >
      <h1 id={headingId} className={accountSectionTitleClass}>
        {title}
      </h1>
      {children}
    </section>
  )
}

function statusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "Processing":
      return "border-account-gold-accent/45 bg-account-gold-accent/12 text-foreground"
    case "Shipped":
      return "border-transparent bg-primary text-primary-foreground"
    case "Delivered":
      return "border-emerald-900/15 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
    default:
      return ""
  }
}

function ExpandPanel({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

function OrderCard({ order, index }: { order: MockOrder; index: number }) {
  const [open, setOpen] = useState(false)
  const dateLabel = format(new Date(order.placedAt), "MMMM d, yyyy")
  const stripe = index % 2 === 1

  return (
    <article
      className={cn(
        "overflow-hidden rounded-sm border border-border bg-card shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-account-gold-accent hover:shadow-[0_2px_14px_rgba(0,0,0,0.08)]",
        stripe && "bg-account-order-stripe",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col gap-4 p-5 text-left transition-colors hover:bg-black/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-account-gold-accent/45 focus-visible:ring-inset sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:p-6"
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
          <div>
            <p className="font-mono text-xs tracking-wide text-muted-foreground">Order</p>
            <p className="font-mono text-sm font-medium text-foreground">{order.id}</p>
          </div>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <p className="font-serif text-lg text-foreground tabular-nums">{formatPrice(order.total)}</p>
          <Badge
            variant="outline"
            className={cn("rounded-sm px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase", statusBadgeClass(order.status))}
          >
            {order.status}
          </Badge>
          <ChevronDown
            className={cn(
              "ml-auto h-5 w-5 shrink-0 text-account-gold-accent transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:ml-0",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </div>
      </button>

      <ExpandPanel open={open}>
        <div className="border-t border-account-gold-accent px-5 pb-6 pt-2 sm:px-6">
          <div className="space-y-6 pt-4">
            <section>
              <h3 className="mb-3 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Items
              </h3>
              <ul className="space-y-4">
                {order.items.map((line: MockOrderLine) => (
                  <li key={line.id} className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-border bg-card">
                      <Image
                        src={line.image}
                        alt={line.imageAlt}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-base text-foreground">{line.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty {line.qty} · {formatPrice(line.price)} each
                      </p>
                    </div>
                    <p className="shrink-0 font-serif text-base tabular-nums text-foreground">
                      {formatPrice(line.price * line.qty)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <div className="h-px w-full bg-account-gold-accent" aria-hidden />

            <section>
              <h3 className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Shipping address
              </h3>
              <address className="not-italic text-sm leading-relaxed text-foreground">
                {order.shippingAddress.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </section>

            <div className="h-px w-full bg-account-gold-accent" aria-hidden />

            <section>
              <h3 className="mb-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Estimated delivery
              </h3>
              <p className="text-sm text-foreground">{order.estimatedDelivery}</p>
            </section>
          </div>
        </div>
      </ExpandPanel>
    </article>
  )
}

function OrdersSection({ orders }: { orders: MockOrder[] }) {
  if (orders.length === 0) {
    return (
      <AccountSectionCard title="Your Orders" sectionId="orders">
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-6 px-2 py-12 text-center sm:px-4">
          <Package className="h-14 w-14 text-account-gold-accent" strokeWidth={1} aria-hidden />
          <div className="space-y-2">
            <p className="font-serif text-2xl tracking-wide text-foreground md:text-3xl">No orders yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              When you place an order, it will appear here with every detail you need.
            </p>
          </div>
          <Button
            asChild
            className={cn(authPrimaryButtonClass, "w-auto min-w-[12rem] px-8")}
          >
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      </AccountSectionCard>
    )
  }

  return (
    <AccountSectionCard title="Your Orders" sectionId="orders">
      <div className="space-y-5">
        {orders.map((order, index) => (
          <OrderCard key={order.id} order={order} index={index} />
        ))}
      </div>
    </AccountSectionCard>
  )
}

function ProfileSection({
  sessionEmail,
  sessionFirst,
  sessionLast,
}: {
  sessionEmail: string
  sessionFirst: string
  sessionLast: string
}) {
  const [profileLoading, setProfileLoading] = useState(true)
  const [email, setEmail] = useState(sessionEmail)
  const [firstName, setFirstName] = useState(sessionFirst)
  const [lastName, setLastName] = useState(sessionLast)
  const [phone, setPhone] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setProfileLoading(true)
      try {
        const res = await fetch("/api/users/profile")
        if (!res.ok) return
        const data = (await res.json()) as {
          firstName: string
          lastName: string
          email: string
          phone: string | null
        }
        if (cancelled) return
        setFirstName(data.firstName)
        setLastName(data.lastName)
        setEmail(data.email)
        setPhone(data.phone ?? "")
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AccountSectionCard title="Your Profile" sectionId="profile">
      <div className="space-y-10">
      <form
        className="max-w-xl space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          void (async () => {
            setSavingProfile(true)
            try {
              const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  phone: phone.trim() || null,
                }),
              })
              if (!res.ok) {
                toast.error("Failed to update profile")
                return
              }
              const data = (await res.json()) as {
                firstName: string
                lastName: string
                email: string
                phone: string | null
              }
              setFirstName(data.firstName)
              setLastName(data.lastName)
              setPhone(data.phone ?? "")
              toast.success("Profile updated")
            } catch {
              toast.error("Failed to update profile")
            } finally {
              setSavingProfile(false)
            }
          })()
        }}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-first" className={authLabelClass}>
              First name
            </Label>
            <Input
              id="profile-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              className={accountFieldClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-last" className={authLabelClass}>
              Last name
            </Label>
            <Input
              id="profile-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              className={accountFieldClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email" className={authLabelClass}>
            Email
          </Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-account-gold-accent/60"
              aria-hidden
            />
            <Input
              id="profile-email"
              type="email"
              value={email}
              readOnly
              className={cn(
                accountFieldClass,
                "cursor-not-allowed border-border bg-account-order-stripe pl-10 text-muted-foreground focus-visible:shadow-none",
              )}
              aria-readonly="true"
            />
          </div>
          <p className="text-xs text-account-gold-accent">Cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-phone" className={authLabelClass}>
            Phone
          </Label>
          <Input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className={accountFieldClass}
          />
        </div>

        <Button
          type="submit"
          disabled={profileLoading || savingProfile}
          className={cn(authPrimaryButtonClass, "w-full max-w-xs sm:w-auto sm:min-w-[11rem]")}
        >
          {savingProfile ? "Saving…" : "Save Changes"}
        </Button>
      </form>

      <div className="max-w-xl">
        <div className="h-px w-full bg-account-gold-accent" aria-hidden />
      </div>

      <div className="max-w-xl">
        <button
          type="button"
          onClick={() => setPasswordOpen((o) => !o)}
          className="flex w-full min-h-11 items-center justify-between rounded-sm py-2 text-left font-sans text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-black/[0.03] hover:text-account-gold-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-account-gold-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-expanded={passwordOpen}
        >
          Change password
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-account-gold-accent transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              passwordOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <ExpandPanel open={passwordOpen}>
          <form
            inert={!passwordOpen ? true : undefined}
            className="space-y-5 border-t border-account-gold-accent pt-6"
            onSubmit={(e) => {
              e.preventDefault()
              if (newPwd !== confirmPwd) {
                setPasswordError("New passwords do not match")
                return
              }
              void (async () => {
                setSavingPassword(true)
                setPasswordError(null)
                try {
                  const res = await fetch("/api/users/profile/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      currentPassword: currentPwd,
                      newPassword: newPwd,
                    }),
                  })
                  const data = (await res.json().catch(() => ({}))) as { error?: string }
                  if (res.status === 400) {
                    setPasswordError(data.error ?? "Current password is incorrect")
                    return
                  }
                  if (!res.ok) {
                    setPasswordError("Could not update password")
                    return
                  }
                  toast.success("Password updated")
                  setPasswordOpen(false)
                  setCurrentPwd("")
                  setNewPwd("")
                  setConfirmPwd("")
                  setShowNew(false)
                } catch {
                  setPasswordError("Could not update password")
                } finally {
                  setSavingPassword(false)
                }
              })()
            }}
          >
            {passwordError ? (
              <p className="text-sm text-destructive" role="alert">
                {passwordError}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="pwd-current" className={authLabelClass}>
                Current password
              </Label>
              <Input
                id="pwd-current"
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
                className={accountFieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-new" className={authLabelClass}>
                New password
              </Label>
              <div className="relative">
                <Input
                  id="pwd-new"
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  autoComplete="new-password"
                  className={cn(accountFieldClass, "pr-12")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-0 top-0 flex min-h-11 min-w-11 items-center justify-center text-account-gold-accent/80 transition-colors hover:text-account-gold-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-account-gold-accent/45 focus-visible:ring-inset rounded-sm"
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd-confirm" className={authLabelClass}>
                Confirm new password
              </Label>
              <Input
                id="pwd-confirm"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
                className={accountFieldClass}
              />
            </div>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
              <Button
                type="submit"
                disabled={savingPassword}
                className={cn(authPrimaryButtonClass, "w-full sm:w-auto sm:min-w-[11rem]")}
              >
                {savingPassword ? "Updating…" : "Update Password"}
              </Button>
              <button
                type="button"
                className={goldLinkClass}
                onClick={() => {
                  setPasswordOpen(false)
                  setCurrentPwd("")
                  setNewPwd("")
                  setConfirmPwd("")
                  setShowNew(false)
                  setPasswordError(null)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </ExpandPanel>
      </div>
      </div>
    </AccountSectionCard>
  )
}

function formatAddressLines(a: UserAddress): string[] {
  const unit = [a.building, a.apartment].filter(Boolean).join(", ")
  const streetLine = unit ? `${a.street} ${unit}` : a.street
  return [streetLine, `${a.city}, ${a.postalCode}`, a.country]
}

function AddressesSection() {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [street, setStreet] = useState("")
  const [building, setBuilding] = useState("")
  const [apartment, setApartment] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState<string>("Poland")
  const [saving, setSaving] = useState(false)

  const loadAddresses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users/addresses")
      if (!res.ok) {
        setAddresses([])
        return
      }
      const data = (await res.json()) as UserAddress[]
      setAddresses(data)
    } catch {
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAddresses()
  }, [loadAddresses])

  const setDefault = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/users/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })
      if (!res.ok) {
        toast.error("Could not update default address")
        return
      }
      await loadAddresses()
    },
    [loadAddresses],
  )

  const removeAddress = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this address?")) return
      const res = await fetch(`/api/users/addresses/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Could not delete address")
        return
      }
      await loadAddresses()
    },
    [loadAddresses],
  )

  const saveNewAddress = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!street.trim() || !building.trim() || !city.trim() || !postalCode.trim()) return
      setSaving(true)
      try {
        const res = await fetch("/api/users/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street: street.trim(),
            building: building.trim(),
            apartment: apartment.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
            isDefault: addresses.length === 0,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        if (!res.ok) {
          toast.error(data.error ?? "Could not save address")
          return
        }
        setStreet("")
        setBuilding("")
        setApartment("")
        setCity("")
        setPostalCode("")
        setCountry("Poland")
        setShowAddForm(false)
        await loadAddresses()
        toast.success("Address saved")
      } catch {
        toast.error("Could not save address")
      } finally {
        setSaving(false)
      }
    },
    [street, building, apartment, city, postalCode, country, addresses.length, loadAddresses],
  )

  return (
    <AccountSectionCard title="Your Addresses" sectionId="addresses">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading addresses…</p>
      ) : (
        <>
          <ul className="space-y-5">
            {addresses.map((addr, index) => (
              <li
                key={addr.id}
                className={cn(
                  "rounded-sm border border-border p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-[border-color] duration-200 hover:border-account-gold-accent",
                  addr.isDefault
                    ? "border-l-[3px] border-l-account-gold-accent bg-card"
                    : index % 2 === 1
                      ? "bg-account-order-stripe"
                      : "bg-card",
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <address className="not-italic text-sm leading-relaxed text-foreground">
                    {formatAddressLines(addr).map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                  <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                    {addr.isDefault ? (
                      <span className="inline-flex w-fit items-center rounded-sm border border-account-gold-accent/50 bg-account-gold-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-account-gold-accent">
                        Default
                      </span>
                    ) : (
                      <button type="button" className={goldLinkClass} onClick={() => void setDefault(addr.id)}>
                        Set as default
                      </button>
                    )}
                    <button type="button" className={mutedLinkClass} onClick={() => void removeAddress(addr.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-6">
            {addresses.length < 2 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm((s) => !s)}
                className="min-h-11 w-full max-w-md border-border bg-transparent font-sans text-xs uppercase tracking-[0.18em] text-foreground shadow-none transition-colors hover:border-account-gold-accent hover:bg-account-order-stripe/80 hover:text-foreground sm:w-auto"
              >
                <Plus className="h-4 w-4 text-account-gold-accent" aria-hidden />
                Add New Address
              </Button>
            ) : null}

            <ExpandPanel open={showAddForm}>
              <form
                inert={!showAddForm ? true : undefined}
                onSubmit={(e) => void saveNewAddress(e)}
                className="max-w-xl space-y-5 border-t border-account-gold-accent pt-8"
              >
                <div className="space-y-2">
                  <Label htmlFor="addr-street" className={authLabelClass}>
                    Street name
                  </Label>
                  <Input
                    id="addr-street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    autoComplete="address-line1"
                    className={accountFieldClass}
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="addr-building" className={authLabelClass}>
                      Building number
                    </Label>
                    <Input
                      id="addr-building"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className={accountFieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addr-apartment" className={authLabelClass}>
                      Apartment / Floor
                    </Label>
                    <Input
                      id="addr-apartment"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className={accountFieldClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="addr-city" className={authLabelClass}>
                      City
                    </Label>
                    <Input
                      id="addr-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      className={accountFieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addr-postal" className={authLabelClass}>
                      Postal code
                    </Label>
                    <Input
                      id="addr-postal"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      autoComplete="postal-code"
                      className={accountFieldClass}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-country" className={authLabelClass}>
                    Country
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="addr-country" className={accountSelectTriggerClass}>
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent className="border-border">
                      {ADDRESS_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button
                    type="submit"
                    disabled={saving}
                    className={cn(authPrimaryButtonClass, "w-full sm:w-auto sm:min-w-[11rem]")}
                  >
                    {saving ? "Saving…" : "Save Address"}
                  </Button>
                  <button
                    type="button"
                    className={goldLinkClass}
                    onClick={() => {
                      setShowAddForm(false)
                      setStreet("")
                      setBuilding("")
                      setApartment("")
                      setCity("")
                      setPostalCode("")
                      setCountry("Poland")
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </ExpandPanel>
          </div>
        </>
      )}
    </AccountSectionCard>
  )
}


export function AccountPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [orders, setOrders] = useState<MockOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      setOrdersLoading(true)
      try {
        const res = await fetch("/api/orders")
        if (!res.ok) {
          if (!cancelled) setOrders([])
          return
        }
        const data = (await res.json()) as MockOrder[]
        if (!cancelled) setOrders(data)
      } catch {
        if (!cancelled) setOrders([])
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    }

    void loadOrders()
    return () => {
      cancelled = true
    }
  }, [])

  const tabFromUrl = searchParams.get("tab")
  const activeTab: AccountTab = useMemo(
    () => (isAccountTab(tabFromUrl) ? tabFromUrl : "orders"),
    [tabFromUrl],
  )

  useEffect(() => {
    if (tabFromUrl && !isAccountTab(tabFromUrl)) {
      router.replace("/account?tab=orders", { scroll: false })
    }
  }, [tabFromUrl, router])

  const setTab = useCallback(
    (tab: AccountTab) => {
      router.replace(`/account?tab=${tab}`, { scroll: false })
    },
    [router],
  )

  const greetingName = session?.user?.firstName?.trim() || "Guest"
  const email = session?.user?.email ?? ""
  const profileFirst = session?.user?.firstName?.trim() || ""
  const profileLast = session?.user?.lastName?.trim() || ""

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/" })
  }

  const navItemClass = (tab: AccountTab) =>
    cn(
      "flex min-h-11 w-full items-center rounded-sm py-2.5 pl-4 pr-3 text-left text-sm font-medium tracking-wide transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-account-gold-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
      activeTab === tab
        ? "border-l-[3px] border-account-gold-accent bg-[#E0D8C6]/90 text-account-gold-accent"
        : "border-l-[3px] border-transparent text-muted-foreground hover:bg-black/[0.05] hover:text-foreground",
    )

  return (
    <main className="flex min-h-screen flex-col bg-account-main">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-24 pt-24 sm:px-6 md:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
        <div
          className={cn(
            "flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-0",
          )}
        >
          {/* Sidebar — desktop */}
          <aside
            className={cn(
              "hidden shrink-0 lg:flex lg:w-[25%] lg:min-w-[220px] lg:max-w-sm lg:flex-col lg:self-start lg:border-r lg:border-account-gold-accent lg:bg-card lg:px-7 lg:py-10",
              accountSidebarFixedH,
            )}
          >
            <div className="mb-10 space-y-1">
              <p className="font-serif text-lg italic leading-snug text-muted-foreground">Welcome back,</p>
              <p className="font-serif text-3xl tracking-wide text-foreground">{greetingName}</p>
            </div>
            <nav className="flex flex-1 flex-col gap-1.5" aria-label="Account">
              <button type="button" className={navItemClass("orders")} onClick={() => setTab("orders")}>
                My Orders
              </button>
              <button type="button" className={navItemClass("profile")} onClick={() => setTab("profile")}>
                My Profile
              </button>
              <button type="button" className={navItemClass("addresses")} onClick={() => setTab("addresses")}>
                My Addresses
              </button>
              <div className="mt-auto pt-10">
                <button
                  type="button"
                  className={cn(
                    mutedLinkClass,
                    "w-full justify-center rounded-sm border border-border bg-card py-2.5 transition-colors hover:bg-muted/40 hover:text-foreground",
                  )}
                  onClick={handleSignOut}
                >
                  Logout
                </button>
              </div>
            </nav>
          </aside>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col lg:py-6 lg:pl-8 lg:pr-2">
            {/* Mobile: greeting + tabs */}
            <div className="mb-6 shrink-0 space-y-4 lg:hidden">
              <div className="rounded-sm border border-border bg-card p-4 sm:p-5">
                <div className="space-y-1">
                  <p className="font-serif text-base italic text-muted-foreground">Welcome back,</p>
                  <p className="font-serif text-2xl tracking-wide text-foreground">{greetingName}</p>
                </div>
              </div>
              <div className="rounded-sm border border-border bg-card p-1.5">
                <nav
                  className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-label="Account sections"
                >
                  {(
                    [
                      ["orders", "Orders"],
                      ["profile", "Profile"],
                      ["addresses", "Addresses"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      className={cn(
                        "min-h-11 shrink-0 rounded-sm px-4 py-2.5 font-serif text-base tracking-wide transition-colors",
                        activeTab === id
                          ? "bg-[#E0D8C6]/90 text-account-gold-accent shadow-sm"
                          : "text-muted-foreground hover:bg-black/[0.05] hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div key={activeTab} className="animate-in fade-in-0 w-full duration-300">
                {activeTab === "orders" ? (
                  ordersLoading ? (
                    <AccountSectionCard title="Your Orders" sectionId="orders">
                      <p className="text-sm text-muted-foreground">Loading your orders…</p>
                    </AccountSectionCard>
                  ) : (
                    <OrdersSection orders={orders} />
                  )
                ) : null}
                {activeTab === "profile" ? (
                  <ProfileSection
                    sessionEmail={email}
                    sessionFirst={profileFirst}
                    sessionLast={profileLast}
                  />
                ) : null}
                {activeTab === "addresses" ? <AddressesSection /> : null}
            </div>

            <div className="mt-10 flex shrink-0 justify-center lg:hidden">
              <button
                type="button"
                className={cn(
                  mutedLinkClass,
                  "min-h-11 justify-center rounded-sm border border-border bg-card px-6 py-2.5 transition-colors hover:bg-muted/40",
                )}
                onClick={handleSignOut}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster richColors position="top-center" />
    </main>
  )
}
