import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: { select: { name: true, slug: true } } },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
