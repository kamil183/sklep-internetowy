import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getOrderBySession } from "@/lib/db/repository";

export const metadata: Metadata = {
  title: "Zamówienie opłacone",
  robots: { index: false, follow: false },
};

/**
 * Strona sukcesu NIE jest dowodem płatności — status potwierdza webhook Stripe.
 * Wyświetlamy informację o przyjęciu zamówienia; szczegóły w panelu admina.
 */
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await getOrderBySession(sessionId).catch(() => null) : null;

  return (
    <main className="mx-auto max-w-2xl px-6 pt-40 pb-32 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden />
      <h1 className="mt-8 font-display text-4xl md:text-5xl">Dziękujemy za zamówienie</h1>
      <p className="mt-6 text-sm leading-relaxed text-warm-500">
        {order
          ? `Numer zamówienia: ${order.orderNumber}. Status płatności jest potwierdzany przez system Stripe.`
          : "Twoje zamówienie zostało przyjęte. Status płatności jest potwierdzany przez system Stripe."}
      </p>
      <p className="mt-3 text-xs text-warm-600">
        Potwierdzenie zakupu otrzymasz na podany adres e-mail.
      </p>
      <Link href="/" className="btn-primary mt-10">
        WRÓĆ DO SKLEPU
      </Link>
    </main>
  );
}
