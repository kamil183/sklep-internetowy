"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartContext";

const NAV_LINKS = [
  { href: "/#historia", label: "Zapach" },
  { href: "/#flakon", label: "Flakon" },
  { href: "/#cechy", label: "Cechy" },
  { href: "/products", label: "Produkty" },
  { href: "/#kontakt", label: "Kontakt" },
] as const;

export default function StoreNav() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="font-display text-lg tracking-[0.4em] text-cream transition hover:text-gold md:text-xl">
          ZODARA
          <span className="ml-2 hidden text-[10px] tracking-[0.3em] text-creamdim sm:inline">PARFUMS</span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Główna">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] uppercase tracking-[0.28em] text-creamdim transition hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/cart" aria-label={`Koszyk (${count})`} className="relative text-cream transition hover:text-gold">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-bg">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="text-cream transition hover:text-gold lg:hidden"
            aria-label={open ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Menu mobilne" className="border-t border-line bg-bg/95 backdrop-blur-lg lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-[0.3em] text-creamdim transition hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
