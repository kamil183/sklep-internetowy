"use client";

/**
 * Kurtyna przejścia „background → sklep" na wzór masaru.pl.
 *
 * Gdy sekcja sklepu nasuwa się na hero, cztery atramentowe kolumny opadają
 * na ekran (scaleY, origin górny — jak z-300 na masaru.pl), a na środku
 * pojawia się poszarpany napis ZODARA w kolorze piasku. Dalszy scroll unosi
 * kurtynę i odsłania „Garderobę zapachów".
 *
 * Poszarpanie: filtr SVG feTurbulence + feDisplacementMap na tekście.
 * Z JS-em napis jest widoczny od samego startu — strona otwiera się
 * poszarpanym ZODARA. Bez JS-a / przy prefers-reduced-motion kurtyna
 * zostaje niewidoczna (style startowe w SSR: scaleY(0), opacity 0).
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/utils/scroll";

gsap.registerPlugin(ScrollTrigger);

const PANELS = [0, 1, 2, 3] as const;

interface BrandCurtainProps {
  /** Id sekcji, której wejście steruje kurtyną (domyślnie sklep). */
  triggerId?: string;
}

export default function BrandCurtain({ triggerId = "zapachy" }: BrandCurtainProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    const trigger = document.getElementById(triggerId);
    if (!root || !trigger) return;

    const ctx = gsap.context(() => {
      const panels = root.querySelectorAll<HTMLElement>("[data-panel]");
      const mark = root.querySelector<HTMLElement>("[data-mark]");
      if (panels.length === 0 || !mark) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          // Start: górna krawędź sklepu dotyka dołu ekranu (hero zaczyna schodzić).
          start: "top bottom",
          // Koniec: sklep wypełnia ekran — kurtyna całkiem uniesiona.
          end: "top top",
          scrub: 0.5,
        },
      });

      tl.fromTo(
        panels,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.34, stagger: 0.05, ease: "power2.inOut" },
        0,
      )
        .set(mark, { autoAlpha: 1, y: 0 }, 0)
        .to(mark, { autoAlpha: 0, y: -10, duration: 0.16, ease: "power1.in" }, 0.62)
        .to(panels, { scaleY: 0, duration: 0.34, stagger: 0.05, ease: "power2.inOut" }, 0.66);
    }, root);

    return () => ctx.revert();
  }, [triggerId]);

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[300]">
      {/* Nachodzące tło — cztery atramentowe kolumny */}
      <div className="absolute inset-0 grid grid-cols-4">
        {PANELS.map((i) => (
          <div
            key={i}
            data-panel
            className="h-full w-full bg-ink"
            style={{ transform: "scaleY(0)", transformOrigin: "50% 0%" }}
          />
        ))}
      </div>

      {/* Poszarpany napis ZODARA */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div
          data-mark
          className="w-[26rem] max-w-[90vw] text-sand max-md:w-[13rem]"
          style={{ opacity: 0, transform: "translateY(12px)" }}
        >
          <svg viewBox="0 0 1400 260" className="block h-auto w-full" role="img" aria-label="ZODARA">
            <defs>
              <filter
                id="zodara-torn"
                x="-8%"
                y="-25%"
                width="116%"
                height="150%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.013 0.045"
                  numOctaves={3}
                  seed={11}
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={9}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
            <text
              x="700"
              y="195"
              textAnchor="middle"
              fill="currentColor"
              filter="url(#zodara-torn)"
              style={{
                fontFamily: "var(--font-label)",
                fontSize: 150,
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              ZODARA
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
