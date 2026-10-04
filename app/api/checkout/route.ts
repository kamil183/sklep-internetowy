import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { generateOrderNumber, findValidDiscountCode } from "@/lib/orders";

const SHIPPING_RATES_CENTS = {
  INPOST_LOCKER: 1200,
  INPOST_COURIER: 1600,
} as const;

const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1) })).min(1),
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6),
  }),
  deliveryMethod: z.enum(["INPOST_LOCKER", "INPOST_COURIER"]),
  inpostLockerCode: z.string().optional(),
  shippingAddress: z
    .object({ street: z.string(), city: z.string(), postCode: z.string() })
    .optional(),
  discountCode: z.string().optional(),
  attribution: z
    .object({
      trafficSource: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe dane zamówienia.", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.deliveryMethod === "INPOST_LOCKER" && !data.inpostLockerCode) {
    return NextResponse.json({ error: "Wybierz Paczkomat." }, { status: 400 });
  }
  if (data.deliveryMethod === "INPOST_COURIER" && !data.shippingAddress) {
    return NextResponse.json({ error: "Podaj adres dostawy." }, { status: 400 });
  }

  // Server-side stock + price lookup — never trust prices sent from the client.
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: "Jeden z produktów jest niedostępny." }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Za mało sztuk na stanie: ${product.name}.` }, { status: 400 });
    }
  }

  const subtotalCents = data.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.priceCents * item.quantity;
  }, 0);

  let discountCents = 0;
  let discountCodeRecord = null;
  if (data.discountCode) {
    const result = await findValidDiscountCode(data.discountCode, subtotalCents);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    discountCents = result.discountCents;
    discountCodeRecord = result.discount;
  }

  const shippingCents = SHIPPING_RATES_CENTS[data.deliveryMethod];
  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents;

  const customer = await prisma.customer.upsert({
    where: { email: data.customer.email.toLowerCase() },
    update: { firstName: data.customer.firstName, lastName: data.customer.lastName, phone: data.customer.phone },
    create: {
      email: data.customer.email.toLowerCase(),
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      phone: data.customer.phone,
    },
  });

  // Order is created as NEW / PENDING *before* payment. It only ever becomes
  // PAID inside the Stripe webhook handler, once Stripe confirms the charge —
  // never here, and never when the customer is redirected back to /order-success.
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerId: customer.id,
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      discountCodeId: discountCodeRecord?.id,
      deliveryMethod: data.deliveryMethod,
      inpostLockerCode: data.inpostLockerCode,
      shippingAddress: data.shippingAddress ?? undefined,
      status: "NEW",
      paymentStatus: "PENDING",
      trafficSource: data.attribution?.trafficSource,
      utmSource: data.attribution?.utmSource,
      utmMedium: data.attribution?.utmMedium,
      utmCampaign: data.attribution?.utmCampaign,
      items: {
        create: data.items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return { productId: product.id, quantity: item.quantity, unitPriceCents: product.priceCents };
        }),
      },
    },
  });

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "blik", "p24"],
    // Apple Pay / Google Pay are surfaced automatically by Stripe Checkout
    // for eligible browsers/devices when "card" is enabled — no separate
    // integration is required on top of Stripe.
    customer_email: data.customer.email,
    line_items: [
      ...data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          quantity: item.quantity,
          price_data: {
            currency: "pln",
            unit_amount: product.priceCents,
            product_data: { name: product.name },
          },
        };
      }),
      {
        quantity: 1,
        price_data: {
          currency: "pln",
          unit_amount: shippingCents,
          product_data: { name: `Dostawa — ${data.deliveryMethod === "INPOST_LOCKER" ? "Paczkomat InPost" : "Kurier InPost"}` },
        },
      },
    ],
    discounts: discountCents > 0
      ? [{ coupon: await ensureStripeCoupon(discountCodeRecord!.id, discountCents) }]
      : undefined,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    success_url: `${origin}/order-success?order=${order.orderNumber}`,
    cancel_url: `${origin}/checkout?cancelled=1`,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      stripeCheckoutSessionId: session.id,
      amountCents: totalCents,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: session.url });
}

/**
 * Stripe Checkout coupons must exist as Stripe objects. We create a one-off,
 * exact-amount coupon per order so the discount shown in Stripe's hosted
 * page always matches what our own discount-code logic computed.
 */
async function ensureStripeCoupon(discountCodeId: string, amountOffCents: number) {
  const coupon = await stripe.coupons.create({
    amount_off: amountOffCents,
    currency: "pln",
    duration: "once",
    name: "Kod rabatowy",
  });
  return coupon.id;
}
