import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { AuthLogo } from "@/components/auth/auth-logo"

type AuthCardShellProps = {
  children: ReactNode
  belowCard?: ReactNode
}

export function AuthCardShell({ children, belowCard }: AuthCardShellProps) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* Editorial panel — full banner on mobile, left column on desktop */}
      <div className="relative h-28 w-full shrink-0 overflow-hidden sm:h-32 md:h-36 lg:h-auto lg:min-h-dvh lg:w-[min(44%,520px)] lg:max-w-[520px]">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 520px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/65 via-foreground/40 to-foreground/70 lg:bg-gradient-to-r lg:from-foreground/75 lg:via-foreground/35 lg:to-transparent"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent lg:hidden" aria-hidden />
      </div>

      {/* Cream field + floating card */}
      <div className="relative flex flex-1 flex-col items-center justify-start px-3 py-4 sm:justify-center sm:px-5 sm:py-6 lg:px-8 lg:py-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(201,169,98,0.14),transparent_55%),linear-gradient(180deg,rgba(250,248,245,0.98)_0%,rgba(245,240,232,0.92)_45%,rgba(250,248,245,0.99)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px max-w-2xl bg-gradient-to-r from-transparent via-gold/45 to-transparent lg:inset-x-10"
          aria-hidden
        />

        <Link
          href="/"
          className="absolute left-3 top-3 z-[2] inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm sm:left-5 sm:top-4 lg:left-8 lg:top-5"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-medium tracking-wide">Home</span>
        </Link>

        <div className="relative z-[1] w-full max-w-[400px] pt-11 sm:pt-10 lg:max-w-[430px] lg:pt-9">
          <div className="relative">
            <div
              className="absolute -inset-[1px] rounded-sm bg-gradient-to-br from-gold/50 via-gold/15 to-gold/35 opacity-80 blur-[0.5px]"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-sm border border-gold/45 bg-gradient-to-b from-card/98 via-card to-cream-dark/20 p-5 shadow-[0_20px_60px_-20px_rgba(26,26,26,0.2)] backdrop-blur-[2px] sm:p-6">
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.85)_0%,transparent_42%,rgba(201,169,98,0.07)_78%,transparent_100%)]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold/25" aria-hidden />
              <div className="relative">
                <AuthLogo />
                {children}
              </div>
            </div>
          </div>

          {belowCard ? (
            <div className="mt-5 w-full text-center text-[11px] leading-snug text-muted-foreground sm:mt-6 sm:text-xs">
              {belowCard}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
