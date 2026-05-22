"use client"

import { useState, type FormEvent } from "react"

const inputClass =
  "w-full px-6 py-4 bg-card border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:border-gold transition-colors"

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const nextErrors: { name?: string; email?: string; message?: string } = {}

    if (!name.trim()) {
      nextErrors.name = "Please enter your name."
    }
    if (!email.trim()) {
      nextErrors.email = "Please enter your email."
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Please enter a valid email address."
    }
    if (!message.trim()) {
      nextErrors.message = "Please enter a message."
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setIsSubmitted(true)
  }

  return (
    <div className="px-4 pb-24 bg-cream-dark">
      <div className="max-w-2xl mx-auto text-center">
        <div className="h-px w-full max-w-lg mx-auto bg-gold/50 mb-12" aria-hidden />

        {isSubmitted ? (
          <div className="bg-card p-8 border border-gold max-w-lg mx-auto">
            <p className="font-serif text-xl text-foreground">
              Thank you, we will get back to you shortly
            </p>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-foreground mb-10">
              Get In Touch
            </h2>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto text-left space-y-5">
              <div>
                <label htmlFor="contact-name" className="sr-only">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="Your name"
                  autoComplete="name"
                  className={inputClass}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                />
                {errors.name ? (
                  <p id="contact-name-error" className="mt-2 text-sm text-destructive" role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contact-email" className="sr-only">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="Your email"
                  autoComplete="email"
                  className={inputClass}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                />
                {errors.email ? (
                  <p id="contact-email-error" className="mt-2 text-sm text-destructive" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contact-message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }))
                  }}
                  placeholder="How can we help you?"
                  rows={4}
                  className={`${inputClass} min-h-[7.5rem] resize-y`}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                />
                {errors.message ? (
                  <p id="contact-message-error" className="mt-2 text-sm text-destructive" role="alert">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full min-h-11 px-8 py-4 bg-primary text-primary-foreground text-sm tracking-widest uppercase hover:bg-primary/90 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
              >
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
