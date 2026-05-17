import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await request.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId

      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            stripePaymentId: paymentIntent.id,
          },
        })
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId

      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        })
      }
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error)
  }

  return NextResponse.json({ received: true })
}
