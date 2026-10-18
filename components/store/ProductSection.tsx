"use client";

/**
 * Sekcja 5 — Produkt / zakup.
 * Prawdziwy koszyk: dodawanie, zmiana ilości, przejście do checkoutu.
 * Bez podłączonej ceny przyciski działają (koszyk), a checkout poinformuje
 * o brakującej konfiguracji — nic nie jest udawane.
 */

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { PRODUCT } from "@/lib/config/product";
import {
  displayConcentration,
  displayDescription,
  displayName,
  displayVolume,
  isPlaceholder,
} from "@/lib/utils/product";
import { formatPrice } from "@/lib/utils/format";
import { useCart } from "./CartContext";

export default function ProductSection() {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const image = PRODUCT.images[0];
  const price = formatPrice(PRODUCT.priceCents);
  const priceMissing = PRODUCT.priceCents === null;

  const productPayload = {
    productId: PRODUCT.id,
    name: displayName(PRODUCT),
    priceCents: PRODUCT.priceCents,
    imageUrl: image ?? null,
  };

  const handleAdd = () => {
    addItem(productPayload, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(productPayload, quantity);
    router.push("/checkout");
  };

  return (
    <section id="produkt" data-bottle className="relative flex min-h-screen items-center py-32">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="grid items-start gap-14 lg:grid-cols-2">
          {/* Kolumna treści (lewa) — po prawej stronie prezentuje się flakon 3D */}
          <div>
            <Reveal>
              <p className="section-label">Produkt</p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display text-4xl font-light md:text-6xl">
                {displayName(PRODUCT)}
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p
                className={`mt-6 max-w-lg leading-relaxed ${
                  isPlaceholder(displayDescription(PRODUCT)) ? "text-creamdim" : "text-cream"
                }`}
              >
                {displayDescription(PRODUCT)}
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                <span className={`font-display text-5xl ${priceMissing ? "text-creamdim" : "text-gold"}`}>
                  {price}
                </span>
                <span className="text-sm uppercase tracking-[0.25em] text-creamdim">
                  {[displayVolume(PRODUCT), displayConcentration(PRODUCT)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
              {priceMissing && (
                <p className="mt-3 border border-dashed border-line px-4 py-3 text-xs text-creamdim">
                  Cena nie została jeszcze ustawiona — uzupełnij wartość w{" "}
                  <code className="text-gold">lib/config/product.ts</code> lub w panelu{" "}
                  <code className="text-gold">/admin/products</code>.
                </p>
              )}
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex items-center border border-line">
                  <button
                    type="button"
                    aria-label="Zmniejsz ilość"
                    className="px-4 py-3 text-creamdim transition hover:text-gold"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={15} />
                  </button>
                  <span className="min-w-10 text-center">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Zwiększ ilość"
                    className="px-4 py-3 text-creamdim transition hover:text-gold"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <span className="text-xs uppercase tracking-[0.25em] text-creamdim">
                  Ilość
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.34}>
              <div className="mt-8 flex flex-wrap gap-4">
                <button type="button" className="btn-primary" onClick={handleAdd}>
                  <ShoppingBag size={15} />
                  {added ? "Dodano do koszyka" : "Dodaj do koszyka"}
                </button>
                <button type="button" className="btn-ghost" onClick={handleBuyNow}>
                  Kup teraz
                </button>
              </div>
            </Reveal>

            {image && (
              <Reveal delay={0.4}>
                <div className="relative mt-12 flex aspect-[3/4] max-w-lg items-center justify-center overflow-hidden border border-line bg-white">
                  <Image
                    src={image}
                    alt={displayName(PRODUCT)}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </Reveal>
            )}
          </div>

          {/* Prawa kolumna: miejsce dla flakonu 3D */}
          <div aria-hidden="true" className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
