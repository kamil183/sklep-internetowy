"use client";

/**
 * Subtelne wejście elementu przy przewinięciu (GSAP ScrollTrigger).
 * Bez JS-a / przy prefers-reduced-motion element jest widoczny normalnie.
 */

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/utils/scroll";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Opóźnienie w sekundach. */
  delay?: number;
  /** Z przesunięcia w pionie. */
  y?: number;
  as?: "div" | "section" | "span" | "li";
}

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });

    return () => ctx.revert();
  }, [delay, y]);

  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}
