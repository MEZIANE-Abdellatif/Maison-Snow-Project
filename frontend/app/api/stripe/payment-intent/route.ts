import { NextRequest, NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

interface PaymentIntentBody {
  amount?: number
  currency?: string
  orderId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PaymentIntentBody
    const { amount, currency, orderId } = body

    if (amount == null || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (currency !== "pln") {
      return NextResponse.json({ error: "Only pln currency is supported" }, { status: 400 })
    }

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "pln",
      metadata: { orderId },
      payment_method_types: ["card", "blik"],
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic",
        },
      },
    })

    if (!paymentIntent.client_secret) {
      return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("POST /api/stripe/payment-intent error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
