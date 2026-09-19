import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Fails loudly at boot rather than silently faking payments later.
  console.warn(
    "STRIPE_SECRET_KEY is not set. Payments will not work until it is configured in .env"
  );
}

// This client only ever runs on the server (API routes / server actions).
// STRIPE_SECRET_KEY must never be exposed with a NEXT_PUBLIC_ prefix.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

// The only Stripe value allowed on the client is the publishable key.
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
