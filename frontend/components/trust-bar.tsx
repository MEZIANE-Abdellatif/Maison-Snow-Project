import { Diamond, Heart, Package, Crown } from "lucide-react"

const trustItems = [
  {
    icon: Diamond,
    label: "Premium Quality"
  },
  {
    icon: Heart,
    label: "Elegant Designs"
  },
  {
    icon: Package,
    label: "Made For You"
  },
  {
    icon: Crown,
    label: "Timeless Fashion"
  }
]

export function TrustBar() {
  return (
    <section className="py-16 px-4 bg-primary">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-gold tracking-[0.3em] text-sm uppercase mb-2">
            This Is Just The Beginning
          </p>
          <p className="font-serif text-2xl md:text-3xl italic text-primary-foreground">
            Thank you for being a part of our journey.
          </p>
          <div className="flex justify-center mt-4">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Trust items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div key={item.label} className="text-center relative">
              {/* Divider (not on first item) */}
              {index > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gold/30" />
              )}
              
              <div className="flex flex-col items-center gap-3">
                <item.icon className="w-8 h-8 text-gold" strokeWidth={1.5} />
                <span className="text-primary-foreground text-sm tracking-widest uppercase">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="text-center mt-12 pt-8 border-t border-gold/20">
          <p className="text-primary-foreground tracking-[0.3em] text-sm uppercase">
            Maison Snow — Where Style Begins
          </p>
        </div>
      </div>
    </section>
  )
}
