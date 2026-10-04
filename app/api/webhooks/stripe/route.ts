import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe requires the raw request body (not parsed JSON) to verify the signature.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    await markOrderPaid(session);
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await markPaymentFailed(session);
  }

  return NextResponse.json({ received: true });
}

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  // Transaction: order status, payment status, and stock decrement happen
  // together or not at all — this is the single place where "Opłacone" is set.
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) return;

    // Idempotency: Stripe can deliver the same webhook event more than once.
    if (order.paymentStatus === "PAID") return;

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId,
        method: session.payment_method_types?.[0],
        confirmedAt: new Date(),
        rawWebhookPayload: session as unknown as object,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", status: "PAID" },
    });

    // Decrement stock only now — never at "add to cart" or checkout submission.
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          delta: -item.quantity,
          reason: `ORDER_PAID:${order.orderNumber}`,
        },
      });
    }

    if (order.discountCodeId) {
      await tx.discountUsage.create({
        data: {
          discountCodeId: order.discountCodeId,
          orderId: order.id,
          discountCents: order.discountCents,
        },
      });
    }
  });

  // Notify the store owner. See lib/notifications.ts — wire up email/Slack/SMS there.
  const { notifyNewPaidOrder } = await import("@/lib/notifications");
  await notifyNewPaidOrder(orderId);
}

async function markPaymentFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await prisma.payment.update({ where: { orderId }, data: { status: "FAILED" } });
}
