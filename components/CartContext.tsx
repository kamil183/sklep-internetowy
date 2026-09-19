"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
  maxStock: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

// NOTE: this only holds the *in-progress selection* for a shopper's session —
// it is never treated as the source of truth. At checkout, the server
// re-fetches each product's real price and stock from the database and
// rejects the request if anything is out of sync (see app/api/checkout/route.ts).
// Orders, stock, and payment status always live in Postgres, never here.
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("atelier_cart");
    if (stored) setItems(JSON.parse(stored));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("atelier_cart", JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(existing.maxStock, existing.quantity + quantity);
        return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, quantity: Math.min(item.maxStock, quantity) }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(i.maxStock, quantity)) } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, subtotalCents }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
