/**
 * Globalny, płynny scroll (Lenis) — modułowy singleton,
 * żeby nawigacja (linki, CTA) mogła prosić o przewijanie
 * bez przekazywania referencji przez komponenty.
 */

import type Lenis from "lenis";


type LenisInstance = Pick<Lenis, "scrollTo" | "destroy" | "raf" | "on">;

let lenis: LenisInstance | null = null;

export function setLenis(instance: LenisInstance | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Przewiń do elementu (np. sekcji "#kontakt") płynnie lub natywnie. */
export function scrollToId(id: string) {
  const el = document.getElementById(id.replace(/^#/, ""));
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el);
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
