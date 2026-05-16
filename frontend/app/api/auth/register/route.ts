import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = body as {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
    }

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, password" },
        { status: 400 },
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "CUSTOMER",
      },
    })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error) {
    console.error("POST /api/auth/register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
