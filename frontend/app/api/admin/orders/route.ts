import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import type { DeliveryStatus } from "@/prisma/generated/prisma/client"

const VALID_STATUSES: DeliveryStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED"]

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status")?.toUpperCase() as
      | DeliveryStatus
      | undefined

    const where: Record<string, unknown> = {}
    if (status && VALID_STATUSES.includes(status)) {
      where.deliveryStatus = status
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        guestEmail: true,
        user: { select: { email: true } },
        shippingName: true,
        total: true,
        paymentStatus: true,
        deliveryStatus: true,
        _count: { select: { items: true } },
      },
    })

    const result = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      email: o.user?.email ?? o.guestEmail,
      shippingName: o.shippingName,
      total: o.total,
      paymentStatus: o.paymentStatus,
      deliveryStatus: o.deliveryStatus,
      itemsCount: o._count.items,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/admin/orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
