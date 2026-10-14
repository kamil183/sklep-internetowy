import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import AddToCartForm from "@/components/AddToCartForm";
import PerfumeBottle3D from "@/components/3d/PerfumeBottle3D";
import Reveal from "@/components/Reveal";

export const revalidate = 0; // always show current stock/prices from the DB

/* ============================================================
 * TREŚĆ MARKI LAVIÉRA (warstwa wizualna)
 * Produkty, ceny i stany nadal pochodzą z bazy — bez zmian.
 * ============================================================ */
const COPY = {
  slogan: "Zapach, który zostaje w pamięci.",
  story:
    "LAVIÉRA nie opowiada o kobiecości w oczywisty sposób. Pozwala ją poczuć.",
  character:
    "To zapach bliskości i przyciągania. Kobiecy, otulający, pełen niuansów. " +
    "Rozwija się na skórze, tworząc aurę, która nie dominuje — lecz sprawia, " +
    "że chce się być bliżej.",
  signature: "Twoja skóra. Twoja obecność. Twój zapach.",
  chips: ["Miękki", "Kremowy", "Zmysłowy"],
  features: [
    {
      title: "Miękki, kremowy aromat",
      description:
        "Subtelność spotyka się z ciepłem. Zapach otula skórę i zostaje blisko niej, zamiast ją przytłaczać.",
    },
    {
      title: "Rozwija się na skórze",
      description:
        "Kompozycja odsłania się etapami i buduje aurę, która nie dominuje — i dlatego zostaje w pamięci.",
    },
    {
      title: "Zmysłowa elegancja",
      description:
        "Kobiecy, otulający, pełen niuansów. Nie potrzebuje uwagi — przyciąga ją naturalnie.",
    },
    {
      title: "Eau de Parfum, 50 ml",
      description:
        "Stężenie eau de parfum i pojemność, którą zawsze warto mieć przy sobie — flakon jak podpis.",
    },
  ],
} as const;

export default async function HomePage() {
  // Sklep ma jeden produkt — pobieramy go na stałe.
  const [product] = await Promise.all([
    prisma.product.findFirst({
      where: { isActive: true },
      include: { images: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <>
      {/* FLAKON 3D — fixed pod treścią; obraca się i przemieszcza w rytmie
          sekcji oznaczonych data-bottle (scroll story). Bez WebGL strona działa bez 3D. */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <PerfumeBottle3D />
      </div>

      <div className="relative z-10">
      {/* ============================ HERO ============================ */}
      <section data-bottle className="relative flex min-h-screen items-end overflow-hidden pb-24 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/15 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="section-label">Eau de Parfum · 50 ml</p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display leading-[0.88] tracking-[0.04em]">
              <span className="block text-[17vw] md:text-[11rem]">ZODARA</span>
              <span className="block text-[8vw] tracking-[0.45em] text-gold md:text-[3.2rem]">PARFUMS</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md font-display text-2xl font-light text-creamdim md:text-3xl">
              {COPY.slogan}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#produkt" className="btn-primary">
                Zobacz produkt
              </Link>
              <Link href="#historia" className="btn-ghost">
                Poznaj zapach
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= HISTORIA ZAPACHU ======================= */}
      <section id="historia" data-bottle className="relative py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="max-w-xl">
            <Reveal>
              <p className="section-label">Historia zapachu</p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="font-display text-3xl font-light leading-snug md:text-4xl">{COPY.story}</p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10">
                <h3 className="mb-4 text-[11px] uppercase tracking-[0.35em] text-gold">Charakter zapachu</h3>
                <ul className="flex flex-wrap gap-3">
                  {COPY.chips.map((chip) => (
                    <li key={chip} className="border border-line px-4 py-2 text-sm text-cream">
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <p className="mt-10 max-w-md text-sm leading-relaxed text-creamdim">{COPY.character}</p>
            </Reveal>

            <Reveal delay={0.38}>
              <p className="mt-8 font-display text-2xl font-light tracking-[0.12em] text-gold md:text-3xl">
                {COPY.signature}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ FLAKON ============================ */}
      <section id="flakon" data-bottle className="relative py-8 pb-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="section-label">Flakon</p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display text-4xl font-light md:text-6xl">LAVIÉRA</h2>
            </Reveal>

            <Reveal delay={0.18}>
              <dl className="mt-10 divide-y divide-line border-y border-line">
                {[
                  { label: "Pojemność", value: "50 ml" },
                  { label: "Stężenie", value: "Eau de Parfum" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-6 py-4">
                    <dt className="text-[11px] uppercase tracking-[0.3em] text-creamdim">{row.label}</dt>
                    <dd className="text-right font-display text-xl text-gold">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { src: "/images/laviera-flakon.jpg", alt: "LAVIÉRA — flakon" },
                { src: "/images/laviera-pudelek.jpg", alt: "LAVIÉRA — opakowanie" },
              ].map((img) => (
                <figure
                  key={img.src}
                  className="relative flex aspect-[3/4] items-center justify-center overflow-hidden border border-line bg-white"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={1024}
                    height={1536}
                    className="h-full w-full object-contain"
                  />
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ CECHY ============================ */}
      <section id="cechy" data-bottle className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center">
            <Reveal>
              <p className="section-label mx-auto justify-center before:hidden">
                <span className="h-px w-10 bg-gold" />
                Cechy produktu
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-light md:text-5xl">
                To, co wyróżnia LAVIÉRĘ
              </h2>
            </Reveal>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COPY.features.map((feature, index) => (
              <Reveal key={feature.title} delay={0.08 * index}>
                <article className="card group h-full p-7 transition-colors duration-300 hover:border-gold/50">
                  <span className="block h-px w-10 bg-gold transition-all duration-300 group-hover:w-16" />
                  <h3 className="mt-6 font-display text-xl">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-creamdim">{feature.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== PRODUKT (SPRZEDAŻ) ==========================
          Układ jak w poprzedniej wersji: treść po lewej, prawa kolumna
          pozostawiona flakonowi 3D (scroll story). */}
      <section id="produkt" data-bottle className="relative py-8 pb-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="section-label">Produkt</p>
              </Reveal>

              <Reveal delay={0.1}>
                <h2 className="font-display text-4xl font-light md:text-6xl">LAVIÉRA</h2>
                <p className="mt-3 text-[11px] uppercase tracking-[0.35em] text-gold">
                  Eau de Parfum · 50 ml
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="mt-8 max-w-md text-sm leading-relaxed text-creamdim">{COPY.character}</p>
              </Reveal>

              <Reveal delay={0.3}>
                <div className="mt-10">
                  {product ? (
                    <div className="card max-w-md p-8">
                      <div className="flex items-baseline justify-between gap-6">
                        <p className="font-display text-4xl text-gold">
                          {(product.priceCents / 100).toFixed(2)} zł
                        </p>
                        <p className="text-xs text-creamdim">
                          {product.stock > 0
                            ? `${product.stock} szt. dostępnych`
                            : "Wyprzedane"}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-creamdim/70">
                        Eau de Parfum · 50 ml · wysyłka InPost 12–16 zł
                      </p>

                      <div className="mt-8">
                        <AddToCartForm
                          productId={product.id}
                          name={product.name}
                          priceCents={product.priceCents}
                          imageUrl={product.images[0]?.url ?? "/images/laviera-flakon.jpg"}
                          stock={product.stock}
                        />
                      </div>

                      <ul className="mt-8 space-y-2 border-t border-line pt-6 text-xs text-creamdim">
                        <li>• Paczkomat 12 zł · kurier 16 zł — wybór przy kasie</li>
                        <li>• Płatność: karta, BLIK, Przelewy24</li>
                        <li>• Wysyłka w 1–2 dni robocze · zwroty 14 dni</li>
                      </ul>
                    </div>
                  ) : (
                    <p className="font-display text-3xl text-creamdim">Wkrótce w sprzedaży</p>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.38}>
                <figure className="relative mt-12 flex aspect-[3/4] w-72 items-center justify-center overflow-hidden border border-line bg-white">
                  <Image
                    src="/images/laviera-flakon.jpg"
                    alt="LAVIÉRA — flakon Eau de Parfum 50 ml"
                    width={1024}
                    height={1536}
                    className="h-full w-full object-contain"
                  />
                </figure>
              </Reveal>
            </div>
            {/* Prawa kolumna: miejsce na flakon 3D (scroll story) */}
          </div>
        </div>
      </section>

      {/* ================== PRODUKT (SKLEP JEDNOPRODUKTOWY) ==================
          Sklep sprzedaje jeden produkt, więc zamiast siatki „wyróżnionych
          produktów" pokazujemy pojedynczy kafelek z odnośnikiem do strony. */}
      <section data-bottle className="mx-auto max-w-7xl px-6 md:px-10 py-20">
        <div className="mb-10">
          <p className="section-label">Sklep</p>
          <h2 className="font-display text-2xl md:text-3xl">Jeden zapach. Jeden flakon.</h2>
        </div>

        {product ? (
          <Link
            href={`/products/${product.slug}`}
            className="card group grid items-center gap-8 p-6 md:grid-cols-[minmax(0,320px)_1fr] md:p-10"
          >
            <figure className="relative aspect-[3/4] overflow-hidden border border-line bg-white">
              <Image
                src={product.images[0]?.url ?? "/images/laviera-flakon.jpg"}
                alt={product.name}
                width={1024}
                height={1536}
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </figure>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
                Eau de Parfum · 50 ml
              </p>
              <h3 className="mt-3 font-display text-4xl font-light md:text-5xl">
                {product.name}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-creamdim">
                {COPY.character}
              </p>
              <p className="mt-6 font-display text-3xl text-gold">
                {(product.priceCents / 100).toFixed(2)} zł
              </p>
              <span className="btn-primary mt-8 inline-block">Zobacz produkt</span>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-creamdim">
            Produkt właśnie powstaje — wróć niedługo albo napisz do nas przez kontakt w stopce.
          </p>
        )}
      </section>

      {/* ============================== CTA ============================== */}
      <section data-bottle className="mx-auto max-w-7xl px-6 md:px-10 py-24 text-center border-t border-line">
        <Reveal>
          <p className="section-label mx-auto justify-center before:hidden">
            <span className="h-px w-10 bg-gold" />
            LAVIÉRA
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-light leading-tight md:text-6xl">
            Gotowa na zapach, który zostaje w pamięci?
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="#produkt" className="btn-primary">
              Kup LAVIÉRĘ
            </Link>
            <Link href="/cart" className="btn-ghost">
              Przejdź do koszyka
            </Link>
          </div>
        </Reveal>
      </section>
      </div>
    </>
  );
}
