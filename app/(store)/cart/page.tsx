"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalCents } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<{ discountCents: number } | { error: string } | null>(null);
  const [checking, setChecking] = useState(false);

  async function checkDiscount() {
    if (!discountCode.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, subtotalCents }),
      });
      const data = await res.json();
      setDiscountResult(res.ok ? { discountCents: data.discountCents } : { error: data.error });
    } finally {
      setChecking(false);
    }
  }

  const discountCents = discountResult && "discountCents" in discountResult ? discountResult.discountCents : 0;
  const total = Math.max(0, subtotalCents - discountCents);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-40 pb-24 text-center">
        <h1 className="font-display text-2xl mb-4">Twój koszyk jest pusty</h1>
        <Link href="/products" className="btn-primary inline-block">Zobacz produkty</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 pt-32 pb-24">
      <h1 className="font-display text-3xl mb-10">Koszyk</h1>
      <div className="space-y-4 mb-10">
        {items.map((item) => (
          <div key={item.productId} className="card flex items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <div className="font-display">{item.name}</div>
              <div className="text-creamdim text-sm">{(item.priceCents / 100).toFixed(2)} zł / szt.</div>
            </div>
            <div className="flex items-center border border-line rounded">
              <button className="w-9 h-9" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
              <span className="w-9 text-center text-sm">{item.quantity}</span>
              <button className="w-9 h-9" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
            </div>
            <div className="w-20 text-right font-display text-amber">
              {((item.priceCents * item.quantity) / 100).toFixed(2)} zł
            </div>
            <button className="text-creamdim text-sm hover:text-cream" onClick={() => removeItem(item.productId)}>
              Usuń
            </button>
          </div>
        ))}
      </div>

      <div className="card p-6 max-w-md ml-auto">
        <div className="flex gap-2 mb-5">
          <input
            className="input-field"
            placeholder="Kod rabatowy"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <button className="btn-outline whitespace-nowrap" onClick={checkDiscount} disabled={checking}>
            Zastosuj
          </button>
        </div>
        {discountResult && "error" in discountResult && (
          <p className="text-sm text-red-400 mb-4">{discountResult.error}</p>
        )}
        <div className="flex justify-between text-sm text-creamdim py-1">
          <span>Suma produktów</span>
          <span>{(subtotalCents / 100).toFixed(2)} zł</span>
        </div>
        {discountCents > 0 && (
          <div className="flex justify-between text-sm text-amber py-1">
            <span>Rabat</span>
            <span>−{(discountCents / 100).toFixed(2)} zł</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-creamdim py-1">
          <span>Dostawa</span>
          <span>obliczana w checkoucie</span>
        </div>
        <div className="flex justify-between text-lg pt-4 mt-3 border-t border-line">
          <span>Razem</span>
          <span className="font-display text-amber">{(total / 100).toFixed(2)} zł + dostawa</span>
        </div>
        <Link
          href={`/checkout${discountCents > 0 ? `?code=${encodeURIComponent(discountCode)}` : ""}`}
          className="btn-primary w-full text-center block mt-6"
        >
          Przejdź do checkoutu
        </Link>
      </div>
    </div>
  );
}
