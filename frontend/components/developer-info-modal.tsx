"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Linkedin } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "maison-snow-developer-info-seen"
const PROFILE_IMAGE_URL =
  "https://res.cloudinary.com/dbock6hhb/image/upload/v1778170353/WhatsApp_Image_2026-04-05_at_05.24.06_1_ufb1hv.jpg"
const LINKEDIN_URL = "https://www.linkedin.com/in/abdellatif-meziane-847916219/"

function DeveloperInfoDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        panelMotion="fade"
        overlayClassName="z-[90] bg-black/40 duration-300"
        className="z-[100] w-full max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-sm border border-border bg-cream p-0 shadow-xl sm:max-w-sm"
      >
        <div className="relative px-6 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12">
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-3 top-3 rounded-sm p-2 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              aria-label="Close"
            >
              <span className="block text-lg leading-none font-light" aria-hidden>
                ×
              </span>
            </button>
          </DialogClose>

          <div className="flex flex-col items-center text-center">
            <p className="mb-5 text-[10px] font-medium tracking-[0.28em] uppercase text-muted-foreground sm:text-xs">
              Developed by
            </p>

            <div className="relative mb-5 h-[70px] w-[70px] shrink-0 overflow-hidden rounded-full border-2 border-gold/60 bg-card shadow-md">
              <Image
                src={PROFILE_IMAGE_URL}
                alt="Abdellatif Meziane"
                fill
                sizes="70px"
                className="object-cover"
                priority
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <DialogTitle className="font-serif text-xl tracking-wide text-foreground sm:text-2xl">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
                >
                  Abdellatif Meziane
                </a>
              </DialogTitle>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-sm text-gold transition-colors hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                aria-label="Abdellatif Meziane on LinkedIn"
              >
                <Linkedin className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </a>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Full Stack Developer · Warsaw, Poland
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function DeveloperInfoModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* ignore storage errors */
    }
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        markSeen()
      }
    },
    [markSeen],
  )

  useEffect(() => {
    if (pathname !== "/") return

    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setOpen(true)
    }, 600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [pathname])

  return (
    <>
      <DeveloperInfoDialog open={open} onOpenChange={handleOpenChange} />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-primary-foreground/45 text-xs tracking-wide transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-sm"
      >
        Built by Abde
      </button>
    </>
  )
}
