"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import InpostGeowidget from "@/components/InpostGeowidget";

const SHIPPING_LABELS: Record<string, { label: string; priceCents: number }> = {
  INPOST_LOCKER: { label: "Paczkomat InPost", priceCents: 1200 },
  INPOST_COURIER: { label: "Kurier InPost", priceCents: 1600 },
};

export default function CheckoutPage() {
  const { items, subtotalCents } = useCart();
  const searchParams = useSearchParams();
  const discountCode = searchParams.get("code") ?? "";

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [deliveryMethod, setDeliveryMethod] = useState<"INPOST_LOCKER" | "INPOST_COURIER">("INPOST_LOCKER");
  const [lockerCode, setLockerCode] = useState<string | null>(null);
  const [address, setAddress] = useState({ street: "", city: "", postCode: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = SHIPPING_LABELS[deliveryMethod];

  async function submit() {
    setError(null);
    if (deliveryMethod === "INPOST_LOCKER" && !lockerCode) {
      setError("Wybierz Paczkomat na mapie.");
      return;
    }
    if (deliveryMethod === "INPOST_COURIER" && (!address.street || !address.city || !address.postCode)) {
      setError("Uzupełnij adres dostawy.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customer: form,
          deliveryMethod,
          inpostLockerCode: lockerCode ?? undefined,
          shippingAddress: deliveryMethod === "INPOST_COURIER" ? address : undefined,
          discountCode: discountCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nie udało się utworzyć zamówienia.");
        setSubmitting(false);
        return;
      }
      // Stripe-hosted Checkout — card details, BLIK code, and P24 bank
      // selection are all entered on Stripe's page, never on ours.
      window.location.href = data.url;
    } catch (err) {
      setError("Błąd połączenia. Spróbuj ponownie.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <div className="max-w-2xl mx-auto px-6 pt-40 pb-24 text-center text-creamdim">Twój koszyk jest pusty.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-32 pb-24 grid md:grid-cols-2 gap-14">
      <div>
        <h1 className="font-display text-2xl mb-8">Dane zamówienia</h1>

        <div className="space-y-4 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="Imię" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input className="input-field" placeholder="Nazwisko" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <input className="input-field" placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input-field" placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <h2 className="font-display text-lg mb-4">Sposób dostawy</h2>
        <div className="space-y-3 mb-6">
          {(["INPOST_LOCKER", "INPOST_COURIER"] as const).map((method) => (
            <label
              key={method}
              className={`flex items-center justify-between border rounded px-4 py-3 cursor-pointer ${deliveryMethod === method ? "border-amber bg-amber/5" : "border-line"}`}
            >
              <span className="flex items-center gap-3">
                <input type="radio" checked={deliveryMethod === method} onChange={() => setDeliveryMethod(method)} />
                {SHIPPING_LABELS[method].label}
              </span>
              <span className="text-creamdim text-sm">{(SHIPPING_LABELS[method].priceCents / 100).toFixed(2)} zł</span>
            </label>
          ))}
        </div>

        {deliveryMethod === "INPOST_LOCKER" ? (
          <div>
            <InpostGeowidget onSelect={setLockerCode} />
            {lockerCode && <p className="text-sm text-amber mt-2">Wybrany Paczkomat: {lockerCode}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <input className="input-field" placeholder="Ulica i numer" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-field" placeholder="Miasto" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <input className="input-field" placeholder="Kod pocztowy" value={address.postCode} onChange={(e) => setAddress({ ...address, postCode: e.target.value })} />
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 h-fit sticky top-28">
        <h2 className="font-display text-lg mb-5">Podsumowanie</h2>
        {items.map((i) => (
          <div key={i.productId} className="flex justify-between text-sm text-creamdim py-1.5">
            <span>{i.name} × {i.quantity}</span>
            <span>{((i.priceCents * i.quantity) / 100).toFixed(2)} zł</span>
          </div>
        ))}
        <div className="flex justify-between text-sm text-creamdim py-1.5">
          <span>Dostawa — {shipping.label}</span>
          <span>{(shipping.priceCents / 100).toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between text-lg pt-4 mt-3 border-t border-line mb-6">
          <span>Razem</span>
          <span className="font-display text-amber">{((subtotalCents + shipping.priceCents) / 100).toFixed(2)} zł</span>
        </div>

        <p className="text-xs text-creamdim mb-4">
          Płatność BLIK, Przelewy24, kartą, Apple Pay lub Google Pay — realizowana na bezpiecznej stronie Stripe.
          Zamówienie otrzyma status „Opłacone” dopiero po potwierdzeniu płatności przez Stripe.
        </p>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button className="btn-primary w-full" onClick={submit} disabled={submitting}>
          {submitting ? "Przekierowanie do płatności…" : "Przejdź do płatności"}
        </button>
      </div>
    </div>
  );
}
