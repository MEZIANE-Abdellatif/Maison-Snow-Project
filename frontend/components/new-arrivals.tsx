import Image from "next/image"
import Link from "next/link"

const products = [
  {
    name: "Ivory Leather Tote",
    price: "$1,250",
    image: "/images/product1.jpg"
  },
  {
    name: "Gold Link Bracelet",
    price: "$485",
    image: "/images/product2.jpg"
  },
  {
    name: "Silk Ivory Blouse",
    price: "$695",
    image: "/images/product3.jpg"
  },
  {
    name: "Champagne Cashmere Scarf",
    price: "$320",
    image: "/images/product4.jpg"
  }
]

export function NewArrivals() {
  return (
    <section id="new-arrivals" className="py-24 px-4 bg-cream-dark">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-gold tracking-[0.3em] text-sm uppercase block mb-4">Fresh Additions</span>
          <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-foreground mb-4">
            New Arrivals
          </h2>
          <p className="text-foreground/70 max-w-md mx-auto">
            Discover our latest pieces, crafted with the finest materials and timeless design.
          </p>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.name} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Quick view button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-primary text-primary-foreground px-6 py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-foreground transition-colors">
                    Quick View
                  </button>
                </div>
              </div>
              
              {/* Product info */}
              <div className="text-center">
                <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-gold transition-colors">
                  {product.name}
                </h3>
                <p className="text-gold font-medium tracking-wide">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center border-2 border-primary text-primary px-12 py-3 text-sm tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
