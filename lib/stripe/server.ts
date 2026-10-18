import Stripe from "stripe";

/**
 * Klient Stripe (po stronie serwera).
 * Klucze WYŁĄCZNIE ze zmiennych środowiskowych — nigdy w kodzie.
 * Bez klucza zwraca null, a API odpowiada czytelnym komunikatem
 * o brakującej konfiguracji (żadnych udawanych płatności).
 */

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}
