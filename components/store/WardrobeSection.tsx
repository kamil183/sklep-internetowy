"use client";

/**
 * Sekcja „Garderoba zapachów" — na wzór masaru.pl:
 * wielki nagłówek, pod nim karty produktów ze zdjęciem, nazwą,
 * metadanymi (stężenie · pojemność · ceną), opisem i przyciskiem „Kup teraz".
 */

import Reveal from "@/components/ui/Reveal";
import { PRODUCT } from "@/lib/config/product";
import { SAMPLE_PRODUCT } from "@/lib/config/sample";
import {
  displayConcentration,
  displayDescription,
  displayName,
  displayVolume,
  isPlaceholder,
} from "@/lib/utils/product";
import { formatPrice } from "@/lib/utils/format";
import { useCart } from "./CartContext";

const CARD_IMAGES = [
  { src: "/images/laviera-flakon.jpg", alt: "LAVIÉRA — flakon" },
  { src: "/images/laviera-pudelek.jpg", alt: "LAVIÉRA — opakowanie" },
];

export default function WardrobeSection() {
  const { addItem, openCart } = useCart();

  const name = displayName(PRODUCT);
  const description = displayDescription(PRODUCT);
  const meta = [
    displayConcentration(PRODUCT),
    displayVolume(PRODUCT),
    formatPrice(PRODUCT.priceCents),
  ]
    .filter(Boolean)
    .join(" · ");

  const sampleMeta = [
    displayConcentration(SAMPLE_PRODUCT),
    displayVolume(SAMPLE_PRODUCT),
    formatPrice(SAMPLE_PRODUCT.priceCents),
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSampleBuy = () => {
    addItem(
      {
        productId: SAMPLE_PRODUCT.id,
        name: displayName(SAMPLE_PRODUCT),
        priceCents: SAMPLE_PRODUCT.priceCents,
        imageUrl: SAMPLE_PRODUCT.images[0] ?? null,
      },
      1,
    );
    openCart();
  };

  const handleBuy = () => {
    addItem(
      {
        productId: PRODUCT.id,
        name,
        priceCents: PRODUCT.priceCents,
        imageUrl: CARD_IMAGES[0].src,
      },
      1,
    );
    openCart();
  };

  return (
    <section id="zapachy" className="relative z-10 bg-white text-ink">
      <div className="mx-auto w-full max-w-[120rem] px-5 pt-24 pb-28 md:px-8 md:pt-32 md:pb-36">
        <Reveal>
          <h2 className="font-display text-5xl leading-[0.95] font-light md:text-7xl">
            Garderoba zapachów
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-14 md:mt-16 md:grid-cols-2 md:gap-10">
          <Reveal>
            <article className="group max-w-2xl">
              <div className="relative aspect-[4/5] overflow-hidden bg-shell">
                {/* eslint-disable-next-line @next/next/no-img-element -- proste zdjęcie produktu bez optymalizatora */}
                <img
                  src={CARD_IMAGES[0].src}
                  alt={CARD_IMAGES[0].alt}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="eager"
                />
              </div>

              <div className="mt-7 max-w-xl">
                <h3 className="font-display text-3xl leading-tight md:text-4xl">{name}</h3>
                <p className="mt-3 font-label text-[10px] uppercase tracking-[0.3em] text-warm-500">
                  {meta}
                </p>
                <p
                  className={`mt-4 leading-relaxed ${
                    isPlaceholder(description) ? "text-warm-500" : "text-warm-300"
                  }`}
                >
                  {description}
                </p>
                <button type="button" className="btn-primary mt-7" onClick={handleBuy}>
                  Kup teraz
                </button>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.1}>
            <article className="group max-w-2xl">
              <div className="relative aspect-[4/5] overflow-hidden bg-shell">
                {/* eslint-disable-next-line @next/next/no-img-element -- proste zdjęcie produktu bez optymalizatora */}
                <img
                  src={SAMPLE_PRODUCT.images[0] ?? "/images/probka-perfum-5ml.svg"}
                  alt="Próbka perfum 5 ml"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>

              <div className="mt-7 max-w-xl">
                <h3 className="font-display text-3xl leading-tight md:text-4xl">
                  {displayName(SAMPLE_PRODUCT)}
                </h3>
                <p className="mt-3 font-label text-[10px] uppercase tracking-[0.3em] text-warm-500">
                  {sampleMeta}
                </p>
                <p className="mt-4 leading-relaxed text-warm-300">
                  {displayDescription(SAMPLE_PRODUCT)}
                </p>
                <button
                  type="button"
                  className="btn-primary mt-7"
                  onClick={handleSampleBuy}
                >
                  Dodaj próbkę
                </button>
                <p className="mt-3 text-xs text-warm-500">
                  Zapłacisz razem za jedną przesyłkę.
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
