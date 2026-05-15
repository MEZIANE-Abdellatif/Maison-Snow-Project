import type { ProductCategory, ShopProduct } from "@/lib/shop-data"

export type ApiCategory = {
  id: string
  name: string
  slug: string
  description: string | null
}

export type ApiProductListItem = {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  sizes: string[]
  stock: number
  category: { name: string; slug: string }
}

export type ApiProductDetail = ApiProductListItem & {
  categoryId: string
  description: string
  isActive: boolean
  createdAt: string
}

export type ShopSortKey = "newest" | "price-asc" | "price-desc"

function toProductCategory(slug: string): ProductCategory {
  if (slug === "purse" || slug === "jewelry" || slug === "scarf" || slug === "dress") {
    return slug
  }
  return "purse"
}

export function hasSelectableSizes(sizes: string[]): boolean {
  return sizes.length > 0 && !(sizes.length === 1 && sizes[0] === "One Size")
}

export function mapListProductToShopProduct(item: ApiProductListItem): ShopProduct {
  const images = item.images.length > 0 ? item.images : ["/images/product1.jpg"]
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: toProductCategory(item.category.slug),
    price: item.price,
    image: images[0],
    images,
    description: "",
    sizes: item.sizes,
    hasSizes: hasSelectableSizes(item.sizes),
    createdAt: new Date().toISOString(),
  }
}

export function mapDetailProductToShopProduct(item: ApiProductDetail): ShopProduct {
  const images = item.images.length > 0 ? item.images : ["/images/product1.jpg"]
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: toProductCategory(item.category.slug),
    price: item.price,
    image: images[0],
    images,
    description: item.description,
    sizes: item.sizes,
    hasSizes: hasSelectableSizes(item.sizes),
    createdAt: item.createdAt,
  }
}

export function sortToApiParam(sort: ShopSortKey): string {
  if (sort === "price-asc") return "price_asc"
  if (sort === "price-desc") return "price_desc"
  return "newest"
}

export async function fetchProducts(params?: {
  category?: string
  sort?: ShopSortKey
  limit?: number
}): Promise<ShopProduct[]> {
  const search = new URLSearchParams()
  if (params?.category && params.category !== "all") {
    search.set("category", params.category)
  }
  if (params?.sort) {
    search.set("sort", sortToApiParam(params.sort))
  }
  if (params?.limit != null) {
    search.set("limit", String(params.limit))
  }

  const qs = search.toString()
  const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`)
  if (!res.ok) {
    throw new Error("Failed to load products")
  }

  const data = (await res.json()) as ApiProductListItem[]
  return data.map(mapListProductToShopProduct)
}

export async function fetchProductBySlug(slug: string): Promise<ShopProduct | null> {
  const res = await fetch(`/api/products/${encodeURIComponent(slug)}`)
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error("Failed to load product")
  }

  const data = (await res.json()) as ApiProductDetail
  if (!data.isActive) return null
  return mapDetailProductToShopProduct(data)
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await fetch("/api/categories")
  if (!res.ok) {
    throw new Error("Failed to load categories")
  }
  return res.json() as Promise<ApiCategory[]>
}

/** Category card images (not in API). */
export const CATEGORY_CARD_IMAGES: Record<ProductCategory, string> = {
  purse: "/images/purse.jpg",
  jewelry: "/images/jewelry.jpg",
  scarf: "/images/scarf.jpg",
  dress: "/images/dress.jpg",
}
