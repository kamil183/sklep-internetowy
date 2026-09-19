"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function StoreNav() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 bg-gradient-to-b from-bg to-transparent">
      <Link href="/" className="font-display text-lg tracking-wide">
        ATELIER <span className="text-amber">No.7</span>
      </Link>
      <div className="hidden md:flex gap-8 text-sm text-creamdim">
        <Link href="/products" className="hover:text-cream transition-colors">Produkty</Link>
        <Link href="/#o-nas" className="hover:text-cream transition-colors">O nas</Link>
      </div>
      <Link href="/cart" className="text-sm border border-amberdim text-amber px-4 py-2 rounded hover:bg-amber hover:text-bg transition-colors">
        Koszyk {count > 0 && `(${count})`}
      </Link>
    </nav>
  );
}
