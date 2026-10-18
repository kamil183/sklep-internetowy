import type Stripe from "stripe";
import { confirmOrderPayment } from "@/lib/db/repository";
import { getStripe } from "@/lib/stripe/server";

/**
 * POST /api/checkout/webhook — Stripe Webhook
 *
 * STATUS PŁATNOŚCI USTALANY jest WYŁĄCZNIE tutaj (sygnatura + event Stripe),
 * nigdy na podstawie powrotu użytkownika na /success.
 *
 * Konfiguracja (Stripe Dashboard → Developers → Webhooks):
 *   URL:        {NEXT_PUBLIC_APP_URL}/api/checkout/webhook
 *   Sekret:     STRIPE_WEBHOOK_SECRET (whsec_...)
 *   Eventy:     checkout.session.completed
 *               checkout.session.async_payment_succeeded
 *               checkout.session.async_payment_failed
 *
 * Lokalny test: stripe listen --forward-to localhost:3000/api/checkout/webhook
 */

const json = (body: unknown, status = 200) =>
  Response.json(body, { status });

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return json(
      {
        ok: false,
        error:
          "Webhook nie jest skonfigurowany (brak STRIPE_SECRET_KEY lub STRIPE_WEBHOOK_SECRET).",
      },
      503,
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return json({ ok: false, error: "Brak sygnatury." }, 400);

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    // Weryfikacja sygnatury — inaczej ktokolwiek mógłby fałszować statusy.
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[webhook] nieprawidłowa sygnatura:", error);
    return json({ ok: false, error: "Nieprawidłowa sygnatura." }, 400);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await confirmOrderPayment(session.id, "PAID");
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await confirmOrderPayment(session.id, "PAID");
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await confirmOrderPayment(session.id, "FAILED");
        break;
      }
      default:
        // Pozostałe eventy ignorujemy (rejestracja w logach wystarczy).
        console.log(`[webhook] pominięty event: ${event.type}`);
    }
  } catch (error) {
    console.error("[webhook] błąd przetwarzania:", error);
    // 500 → Stripe ponowi próbę dostarczenia eventu.
    return json({ ok: false, error: "Błąd przetwarzania." }, 500);
  }

  return json({ received: true });
}
