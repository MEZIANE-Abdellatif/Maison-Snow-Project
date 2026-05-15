import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

import { uploadImage } from "../lib/cloudinary"
import { PrismaClient } from "./generated/prisma/client.js"

const PLACEHOLDER_FOLDER = "maison-snow/products/placeholders"

const CATEGORY_PLACEHOLDER_SOURCES: Record<string, string> = {
  purse: "https://picsum.photos/seed/maison-purse/800/1000",
  jewelry: "https://picsum.photos/seed/maison-jewelry/800/1000",
  scarf: "https://picsum.photos/seed/maison-scarf/800/1000",
  dress: "https://picsum.photos/seed/maison-dress/800/1000",
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch placeholder image: ${url}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function uploadCategoryPlaceholder(slug: string, sourceUrl: string): Promise<string> {
  const buffer = await fetchImageBuffer(sourceUrl)
  return uploadImage(buffer, `${slug}-placeholder.jpg`, PLACEHOLDER_FOLDER)
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database …")

  console.log("  ↳ Uploading category placeholders to Cloudinary …")
  const placeholderUrls: Record<string, string> = {}
  for (const [slug, sourceUrl] of Object.entries(CATEGORY_PLACEHOLDER_SOURCES)) {
    placeholderUrls[slug] = await uploadCategoryPlaceholder(slug, sourceUrl)
    console.log(`    ✓ ${slug}`)
  }

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "purse" },
      update: {},
      create: {
        name: "Purse",
        slug: "purse",
        description: "Hand-crafted leather bags for every occasion.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "jewelry" },
      update: {},
      create: {
        name: "Jewelry",
        slug: "jewelry",
        description: "Refined pieces that catch the light and hold the moment.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "scarf" },
      update: {},
      create: {
        name: "Scarf",
        slug: "scarf",
        description: "Luxurious wraps in silk, cashmere, and fine wool.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "dress" },
      update: {},
      create: {
        name: "Dress",
        slug: "dress",
        description: "Elegant silhouettes designed to make you feel beautiful.",
      },
    }),
  ])

  const [purse, jewelry, scarf, dress] = categories
  console.log(`  ✓ ${categories.length} categories`)

  const purseImages = [placeholderUrls.purse, placeholderUrls.purse]
  const jewelryImages = [placeholderUrls.jewelry, placeholderUrls.jewelry]
  const scarfImages = [placeholderUrls.scarf, placeholderUrls.scarf]
  const dressImages = [placeholderUrls.dress, placeholderUrls.dress]

  const productData = [
    {
      categoryId: purse.id,
      name: "Ivory Leather Tote",
      slug: "ivory-leather-tote",
      description:
        "Hand-finished Italian leather with a suede-lined interior. Structured silhouette, polished hardware, and a shoulder strap that sits just right.",
      price: 1150,
      sizes: ["S", "M", "L"],
      images: purseImages,
      stock: 10,
    },
    {
      categoryId: purse.id,
      name: "Noir Mini Crossbody",
      slug: "noir-mini-crossbody",
      description:
        "Compact crossbody in deep grain leather with an adjustable strap. Designed for essentials only: phone, keys, lipstick, and quiet confidence.",
      price: 890,
      sizes: ["One Size"],
      images: purseImages,
      stock: 10,
    },
    {
      categoryId: purse.id,
      name: "Signature Canvas Tote",
      slug: "signature-canvas-tote",
      description:
        "Reinforced canvas with leather trim and a sturdy base. Spacious enough for a laptop, soft enough to fold for travel.",
      price: 780,
      sizes: ["One Size"],
      images: purseImages,
      stock: 10,
    },
    {
      categoryId: purse.id,
      name: "Camel Suede Clutch",
      slug: "camel-suede-clutch",
      description:
        "Buttery suede with a magnetic fold-over flap. A slim gold chain lets it double as a shoulder bag when the evening calls for hands-free.",
      price: 520,
      sizes: ["One Size"],
      images: purseImages,
      stock: 10,
    },
    {
      categoryId: jewelry.id,
      name: "Gold Link Bracelet",
      slug: "gold-link-bracelet",
      description:
        "Warm-toned links with a secure clasp and a weight that feels substantial yet refined. Layer it or let it shine on its own.",
      price: 485,
      sizes: ["One Size"],
      images: jewelryImages,
      stock: 10,
    },
    {
      categoryId: jewelry.id,
      name: "Pearl Strand Necklace",
      slug: "pearl-strand-necklace",
      description:
        "Lustrous cultured pearls hand-knotted for drape and longevity. A Maison Snow signature for vows, galas, and every moment worth remembering.",
      price: 720,
      sizes: ["One Size"],
      images: jewelryImages,
      stock: 10,
    },
    {
      categoryId: jewelry.id,
      name: "Lumière Drop Earrings",
      slug: "lumiere-drop-earrings",
      description:
        "Slim drops that catch light with every turn. Hypoallergenic posts, balanced weight, and a silhouette that elongates the neck.",
      price: 395,
      sizes: ["One Size"],
      images: jewelryImages,
      stock: 10,
    },
    {
      categoryId: jewelry.id,
      name: "Twisted Gold Ring",
      slug: "twisted-gold-ring",
      description:
        "A sculptural ring with a hand-twisted motif. The open band adjusts slightly for a comfortable fit on any finger.",
      price: 310,
      sizes: ["S", "M", "L"],
      images: jewelryImages,
      stock: 10,
    },
    {
      categoryId: scarf.id,
      name: "Champagne Cashmere Scarf",
      slug: "champagne-cashmere-scarf",
      description:
        "Featherlight cashmere with hand-rolled edges. The tone reads as neutral warmth—equally at home with camel tailoring or winter white.",
      price: 350,
      sizes: ["One Size"],
      images: scarfImages,
      stock: 10,
    },
    {
      categoryId: scarf.id,
      name: "Silk Evening Stole",
      slug: "silk-evening-stole",
      description:
        "Fluid silk charmeuse with a subtle sheen. Drape over shoulders or knot at the neck—the cut is generous without ever feeling heavy.",
      price: 290,
      sizes: ["One Size"],
      images: scarfImages,
      stock: 10,
    },
    {
      categoryId: scarf.id,
      name: "Merino Wool Wrap",
      slug: "merino-wool-wrap",
      description:
        "Dense yet breathable merino in a generous rectangular cut. Works as a blanket on long flights or a structured wrap with a brooch.",
      price: 220,
      sizes: ["One Size"],
      images: scarfImages,
      stock: 10,
    },
    {
      categoryId: scarf.id,
      name: "Floral Print Bandana",
      slug: "floral-print-bandana",
      description:
        "A silk-cotton blend square with an original Maison Snow floral print. Tie it at the neck, the wrist, or through a bag handle.",
      price: 165,
      sizes: ["One Size"],
      images: scarfImages,
      stock: 10,
    },
    {
      categoryId: dress.id,
      name: "Midnight Silk Slip Dress",
      slug: "midnight-silk-slip-dress",
      description:
        "Bias-cut silk charmeuse that skims the body without clinging. A cowl neckline and an open back keep the drama quiet but undeniable.",
      price: 1450,
      sizes: ["XS", "S", "M", "L", "XL"],
      images: dressImages,
      stock: 10,
    },
    {
      categoryId: dress.id,
      name: "Ivory Lace Midi",
      slug: "ivory-lace-midi",
      description:
        "French lace over a nude lining with scalloped hems. Cap sleeves and a defined waist make it equally suited for garden parties and civil ceremonies.",
      price: 1850,
      sizes: ["XS", "S", "M", "L"],
      images: dressImages,
      stock: 10,
    },
    {
      categoryId: dress.id,
      name: "Noir Crepe Blazer Dress",
      slug: "noir-crepe-blazer-dress",
      description:
        "Double-breasted styling in heavy crepe with satin peak lapels. The power shoulder meets a relaxed hem that falls just above the knee.",
      price: 980,
      sizes: ["S", "M", "L", "XL"],
      images: dressImages,
      stock: 10,
    },
    {
      categoryId: dress.id,
      name: "Rosé Tulle Gown",
      slug: "rose-tulle-gown",
      description:
        "Layers of soft tulle over a fitted bodice with hand-sewn crystal accents. Floor-length and weightless—designed for the night you want to remember forever.",
      price: 1980,
      sizes: ["XS", "S", "M", "L"],
      images: dressImages,
      stock: 10,
    },
  ]

  let productCount = 0
  for (const p of productData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        images: p.images,
      },
      create: {
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        sizes: p.sizes,
        images: p.images,
        stock: p.stock,
        isActive: true,
      },
    })
    productCount++
  }
  console.log(`  ✓ ${productCount} products`)

  const passwordHash = await bcrypt.hash("admin123", 12)

  await prisma.user.upsert({
    where: { email: "admin@maisonsnow.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "Snow",
      email: "admin@maisonsnow.com",
      passwordHash,
      role: "ADMIN",
    },
  })
  console.log("  ✓ 1 admin user (admin@maisonsnow.com)")

  console.log("✅ Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
