"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/store/CartContext";
import { scrollToId } from "@/lib/utils/scroll";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Start" },
  { id: "historia", label: "Zapach" },
  { id: "flakon", label: "Flakon" },
  { id: "cechy", label: "Cechy" },
  { id: "produkt", label: "Produkt" },
  { id: "cta", label: "Zakupy" },
  { id: "kontakt", label: "Kontakt" },
] as const;

export default function SectionMarker() {
  const [active, setActive] = useState<(typeof SECTIONS)[number]["id"]>("hero");
  const { openCart } = useCart();

  useEffect(() => {
    const onScroll = () => {
      const html = document.documentElement;
      const h = Math.max(
        document.body.scrollHeight,
        html.scrollHeight,
        document.body.offsetHeight,
        html.offsetHeight,
        document.body.clientHeight,
        html.clientHeight
      );
      let current = "hero";
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id.replace(/^#/, ""));
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= h * 0.25) {
          current = sec.id;
        }
      }
      setActive(current as (typeof SECTIONS)[number]["id"]);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed right-6 top-[160px] z-60 flex w-72 flex-col gap-6"
      aria-label="Sekcjonalna nawigacja"
    >
      <div className="flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-[0.35em] text-creamdim">Sekcje</p>
        <ol className="flex flex-col gap-3">
          {SECTIONS.map((sec) => {
            const hit = active === sec.id;
            return (
              <li key={sec.id}>
                <button
                  type="button"
                  onClick={() => scrollToId(`#${sec.id}`)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                    hit
                      ? "bg-gold/15 text-gold"
                      : "text-creamdim hover:bg-white/5 hover:text-cream"
                  }`}
                  aria-current={hit ? "page" : undefined}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <motion.span
                      className="absolute inset-0 rounded-full bg-gold"
                      initial={{ scale: 0 }}
                      animate={{ scale: hit ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="absolute inset-0 rounded-full border-2 border-gold/40" />
                  </span>
                  {sec.label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-2 flex flex-col gap-3 border-t border-line/40 pt-4">
        <p className="text-[10px] uppercase tracking-[0.35em] text-creamdim">Akcja</p>
        <button
          type="button"
          onClick={openCart}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-medium text-ink transition hover:bg-gold/80"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 4h10v3H8v6H5V7H3V4Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="6.5" cy="9.5" r="1.1" fill="currentColor" />
          </svg>
          Otwórz koszyk ({useCart().totalCount})
        </button>
      </div>
    </nav>
  );
}
