"use client";

/**
 * Hero na wzór masaru.pl — pełnoekranowe zdjęcie/wideo, wielki napis H1
 * i przycisk „Kup teraz". Sekcja jest przypięta (sticky), a kolejna biała
 * sekcja nasuwa się na nią podczas scrollu — płynne przejście w duchu masaru.
 */

import { scrollToId } from "@/lib/utils/scroll";
import { PRODUCT } from "@/lib/config/product";
import { displayConcentration, displayVolume } from "@/lib/utils/product";

export default function Hero() {
  const meta = [displayConcentration(PRODUCT), displayVolume(PRODUCT)].filter(Boolean).join(" · ");

  return (
    <section id="hero" className="relative -mb-[100vh] h-[200vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Materiał wizualny — atmosferyczne niebo marki */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-sky-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/hero-sky.mp4" type="video/mp4" />
        </video>

        {/* Czytelność tekstu na wideo */}
        <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/35 to-ink/25" />

        {/* Treść hero */}
        <div className="relative flex h-full flex-col justify-end pb-24 md:pb-28">
          <div className="mx-auto w-full max-w-[120rem] px-5 md:px-8">
            <p className="font-label text-[10px] uppercase tracking-[0.35em] text-cream/80">
              {meta}
            </p>

            <h1 className="mt-5 font-display leading-[0.9] tracking-[0.02em] text-cream">
              <span className="block text-[19vw] md:text-[12rem]">LAVIÉRA</span>
            </h1>

            <p className="mt-4 max-w-md font-display text-xl font-light text-cream/85 md:text-2xl">
              Zapach, który zostaje w pamięci.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="btn-primary border-cream bg-cream text-ink hover:bg-transparent hover:text-cream"
                onClick={() => scrollToId("#zapachy")}
              >
                Kup teraz
              </button>
              <button
                type="button"
                className="btn-ghost border-cream/50 text-cream hover:bg-cream hover:text-ink"
                onClick={() => scrollToId("#o-nas")}
              >
                Poznaj markę
              </button>
            </div>
          </div>
        </div>

        {/* Subtelny wskaźnik przewijania */}
        <div className="pointer-events-none absolute bottom-6 right-5 hidden items-center gap-3 font-label text-[9px] uppercase tracking-[0.35em] text-cream/70 md:right-8 md:flex">
          Przewiń
          <span className="animate-bounce text-cream">↓</span>
        </div>
      </div>
    </section>
  );
}
