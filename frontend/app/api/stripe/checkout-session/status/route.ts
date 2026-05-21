import { NextRequest, NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    })

    const paymentIntent = session.payment_intent
    const paymentIntentId =
      typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? null

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      paymentIntentId,
      orderId: session.metadata?.orderId ?? null,
    })
  } catch (error) {
    console.error("GET /api/stripe/checkout-session/status error:", error)
    return NextResponse.json({ error: "Failed to retrieve checkout session" }, { status: 500 })
  }
}
