"use client";

import { useState, useTransition } from "react";
import { Banknote, Loader2 } from "lucide-react";
import { markCashPaymentReceived, type ActionResult } from "@/app/admin/actions";

/**
 * Potwierdzenie pobrania: klientka płaci kurierowi, Ty klikasz tutaj.
 * Dopiero wtedy zamówienie liczy się do przychodu w statystykach.
 */
export default function CashPaymentControl({ orderId }: { orderId: string }) {
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        setState(null);
        startTransition(async () => {
          setState(await markCashPaymentReceived(orderId));
        });
      }}
    >
      <button type="submit" disabled={pending} className="admin-btn">
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Banknote className="h-4 w-4" aria-hidden />
        )}
        {pending ? "ZAPIS…" : "OTRZYMAŁEM PIENIĄDZE"}
      </button>
      <span className="text-xs text-warm-600">
        Oznacza pobranie jako opłacone i dolicza je do przychodu.
      </span>
      {state && !state.ok && <span className="text-sm text-danger-400">{state.error}</span>}
      {state?.ok && <span className="text-sm text-gold">Płatność potwierdzona.</span>}
    </form>
  );
}
