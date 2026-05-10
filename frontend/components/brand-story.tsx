import Image from "next/image"

export function BrandStory() {
  return (
    <section id="story" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/images/brand-story.jpg"
              alt="Maison Snow atelier"
              fill
              className="object-cover"
            />
            {/* Decorative frame */}
            <div className="absolute inset-4 border border-gold pointer-events-none" />
          </div>

          {/* Text content */}
          <div className="lg:pl-8">
            <span className="text-gold tracking-[0.3em] text-sm uppercase block mb-4">Our Story</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-wide text-foreground mb-6 leading-tight text-balance">
              Crafting Elegance Since Day One
            </h2>
            
            <div className="space-y-6 text-foreground/80 leading-relaxed">
              <p>
                At Maison Snow, we believe that true luxury lies in the details. Every piece in our collection is a testament to our dedication to exceptional craftsmanship and timeless design.
              </p>
              <p>
                Our journey began with a simple vision: to create fashion that transcends seasons and speaks to the soul. We source only the finest materials from around the world, working with skilled artisans who share our passion for perfection.
              </p>
              <p>
                From the delicate stitching of our leather goods to the precision of our jewelry settings, every element is carefully considered. This is not just fashion — this is an expression of who you are.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-10 pt-8 border-t border-border">
              <p className="font-serif text-2xl italic text-gold mb-2">
                With Love & Passion
              </p>
              <p className="text-sm tracking-widest uppercase text-foreground/60">
                — The Maison Snow Team
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
