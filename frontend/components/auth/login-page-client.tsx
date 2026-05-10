"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useSearchParams } from "next/navigation"

function sanitizeReturnUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/checkout"
  return raw
}

export function LoginPageClient() {
  const searchParams = useSearchParams()
  const returnUrl = useMemo(
    () => sanitizeReturnUrl(searchParams.get("returnUrl")),
    [searchParams],
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pt-32">
      <div className="mx-auto max-w-md text-center">
        <span className="text-gold tracking-[0.3em] text-xs uppercase block mb-3">Maison Snow</span>
        <h1 className="font-serif text-3xl tracking-wide text-foreground md:text-4xl mb-4">Sign in</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-10">
          Authentication is not wired yet. Use the link below to return to checkout and continue as a guest.
        </p>
        <Link
          href={returnUrl}
          className="inline-flex min-h-12 items-center justify-center bg-primary px-10 py-3 text-xs tracking-widest uppercase text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Continue to checkout
        </Link>
        <p className="mt-8 text-xs text-muted-foreground">
          <Link href="/" className="text-gold hover:text-gold-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded-sm">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
