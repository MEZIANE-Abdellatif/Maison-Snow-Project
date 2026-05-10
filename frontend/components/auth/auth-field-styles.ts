/** Shared auth UI tokens — aligned with hero CTA, checkout, and globals. */

export const authLabelClass =
  "text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground sm:text-xs"

/** Premium inputs — 44px min height, tighter padding. */
export const authInputClass =
  "min-h-11 w-full rounded-sm border border-gold/25 bg-background/50 px-3 py-2 text-sm leading-tight text-foreground shadow-none transition-[border-color,background-color,box-shadow] duration-300 ease-out placeholder:text-muted-foreground/55 hover:border-gold/45 hover:bg-background/70 focus-visible:border-gold focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 focus-visible:ring-offset-0"

/** Hero-style CTA — compact vertical padding, full tap height. */
export const authPrimaryButtonClass =
  "w-full min-h-11 flex items-center justify-center bg-primary px-6 py-2.5 text-xs font-medium tracking-[0.18em] uppercase text-primary-foreground transition-all duration-300 ease-out hover:bg-gold hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-45 sm:tracking-[0.2em]"

export const authGoldLinkClass =
  "underline text-gold decoration-gold/40 decoration-1 underline-offset-[5px] transition-colors duration-300 hover:text-gold-light hover:decoration-gold/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm"

export const authMutedLinkClass =
  "text-muted-foreground text-[11px] tracking-wide underline-offset-4 transition-colors duration-300 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-sm sm:text-xs"

export const authIconButtonClass =
  "absolute right-0 top-0 flex min-h-11 min-w-11 items-center justify-center text-gold/75 transition-colors duration-300 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-inset rounded-sm"

export const authHeadingClass =
  "font-serif text-2xl tracking-[0.06em] text-foreground sm:text-3xl"
