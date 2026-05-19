import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { mapAddressRow } from "@/lib/address-api"
import { prisma } from "@/lib/db"

type RouteContext = { params: Promise<{ id: string }> }

async function getOwnedAddress(userId: string, addressId: string) {
  return prisma.address.findFirst({
    where: { id: addressId, userId },
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const existing = await getOwnedAddress(session.user.id, id)

    if (!existing) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { street, building, apartment, city, postalCode, country, isDefault } = body as {
      street?: string
      building?: string
      apartment?: string
      city?: string
      postalCode?: string
      country?: string
      isDefault?: boolean
    }

    const setDefault = isDefault === true

    const updated = await prisma.$transaction(async (tx) => {
      if (setDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id, id: { not: id } },
          data: { isDefault: false },
        })
      }

      return tx.address.update({
        where: { id },
        data: {
          ...(street !== undefined ? { street: street.trim() } : {}),
          ...(building !== undefined ? { building: building.trim() } : {}),
          ...(apartment !== undefined ? { apartment: apartment.trim() || null } : {}),
          ...(city !== undefined ? { city: city.trim() } : {}),
          ...(postalCode !== undefined ? { postalCode: postalCode.trim() } : {}),
          ...(country !== undefined ? { country: country.trim() } : {}),
          ...(isDefault !== undefined ? { isDefault: setDefault } : {}),
        },
      })
    })

    return NextResponse.json(mapAddressRow(updated))
  } catch (error) {
    console.error("PATCH /api/users/addresses/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const existing = await getOwnedAddress(session.user.id, id)

    if (!existing) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id } })

      if (existing.isDefault) {
        const remaining = await tx.address.findFirst({
          where: { userId: session.user.id },
          orderBy: { id: "asc" },
        })

        if (remaining) {
          await tx.address.update({
            where: { id: remaining.id },
            data: { isDefault: true },
          })
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/users/addresses/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
