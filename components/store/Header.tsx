"use client";

/**
 * Nawigacja górna na wzór masaru.pl:
 * przezroczysta na hero (biały tekst), po przewinięciu przechodzi
 * w jasne tło z atramentowym tekstem — transition-colors duration-700.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { scrollToId } from "@/lib/utils/scroll";
import { useCart } from "./CartContext";

const NAV_LINKS = [
  { href: "/#zapachy", label: "Zapachy" },
  { href: "/#o-nas", label: "O nas" },
  { href: "/#kontakt", label: "Kontakt" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Klawisz Escape zamyka menu mobilne
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Kotwice przewijamy płynnie (Lenis) zamiast przeładowywać trasę.
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      scrollToId(href);
    }
    setMenuOpen(false);
  };

  // Na hero (nad ciemnym zdjęciem) tekst jest jasny; po przewinięciu — atramentowy.
  const tone = scrolled || menuOpen ? "text-ink" : "text-cream";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-700 ${
        scrolled || menuOpen
          ? "border-b border-line bg-cream/92 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"
      } ${tone}`}
    >
      <div className="mx-auto flex h-[70px] max-w-[120rem] items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.42em] transition-colors duration-700 md:text-xl"
        >
          ZODARA
          <span className="ml-2 hidden font-label text-[9px] tracking-[0.3em] opacity-70 sm:inline">
            PARFUMS
          </span>
        </Link>

        {/* Nawigacja desktop — jak na masaru.pl: Zapachy / O nas / Kontakt */}
        <nav className="hidden items-center gap-12 md:flex" aria-label="Główna">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="font-label text-[10px] uppercase tracking-[0.3em] transition-colors duration-700 hover:text-gold-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Koszyk (${totalCount})`}
            className="relative transition-colors duration-700 hover:text-gold-400"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-label text-[9px] font-bold text-cream">
                {totalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="transition-colors duration-700 md:hidden"
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobilne */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Menu mobilne"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-cream/97 backdrop-blur-lg md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNav(e, link.href)}
                  className="py-3 font-label text-[11px] uppercase tracking-[0.3em] text-ink transition hover:text-gold-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
