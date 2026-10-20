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

/** Wysokość fixed headera — sekcja nie może zatrzymać się pod nim. */
const HEADER_OFFSET = 70;

/**
 * Przewiń do elementu (np. sekcji "#kontakt") płynnie lub natywnie.
 *
 * Przyjmuje zarówno sam id ("kontakt"), jak i link z route
 * ("/#kontakt") — w tym drugim przypadku wycinamy fragment po "#".
 */
export function scrollToId(target: string) {
  const id = target.split("#").pop() ?? "";
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) return;

  if (lenis) {
    lenis.scrollTo(el, { offset: -HEADER_OFFSET, duration: 1.1 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
