"use client";

/**
 * Kontekst koszyka.
 *
 * Koszyk przechowywany jest przejściowo w localStorage (wygoda użytkownika —
 * odzyskanie zawartości po odświeżeniu strony). KLUCZOWE dane sklepu
 * (zamówienia, płatności, klienci) trafiają do bazy przez API checkoutu,
 * nigdy nie są „zapisane wyłącznie w localStorage".
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "zodara-cart-v1";

export interface AddToCartInput {
  productId: string;
  name: string;
  priceCents: number | null;
  imageUrl: string | null;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  /** Suma w groszach — `null`, jeśli któregoś produktu nie ma ceny. */
  subtotalCents: number | null;
  isOpen: boolean;
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddToCartInput, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function sumItems(items: CartItem[]): number | null {
  let total = 0;
  for (const item of items) {
    if (item.priceCents === null) return null;
    total += item.priceCents * item.quantity;
  }
  return total;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const loadedRef = useRef(false);

  // Odczyt z localStorage dopiero po stronie klienta (bezpieczne dla SSR).
  // Odkładamy go o klatkę (rAF), żeby effect nie wywoływał setState synchronicznie.
  useEffect(() => {
    if (loadedRef.current) return;
    let cancelled = false;

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      loadedRef.current = true;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartItem[];
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch {
        // uszkodzony zapis — ignorujemy, koszyk startuje pusty
      }
      setHydrated(true);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  // Zapis przy każdej zmianie (dopiero po hydratacji).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // brak miejsca w localStorage — koszyk działa dalej w pamięci
    }
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((item: AddToCartInput, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, 99) }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, 99) } : i,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    return {
      items,
      totalCount,
      subtotalCents: sumItems(items),
      isOpen,
      hydrated,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [items, isOpen, hydrated, openCart, closeCart, addItem, setQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart musi być używany wewnątrz CartProvider");
  return ctx;
}
