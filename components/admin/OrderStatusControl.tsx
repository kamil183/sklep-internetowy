"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setOrderStatusAction, type ActionResult } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "NEW",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [selected, setSelected] = useState<OrderStatus>(status as OrderStatus);
  const [state, setState] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setState(null);
        startTransition(async () => {
          setState(await setOrderStatusAction(orderId, selected));
        });
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        value={selected}
        onChange={(event) => setSelected(event.target.value as OrderStatus)}
        className="admin-input w-auto"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
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
