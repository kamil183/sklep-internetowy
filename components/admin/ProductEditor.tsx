"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateProductAction, type ActionResult } from "@/app/admin/(panel)/actions";

type Product = {
  id: string;
  slug: string;
  name: string | null;
  priceCents: number | null;
  volume: string | null;
  description: string | null;
  scentStory: string | null;
  notes: string[];
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
};

export default function ProductEditor({ product }: { product: Product }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProductAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={product.id} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nazwa perfum" name="name" defaultValue={product.name ?? ""} placeholder="[NAZWA PERFUM]" />
        <Field label="Pojemność" name="volume" defaultValue={product.volume ?? ""} placeholder="np. 50 ml" />
        <Field
          label="Cena (PLN)"
          name="price"
          defaultValue={product.priceCents !== null ? (product.priceCents / 100).toFixed(2) : ""}
          placeholder="np. 199.00"
          hint="Pole puste = brak ceny (sklep pokaże [CENA])."
        />
        <Field label="Stan magazynowy" name="stock" defaultValue={String(product.stock)} placeholder="np. 100" />
      </div>

      <Field label="Opis produktu" name="description" defaultValue={product.description ?? ""} textarea placeholder="[OPIS]" />
      <Field label="Opis zapachu" name="scentStory" defaultValue={product.scentStory ?? ""} textarea placeholder="[OPIS ZAPACHU]" />
      <Field
        label="Nuty zapachowe (każda w nowej linii)"
        name="notes"
        defaultValue={product.notes.join("\n")}
        textarea
        placeholder="[NUTY ZAPACHOWE]"
      />

      <label className="flex items-center gap-3 text-sm text-warm-300">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product.isActive}
          className="h-4 w-4 accent-gold-400"
        />
        Produkt aktywny (widoczny w sklepie)
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="admin-btn">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {pending ? "ZAPISYWANIE…" : "ZAPISZ PRODUKT"}
        </button>
        {state && !state.ok && (
          <p className="text-sm text-danger-400" role="alert">{state.error}</p>
        )}
        {state?.ok && <p className="text-sm text-gold">Zapisano.</p>}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  textarea,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <div className={textarea ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="mb-2 block text-[11px] uppercase tracking-widest text-warm-500">
        {label}
      </label>
      {textarea ? (
        <textarea id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} rows={4} className="admin-input" />
      ) : (
        <input id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} className="admin-input" />
      )}
      {hint && <p className="mt-1 text-[11px] text-warm-600">{hint}</p>}
    </div>
  );
}
