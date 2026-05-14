import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import type { DeliveryStatus } from "@/prisma/generated/prisma/client"

const VALID_STATUSES: DeliveryStatus[] = ["PROCESSING", "SHIPPED", "DELIVERED"]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { deliveryStatus } = body as { deliveryStatus?: string }

    if (!deliveryStatus || !VALID_STATUSES.includes(deliveryStatus as DeliveryStatus)) {
      return NextResponse.json(
        { error: `Invalid deliveryStatus. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      )
    }

    const existing = await prisma.order.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { deliveryStatus: deliveryStatus as DeliveryStatus },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
