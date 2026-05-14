import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("GET /api/admin/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, categoryId, description, price, sizes, images, stock, isActive } = body as {
      name?: string
      categoryId?: string
      description?: string
      price?: number
      sizes?: string[]
      images?: string[]
      stock?: number
      isActive?: boolean
    }

    if (!name || !categoryId || !description || price == null || !sizes || !images) {
      return NextResponse.json(
        { error: "Missing required fields: name, categoryId, description, price, sizes, images" },
        { status: 400 },
      )
    }

    let slug = slugify(name)

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        description,
        price,
        sizes,
        images,
        stock: stock ?? 0,
        isActive: isActive ?? true,
      },
      include: { category: { select: { name: true } } },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("POST /api/admin/products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
