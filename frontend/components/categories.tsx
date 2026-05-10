import Image from "next/image"

const categories = [
  {
    name: "Purse",
    tagline: "Carry elegance everywhere.",
    image: "/images/purse.jpg"
  },
  {
    name: "Jewelry",
    tagline: "Shine with every little detail.",
    image: "/images/jewelry.jpg"
  },
  {
    name: "Scarf",
    tagline: "Wrap yourself in grace and style.",
    image: "/images/scarf.jpg"
  },
  {
    name: "Dress",
    tagline: "Designed to make you feel beautiful.",
    image: "/images/dress.jpg"
  }
]

export function Categories() {
  return (
    <section id="categories" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gold" />
            <span className="text-gold tracking-[0.3em] text-sm uppercase">We Start With</span>
            <div className="h-px w-12 bg-gold" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-foreground">
            Our Collections
          </h2>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="group cursor-pointer">
              <div className="relative aspect-square overflow-hidden bg-cream-dark mb-4">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category label on image */}
                <div className="absolute top-4 left-0 right-0 text-center">
                  <span className="inline-block bg-background/90 px-6 py-2 text-sm tracking-[0.2em] uppercase font-medium text-foreground">
                    {category.name}
                  </span>
                </div>
              </div>
              
              {/* Tagline */}
              <p className="text-center text-foreground/70 text-sm leading-relaxed">
                {category.tagline}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
