import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

interface OrderItemInput {
  productId: string
  productName: string
  price: number
  size: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, userId, shippingName, shippingPhone, shippingAddress, shippingCost, items } =
      body as {
        email?: string
        userId?: string
        shippingName?: string
        shippingPhone?: string
        shippingAddress?: string
        shippingCost?: number
        items?: OrderItemInput[]
      }

    if (!email || !shippingName || !shippingPhone || !shippingAddress || shippingCost == null) {
      return NextResponse.json(
        { error: "Missing required fields: email, shippingName, shippingPhone, shippingAddress, shippingCost" },
        { status: 400 },
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 })
    }

    for (const item of items) {
      if (!item.productId || !item.productName || item.price == null || !item.size || !item.quantity) {
        return NextResponse.json(
          { error: "Each item requires: productId, productName, price, size, quantity" },
          { status: 400 },
        )
      }
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const total = subtotal + shippingCost

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        })

        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.productName}". Available: ${product?.stock ?? 0}, requested: ${item.quantity}`,
          )
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return tx.order.create({
        data: {
          userId: userId || null,
          guestEmail: userId ? null : email,
          shippingName,
          shippingPhone,
          shippingAddress,
          subtotal,
          shippingCost,
          total,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              price: i.price,
              size: i.size,
              quantity: i.quantity,
            })),
          },
        },
        select: { id: true, total: true, createdAt: true },
      })
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    const isStockError = message.includes("Insufficient stock")

    console.error("POST /api/orders error:", error)
    return NextResponse.json(
      { error: message },
      { status: isStockError ? 400 : 500 },
    )
  }
}
