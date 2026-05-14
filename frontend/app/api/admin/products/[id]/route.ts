import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const allowedFields = [
      "name",
      "categoryId",
      "description",
      "price",
      "sizes",
      "images",
      "stock",
      "isActive",
    ] as const

    const data: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        data[key] = body[key]
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { name: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
