import { NextRequest, NextResponse } from "next/server"

import { uploadImage } from "@/lib/cloudinary"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 },
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadImage(buffer, file.name)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("POST /api/admin/upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
