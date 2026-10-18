"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { setOrderStatusFormAction, type ActionResult } from "@/app/admin/actions";

const STATUSES = ["NEW", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    setOrderStatusFormAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <select name="status" defaultValue={status} className="admin-input w-auto">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="submit" disabled={pending} className="admin-btn">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {pending ? "ZAPIS…" : "ZMIEŃ STATUS"}
      </button>
      {state && !state.ok && <span className="text-sm text-danger-400">{state.error}</span>}
      {state?.ok && <span className="text-sm text-gold">Zapisano.</span>}
    </form>
  );
}
