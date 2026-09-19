"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";

export default function AddToCartForm({
  productId,
  name,
  priceCents,
  imageUrl,
  stock,
}: {
  productId: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (stock <= 0) {
    return (
      <div className="border border-line rounded px-5 py-4 text-creamdim text-sm">
        Produkt obecnie wyprzedany. Wróć wkrótce.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-line rounded">
          <button className="w-10 h-10" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="w-10 text-center">{qty}</span>
          <button className="w-10 h-10" onClick={() => setQty((q) => Math.min(stock, q + 1))}>+</button>
        </div>
        <span className="text-creamdim text-sm">{stock} szt. dostępnych</span>
      </div>
      <button
        className="btn-primary w-full md:w-auto"
        onClick={() => {
          addItem({ productId, name, priceCents, imageUrl, maxStock: stock }, qty);
          setAdded(true);
        }}
      >
        Dodaj do koszyka
      </button>
      {added && (
        <div className="mt-4 text-sm text-amber">
          Dodano do koszyka.{" "}
          <button className="underline" onClick={() => router.push("/cart")}>
            Przejdź do koszyka →
          </button>
        </div>
      )}
    </div>
  );
}
