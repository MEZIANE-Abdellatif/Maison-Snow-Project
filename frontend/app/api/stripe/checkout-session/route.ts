import { NextRequest, NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

interface CheckoutSessionBody {
  amount?: number
  currency?: string
  orderId?: string
  customerEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutSessionBody
    const { amount, currency, orderId, customerEmail } = body

    if (amount == null || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (currency !== "pln") {
      return NextResponse.json({ error: "Only pln currency is supported" }, { status: 400 })
    }

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements",
      mode: "payment",
      customer_email: customerEmail?.trim() || undefined,
      payment_method_types: ["card", "blik"],
      line_items: [
        {
          price_data: {
            currency: "pln",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: "Maison Snow order",
            },
          },
          quantity: 1,
        },
      ],
      return_url: `${origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { orderId },
    })

    if (!session.client_secret) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("POST /api/stripe/checkout-session error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
