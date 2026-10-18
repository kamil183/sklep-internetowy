import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { PRODUCT } from "@/lib/config/product";
import {
  displayAvailability,
  displayConcentration,
  displayName,
  displayVolume,
  isPlaceholder,
} from "@/lib/utils/product";
import { formatPrice } from "@/lib/utils/format";

/**
 * Sekcja 3 — Prezentacja flakonu (tekst po prawej, materiał po lewej).
 * Galleryjne zdjęcia produktu (pudełko, flakon) wyświetlają się tutaj po kolei,
 * gdy tylko wpisze się je w `PRODUCT.images`.
 */
export default function BottleSection() {
  const images = PRODUCT.images;
  const concentration = displayConcentration(PRODUCT);

  const rows = [
    { label: "Pojemność", value: displayVolume(PRODUCT) },
    ...(concentration ? [{ label: "Stężenie", value: concentration }] : []),
    { label: "Cena", value: formatPrice(PRODUCT.priceCents) },
    { label: "Dostępność", value: displayAvailability(PRODUCT) },
  ];

  return (
    <section id="flakon" data-bottle className="relative flex min-h-screen items-center py-32">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="ml-auto max-w-xl">
          <Reveal>
            <p className="section-label">Flakon</p>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-display text-4xl font-light md:text-6xl">{displayName(PRODUCT)}</h2>
          </Reveal>

          <Reveal delay={0.18}>
            <dl className="mt-10 divide-y divide-line border-y border-line">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-6 py-4">
                  <dt className="text-[11px] uppercase tracking-[0.3em] text-creamdim">
                    {row.label}
                  </dt>
                  <dd
                    className={`text-right font-display text-xl ${
                      isPlaceholder(row.value) ? "text-creamdim" : "text-gold"
                    }`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.26}>
            {images.length > 0 ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {images.map((src) => (
                  <figure
                    key={src}
                    className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border border-line bg-white"
                  >
                    <Image
                      src={src}
                      alt={`${displayName(PRODUCT)} — zdjęcie produktu`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  </figure>
                ))}
              </div>
            ) : (
              <div className="mt-10 flex aspect-[16/10] items-center justify-center border border-dashed border-line text-[11px] uppercase tracking-[0.35em] text-creamdim">
                [ZDJĘCIE PRODUKTU]
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
