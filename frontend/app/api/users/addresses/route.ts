import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { mapAddressRow } from "@/lib/address-api"
import { prisma } from "@/lib/db"

const MAX_ADDRESSES = 2

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
      take: MAX_ADDRESSES,
    })

    return NextResponse.json(addresses.map(mapAddressRow))
  } catch (error) {
    console.error("GET /api/users/addresses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
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

    if (!street?.trim() || !building?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: street, building, city, postalCode, country" },
        { status: 400 },
      )
    }

    const count = await prisma.address.count({
      where: { userId: session.user.id },
    })

    if (count >= MAX_ADDRESSES) {
      return NextResponse.json({ error: "You can only save 2 addresses" }, { status: 400 })
    }

    const makeDefault = count === 0 ? true : Boolean(isDefault)

    const created = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id },
          data: { isDefault: false },
        })
      }

      return tx.address.create({
        data: {
          userId: session.user.id,
          street: street.trim(),
          building: building.trim(),
          apartment: apartment?.trim() || null,
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          isDefault: makeDefault,
        },
      })
    })

    return NextResponse.json(mapAddressRow(created), { status: 201 })
  } catch (error) {
    console.error("POST /api/users/addresses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
