import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get("category")
    const sort = searchParams.get("sort")
    const limit = Math.min(Number(searchParams.get("limit")) || 16, 100)

    const where: Record<string, unknown> = { isActive: true }
    if (category) {
      where.category = { slug: category }
    }

    type OrderBy = Record<string, "asc" | "desc">
    let orderBy: OrderBy = { createdAt: "desc" }
    if (sort === "price_asc") orderBy = { price: "asc" }
    else if (sort === "price_desc") orderBy = { price: "desc" }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        sizes: true,
        stock: true,
        category: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
