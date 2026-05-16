import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body as { email?: string }

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { firstName: true },
    })

    return NextResponse.json({
      exists: Boolean(user),
      firstName: user?.firstName ?? null,
    })
  } catch (error) {
    console.error("POST /api/auth/check-email error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
