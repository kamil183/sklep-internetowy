"use client";

/**
 * Elegancki drawer koszyka wysuwany z prawej strony.
 * Animacja: Framer Motion (płyne wejście/wyjście + backdrop).
 */

import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/format";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { items, subtotalCents, isOpen, closeCart, setQuantity, removeItem } = useCart();
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Koszyk">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Zamknij koszyk"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-cream text-ink"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-xl tracking-wide">Koszyk</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Zamknij"
                className="text-warm-500 transition hover:text-gold"
              >
                <X size={20} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag size={32} className="text-gold" />
                <p className="text-warm-500">Twój koszyk jest pusty.</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="text-sm uppercase tracking-[0.2em] text-gold underline-offset-4 hover:underline"
                >
                  Wróć do zakupów
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 py-5">
                  {items.map((item) => (
                    <li key={item.productId} className="border-b border-line/60 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-lg leading-tight">{item.name}</p>
                          <p className="mt-1 text-sm text-warm-500">
                            {formatPrice(item.priceCents)}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Usuń ${item.name}`}
                          onClick={() => removeItem(item.productId)}
                          className="text-warm-500 transition hover:text-gold"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            aria-label="Zmniejsz ilość"
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-2 text-warm-500 transition hover:text-gold"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Zwiększ ilość"
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-2 text-warm-500 transition hover:text-gold"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm">
                          {item.priceCents === null
                            ? "[CENA]"
                            : formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-line px-6 py-6">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-warm-500">Razem</span>
                    <span className="font-display text-2xl text-gold">
                      {formatPrice(subtotalCents)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-primary w-full"
                    onClick={() => {
                      closeCart();
                      router.push("/checkout");
                    }}
                  >
                    Przejdź do checkoutu
                  </button>
                  <p className="mt-3 text-center text-xs text-warm-500">
                    Dostawa i płatność — w kolejnym kroku.
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
