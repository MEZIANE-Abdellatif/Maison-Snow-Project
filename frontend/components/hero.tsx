import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Luxury silk fabric"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      </div>

      {/* New Beginning ribbon */}
      <div className="absolute top-24 right-4 md:right-12 z-10">
        <div className="bg-primary text-primary-foreground px-4 py-3 text-center relative">
          <span className="text-xs tracking-widest uppercase block">New</span>
          <span className="text-xs tracking-widest uppercase block">Beginning</span>
          <div className="absolute -bottom-3 left-0 w-0 h-0 border-l-[24px] border-l-primary border-b-[12px] border-b-transparent" />
          <div className="absolute -bottom-3 right-0 w-0 h-0 border-r-[24px] border-r-primary border-b-[12px] border-b-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center border-2 border-gold rounded-sm px-6 py-4 mb-4">
            <span className="font-serif text-5xl md:text-6xl font-semibold text-gold">M</span>
            <span className="font-serif text-5xl md:text-6xl font-semibold text-gold ml-1">S</span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z" opacity="0.3" />
            </svg>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl tracking-[0.2em] text-foreground">
              MAISON SNOW
            </h1>
            <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9 9L2 12L9 15L12 22L15 15L22 12L15 9L12 2Z" opacity="0.3" />
            </svg>
          </div>
          <p className="text-gold tracking-[0.3em] text-sm uppercase">Timeless Elegance, Made For You</p>
        </div>

        {/* Diamond separator */}
        <div className="flex items-center justify-center mb-8">
          <svg className="w-4 h-4 text-gold" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0L16 8L8 16L0 8L8 0Z" />
          </svg>
        </div>

        {/* Tagline */}
        <h2 className="font-serif text-2xl md:text-3xl tracking-wide text-foreground mb-4">
          WE ARE STARTING OUR JOURNEY
        </h2>
        <p className="font-serif text-3xl md:text-4xl italic text-gold mb-4">
          With Love & Passion
        </p>
        
        {/* Heart */}
        <div className="flex justify-center mb-8">
          <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Description */}
        <p className="text-foreground/80 max-w-xl mx-auto leading-relaxed mb-12">
          Step into a world of style and sophistication. We&apos;re beginning with timeless pieces that complete your every look.
        </p>

        {/* CTA Button */}
        <a 
          href="#categories"
          className="inline-block bg-primary text-primary-foreground px-12 py-4 text-sm tracking-widest uppercase hover:bg-gold hover:text-foreground transition-all duration-300"
        >
          Explore Collection
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs tracking-widest uppercase text-foreground/60">Scroll</span>
          <svg className="w-4 h-4 text-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
