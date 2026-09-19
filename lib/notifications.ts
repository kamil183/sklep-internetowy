import { prisma } from "@/lib/prisma";

/**
 * Called from the Stripe webhook the moment an order is confirmed PAID.
 * This is intentionally a thin, swappable layer — plug in a real provider
 * without touching webhook logic:
 *
 *  - Email: Resend, Postmark, or SMTP via nodemailer. Add RESEND_API_KEY
 *    (or equivalent) to .env and call it below.
 *  - Push/dashboard badge: write a Notification row and poll it from
 *    /admin/dashboard, or use Supabase Realtime to push it instantly.
 *  - SMS: Twilio, if the owner wants a text for every sale.
 *
 * Until a provider is configured, this logs the event so nothing is silently
 * dropped, and the order is always visible in /admin/orders regardless.
 */
export async function notifyNewPaidOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: { include: { product: true } } },
  });
  if (!order) return;

  const summary = `Nowe opłacone zamówienie ${order.orderNumber} — ${(order.totalCents / 100).toFixed(2)} zł od ${order.customer.firstName} ${order.customer.lastName}`;

  if (process.env.RESEND_API_KEY && process.env.STORE_OWNER_EMAIL) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFICATIONS_FROM_EMAIL ?? "sklep@twoja-domena.pl",
        to: process.env.STORE_OWNER_EMAIL,
        subject: `Nowe zamówienie ${order.orderNumber}`,
        text: summary,
      }),
    }).catch((err) => console.error("Failed to send order notification email:", err));
  } else {
    console.log("[notification]", summary, "— set RESEND_API_KEY + STORE_OWNER_EMAIL in .env to send real emails.");
  }
}
