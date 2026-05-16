"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

import { cn } from "@/lib/utils"

const SIDEBAR_W = "w-[220px] shrink-0"

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const adminName = session?.user?.firstName?.trim() || "Admin"

  const linkClass = (href: string) => {
    const active = pathname === href || (href === "/admin/orders" && pathname === "/admin")
    return cn(
      "flex min-h-11 w-full items-center rounded-sm py-2.5 pl-4 pr-3 text-left text-sm font-medium tracking-wide transition-colors",
      active
        ? "border-l-[3px] border-gold bg-white/[0.06] pl-[13px] text-gold"
        : "border-l-[3px] border-transparent text-white/70 hover:bg-white/[0.04] hover:text-white",
    )
  }

  const handleLogout = () => {
    void signOut({ callbackUrl: "/" })
  }

  return (
    <aside
      className={cn(
        SIDEBAR_W,
        "sticky top-0 flex h-screen min-h-screen flex-col border-r border-white/10 bg-admin-sidebar-bg px-4 py-8",
      )}
      aria-label="Admin navigation"
    >
      <Link
        href="/admin/orders"
        className="mb-8 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-sidebar-bg rounded-sm"
      >
        <span className="font-serif text-2xl font-semibold tracking-wide text-gold">M</span>
        <span className="font-serif text-2xl font-semibold tracking-wide text-gold ml-0.5">S</span>
        <p className="mt-2 text-xs text-white/50 tracking-wide">Signed in as {adminName}</p>
      </Link>
      <nav className="flex flex-1 flex-col gap-1.5" aria-label="Admin sections">
        <Link href="/admin/orders" className={linkClass("/admin/orders")}>
          Orders
        </Link>
        <Link href="/admin/products" className={linkClass("/admin/products")}>
          Products
        </Link>
      </nav>
      <div className="pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center justify-center rounded-sm border border-white/15 py-2.5 text-sm text-white/60 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-sidebar-bg"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
