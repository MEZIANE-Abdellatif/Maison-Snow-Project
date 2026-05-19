import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function mapDeliveryStatus(status: string): "Processing" | "Shipped" | "Delivered" {
  if (status === "SHIPPED") return "Shipped"
  if (status === "DELIVERED") return "Delivered"
  return "Processing"
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIdParam = request.nextUrl.searchParams.get("userId")
    const userId = userIdParam && userIdParam === session.user.id ? userIdParam : session.user.id

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            price: true,
            quantity: true,
            size: true,
            product: { select: { images: true } },
          },
        },
      },
    })

    const mapped = orders.map((order) => ({
      id: order.id,
      placedAt: order.createdAt.toISOString(),
      total: order.total,
      status: mapDeliveryStatus(order.deliveryStatus),
      items: order.items.map((item) => {
        const productImage = item.product?.images?.[0]
        return {
          id: item.id,
          name: item.productName,
          image: productImage && productImage.length > 0 ? productImage : "/images/product1.jpg",
          imageAlt: item.productName,
          qty: item.quantity,
          price: item.price,
        }
      }),
      shippingAddress: order.shippingAddress.split("\n").filter(Boolean),
      estimatedDelivery: "Delivery date will be confirmed by email",
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    console.error("GET /api/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const {
      id: orderId,
      email,
      userId,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCost,
      items,
      stripePaymentId,
      paymentStatus,
    } = body as {
      id?: string
      email?: string
      userId?: string
      shippingName?: string
      shippingPhone?: string
      shippingAddress?: string
      shippingCost?: number
      items?: OrderItemInput[]
      stripePaymentId?: string
      paymentStatus?: "PAID" | "PENDING" | "FAILED"
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
          ...(orderId ? { id: orderId } : {}),
          userId: userId || null,
          guestEmail: userId ? null : email,
          shippingName,
          shippingPhone,
          shippingAddress,
          subtotal,
          shippingCost,
          total,
          paymentStatus: paymentStatus ?? "PENDING",
          stripePaymentId: stripePaymentId ?? null,
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
