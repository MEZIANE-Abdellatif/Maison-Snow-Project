"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, ShoppingBag, User } from "lucide-react"

import { useCart } from "@/contexts/cart-context"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { count } = useCart()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20 gap-4">
          {/* Logo (left) + mobile menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 -ml-2 text-foreground hover:text-gold transition-colors min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="font-serif text-3xl font-semibold text-gold tracking-wide">M</span>
                <span className="font-serif text-3xl font-semibold text-gold tracking-wide">S</span>
              </div>
            </Link>
          </div>

          {/* Desktop nav — centered in bar */}
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex items-center gap-6 xl:gap-8">
            <Link href="#categories" className="text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors">
              Collections
            </Link>
            <Link href="#new-arrivals" className="text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors">
              New Arrivals
            </Link>
            <Link href="#story" className="text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors">
              Our Story
            </Link>
            <Link href="#contact" className="text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors">
              Contact
            </Link>
          </div>

          {/* Icons (right) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 z-10">
            <button
              type="button"
              className="p-2 text-foreground hover:text-gold transition-colors min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-foreground hover:text-gold transition-colors min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>
            <Link
              href="/cart"
              className="p-2 text-foreground hover:text-gold transition-colors relative min-h-11 min-w-11 flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Shopping bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span
                className="absolute -top-0.5 -right-0.5 min-h-[1.125rem] min-w-[1.125rem] px-0.5 bg-gold text-primary-foreground text-[10px] font-medium leading-none rounded-full flex items-center justify-center tabular-nums"
                aria-hidden
              >
                {count > 99 ? "99+" : count}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <div className="px-4 py-6 space-y-4">
            <Link 
              href="#categories" 
              className="block text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Collections
            </Link>
            <Link 
              href="#new-arrivals" 
              className="block text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              New Arrivals
            </Link>
            <Link 
              href="#story" 
              className="block text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Our Story
            </Link>
            <Link 
              href="#contact" 
              className="block text-sm tracking-widest uppercase text-foreground hover:text-gold transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
