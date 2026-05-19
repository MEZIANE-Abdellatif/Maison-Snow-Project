import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"

function mapProfile(user: {
  firstName: string
  lastName: string
  email: string
  phone: string | null
}) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true, phone: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(mapProfile(user))
  } catch (error) {
    console.error("GET /api/users/profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phone } = body as {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string | null
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "firstName and lastName are required" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone === undefined ? undefined : phone === null ? null : phone.trim() || null,
      },
      select: { firstName: true, lastName: true, email: true, phone: true },
    })

    return NextResponse.json(mapProfile(updated))
  } catch (error) {
    console.error("PATCH /api/users/profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
