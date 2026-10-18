"use client";

import { useRouter } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import { scrollToId } from "@/lib/utils/scroll";
import { BRAND_SLOGAN } from "@/lib/config/brand";
import { useCart } from "./CartContext";

/** Sekcja 6 — duże CTA. */
export default function CTASection() {
  const router = useRouter();
  const { items, openCart } = useCart();

  const handleCta = () => {
    if (items.length > 0) {
      openCart();
    } else {
      scrollToId("#produkt");
    }
  };

  return (
    <section id="cta" data-bottle className="relative flex min-h-screen items-center py-32">
      <div className="mx-auto w-full max-w-7xl px-6 text-center md:px-10">
        <Reveal>
          <p className="section-label mx-auto justify-center before:hidden">
            <span className="h-px w-10 bg-gold" />
            ZODARA PARFUMS
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <h2 className="mx-auto max-w-4xl font-display text-5xl font-light leading-tight md:text-7xl">
            {BRAND_SLOGAN}
          </h2>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <button type="button" className="btn-primary" onClick={handleCta}>
              Kup teraz
            </button>
            <button type="button" className="btn-ghost" onClick={() => router.push("/checkout")}>
              Przejdź do checkoutu
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
