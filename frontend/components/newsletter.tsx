"use client"

import { useState } from "react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="py-24 px-4 bg-cream-dark">
      <div className="max-w-2xl mx-auto text-center">
        {/* Section header */}
        <span className="text-gold tracking-[0.3em] text-sm uppercase block mb-4">
          Stay Connected
        </span>
        <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-foreground mb-4">
          Join Our Journey
        </h2>
        <p className="text-foreground/70 mb-10 max-w-md mx-auto">
          Be the first to know about new arrivals, exclusive offers, and behind-the-scenes moments.
        </p>

        {/* Newsletter form */}
        {isSubmitted ? (
          <div className="bg-card p-8 border border-gold">
            <svg className="w-12 h-12 text-gold mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-serif text-xl text-foreground mb-2">Thank You!</p>
            <p className="text-foreground/70 text-sm">
              You&apos;ve been added to our exclusive list. Welcome to the Maison Snow family.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 bg-card border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-gold transition-colors"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-primary-foreground text-sm tracking-widest uppercase hover:bg-gold hover:text-foreground transition-all duration-300"
            >
              Subscribe
            </button>
          </form>
        )}

        {/* Privacy note */}
        <p className="text-foreground/50 text-xs mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}
