import Link from "next/link"

/** Same visual language as `Hero`: MS monogram in gold frame + MAISON SNOW + tagline. */
export function AuthLogo() {
  return (
    <Link
      href="/"
      className="group mb-4 block outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm sm:mb-5"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-1.5 inline-flex items-center justify-center border-2 border-gold rounded-sm px-2.5 py-1 transition-colors duration-300 group-hover:border-gold-light sm:px-3 sm:py-1.5">
          <span className="font-serif text-2xl font-semibold leading-none text-gold sm:text-3xl">M</span>
          <span className="font-serif text-2xl font-semibold leading-none text-gold sm:text-3xl ml-0.5">S</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <svg className="h-3 w-3 shrink-0 text-gold sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z" opacity={0.35} />
          </svg>
          <span className="font-serif text-base tracking-[0.2em] text-foreground transition-colors duration-300 group-hover:text-gold/90 sm:text-lg md:text-xl">
            MAISON SNOW
          </span>
          <svg className="h-3 w-3 shrink-0 text-gold sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z" opacity={0.35} />
          </svg>
        </div>
      </div>
    </Link>
  )
}
