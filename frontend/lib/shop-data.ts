export type ProductCategory = "purse" | "jewelry" | "scarf" | "dress"

export type ApparelSize = "S" | "M" | "L" | "XL"

export const APPAREL_SIZES: ApparelSize[] = ["S", "M", "L", "XL"]

export type ShopProduct = {
  id: string
  slug: string
  name: string
  category: ProductCategory
  price: number
  /** Primary image (shop cards, OG) */
  image: string
  /** Gallery order; first is default hero */
  images: string[]
  description: string
  sizes: string[]
  hasSizes: boolean
  createdAt: string
}

export const CATEGORY_SLUGS = [
  "all",
  "purse",
  "jewelry",
  "scarf",
  "dress",
] as const

export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

export const CATEGORY_TAGLINES: Record<
  Exclude<CategorySlug, "all">,
  { label: string; tagline: string }
> = {
  purse: {
    label: "Purse",
    tagline: "Carry elegance everywhere.",
  },
  jewelry: {
    label: "Jewelry",
    tagline: "Shine with every little detail.",
  },
  scarf: {
    label: "Scarf",
    tagline: "Wrap yourself in grace and style.",
  },
  dress: {
    label: "Dress",
    tagline: "Designed to make you feel beautiful.",
  },
}

/** Mock catalog — no dresses yet so the shop empty state is reachable. */
export const MOCK_PRODUCTS: ShopProduct[] = [
  {
    id: "1",
    slug: "ivory-leather-tote",
    name: "Ivory Leather Tote",
    category: "purse",
    price: 1250,
    image: "/images/product1.jpg",
    images: [
      "/images/product1.jpg",
      "/images/purse.jpg",
      "/images/product4.jpg",
    ],
    description:
      "Hand-finished Italian leather with a suede-lined interior. Structured silhouette, polished hardware, and a shoulder strap that sits just right—from morning appointments to candlelit evenings.",
    sizes: ["S", "M", "L"],
    hasSizes: true,
    createdAt: "2025-11-02T12:00:00.000Z",
  },
  {
    id: "2",
    slug: "noir-mini-crossbody",
    name: "Noir Mini Crossbody",
    category: "purse",
    price: 890,
    image: "/images/purse.jpg",
    images: ["/images/purse.jpg", "/images/product1.jpg", "/images/product2.jpg"],
    description:
      "Compact crossbody in deep grain leather with an adjustable strap. Designed for essentials only: phone, keys, lipstick, and quiet confidence.",
    sizes: ["S", "M", "L"],
    hasSizes: true,
    createdAt: "2025-10-18T12:00:00.000Z",
  },
  {
    id: "3",
    slug: "gold-link-bracelet",
    name: "Gold Link Bracelet",
    category: "jewelry",
    price: 485,
    image: "/images/product2.jpg",
    images: ["/images/product2.jpg", "/images/jewelry.jpg", "/images/product3.jpg"],
    description:
      "Warm-toned links with a secure clasp and a weight that feels substantial yet refined. Layer it or let it shine on its own.",
    sizes: ["One Size"],
    hasSizes: false,
    createdAt: "2025-11-10T12:00:00.000Z",
  },
  {
    id: "4",
    slug: "pearl-strand-necklace",
    name: "Pearl Strand Necklace",
    category: "jewelry",
    price: 720,
    image: "/images/jewelry.jpg",
    images: ["/images/jewelry.jpg", "/images/product2.jpg", "/images/product3.jpg"],
    description:
      "Lustrous cultured pearls hand-knotted for drape and longevity. A Maison Snow signature for vows, galas, and every moment worth remembering.",
    sizes: ["One Size"],
    hasSizes: false,
    createdAt: "2025-09-05T12:00:00.000Z",
  },
  {
    id: "5",
    slug: "champagne-cashmere-scarf",
    name: "Champagne Cashmere Scarf",
    category: "scarf",
    price: 320,
    image: "/images/product4.jpg",
    images: ["/images/product4.jpg", "/images/scarf.jpg", "/images/hero-bg.jpg"],
    description:
      "Featherlight cashmere with hand-rolled edges. The tone reads as neutral warmth—equally at home with camel tailoring or winter white.",
    sizes: ["One Size"],
    hasSizes: false,
    createdAt: "2025-11-01T12:00:00.000Z",
  },
  {
    id: "6",
    slug: "silk-evening-stole",
    name: "Silk Evening Stole",
    category: "scarf",
    price: 410,
    image: "/images/scarf.jpg",
    images: ["/images/scarf.jpg", "/images/product4.jpg", "/images/dress.jpg"],
    description:
      "Fluid silk charmeuse with a subtle sheen. Drape over shoulders or knot at the neck—the cut is generous without ever feeling heavy.",
    sizes: ["One Size"],
    hasSizes: false,
    createdAt: "2025-08-22T12:00:00.000Z",
  },
  {
    id: "7",
    slug: "lumiere-drop-earrings",
    name: "Lumière Drop Earrings",
    category: "jewelry",
    price: 695,
    image: "/images/product3.jpg",
    images: ["/images/product3.jpg", "/images/jewelry.jpg", "/images/product2.jpg"],
    description:
      "Slim drops that catch light with every turn. Hypoallergenic posts, balanced weight, and a silhouette that elongates the neck.",
    sizes: ["One Size"],
    hasSizes: false,
    createdAt: "2025-07-14T12:00:00.000Z",
  },
  {
    id: "8",
    slug: "signature-canvas-tote",
    name: "Signature Canvas Tote",
    category: "purse",
    price: 980,
    image: "/images/product1.jpg",
    images: [
      "/images/product1.jpg",
      "/images/purse.jpg",
      "/images/product3.jpg",
      "/images/product4.jpg",
    ],
    description:
      "Reinforced canvas with leather trim and reinforced base. Spacious enough for a laptop, soft enough to fold for travel.",
    sizes: ["S", "M", "L"],
    hasSizes: true,
    createdAt: "2025-06-01T12:00:00.000Z",
  },
]

export function parseCategoryParam(
  raw: string | null,
): Exclude<CategorySlug, "all"> | "all" {
  if (!raw) return "all"
  const v = raw.toLowerCase().trim()
  if (v === "all") return "all"
  if (v === "purse" || v === "jewelry" || v === "scarf" || v === "dress") {
    return v
  }
  return "all"
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function getProductBySlug(slug: string): ShopProduct | undefined {
  const key = slug.toLowerCase().trim()
  return MOCK_PRODUCTS.find((p) => p.slug === key)
}

export function getAllProductSlugs(): string[] {
  return MOCK_PRODUCTS.map((p) => p.slug)
}

/** Up to `limit` other products in the same category (excludes `excludeId`). */
export function getRelatedProducts(
  category: ProductCategory,
  excludeId: string,
  limit = 4,
): ShopProduct[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.category === category && p.id !== excludeId,
  ).slice(0, limit)
}
