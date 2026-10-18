"use client";

/**
 * Płynny scroll (Lenis) w stylu masaru.pl — integracja z GSAP ScrollTrigger:
 * klatki Lenis idą przez gsap.ticker, a ScrollTrigger aktualizuje się
 * przy każdym przesunięciu, więc reveale i kotwice działają płynnie.
 */

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { prefersReducedMotion, setLenis } from "@/lib/utils/scroll";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Po zmianie rozmiaru (np. ładowanie fontów/zdjęć) kolce wyzwalaczy
    // muszą zostać przeliczone, żeby reveale trafiały w swoje sekcje.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 700);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
