import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { NewArrivals } from "@/components/new-arrivals"
import { BrandStory } from "@/components/brand-story"
import { TrustBar } from "@/components/trust-bar"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Categories />
      <NewArrivals />
      <BrandStory />
      <TrustBar />
      <Newsletter />
      <Footer />
    </main>
  )
}
