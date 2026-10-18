import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { BRAND, BRAND_SLOGAN } from "@/lib/config/brand";
import { PRODUCT } from "@/lib/config/product";

export const metadata: Metadata = {
  title: "O nas",
  description: `Kim jest ${BRAND.name} — marka perfum tworzona z myślą o kobiecie, która zna siebie.`,
};

const VALUES = [
  {
    title: "Rzemiosło",
    text: "Kompozycja powstaje nuta po nucie, a nie z gotowego katalogu. Zanim zapach trafi do flakonu, przechodzi przez dziesiątki prób na skórze.",
  },
  {
    title: "Uwaga",
    text: "Niewiele sztuk, dużo uważności. Każdy flakon przechodzi przez ręce jednej osoby — od pierwszego psiknięcia kontrolnego po zapakowanie paczki.",
  },
  {
    title: "Codzienność",
    text: "Perfumy nie są na wielkie wyjście. Są na wtorkowe popołudnie, na spotkanie, na siebie — dlatego ZODARA ma być noszona, nie podziwiana na półce.",
  },
] as const;

const CRAFT = [
  { step: "01", title: "Pomysł", text: "Zaczyna się od wspomnienia: chłodne światło różowego nieba, które z czasem robi się ciepłe." },
  { step: "02", title: "Kompozycja", text: "Nuty górne, serce i baza są budowane tak, by zapach zmieniał się w ciągu dnia, a nie znikał po godzinie." },
  { step: "03", title: "Próby", text: "Każda wersja testowana jest na skórze — w ruchu, w cieple, po kilku godzinach. Liczy się to, co zostaje." },
  { step: "04", title: "Flakon", text: "Ostatnim krokiem jest forma: ciężkie szkło, złoty pierścień i zakrętka, którą chce się zdjąć powoli." },
] as const;

/** Strona „O nas" — opowieść o marce. */
export default function AboutPage() {
  return (
    <main className="relative">
      <section className="mx-auto max-w-7xl px-6 pt-40 pb-24 md:px-10">
        <Reveal>
          <p className="section-label">O nas</p>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="font-display text-5xl font-light leading-[0.95] md:text-8xl">
            {BRAND.shortName}
            <span className="mt-2 block font-label text-sm tracking-[0.4em] text-gold md:text-lg">
              PARFUMS
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-10 max-w-2xl font-display text-2xl font-light leading-snug text-ink md:text-3xl">
            {BRAND_SLOGAN}
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <p className="text-sm leading-relaxed text-warm-300">
              ZODARA powstała z prostego przekonania: zapach jest najkrótszą drogą do
              wspomnienia. Nie chcemy opowiadać o nim jako o dodatku do stylizacji —
              traktujemy go jak głos, który mówi o Tobie, zanim zdążysz się przedstawić.
            </p>
            <p className="text-sm leading-relaxed text-warm-300">
              Dlatego pracujemy nad jedną kompozycją, a nie nad półką pełną wariantów.
              Każda butelka to ta sama historia: chłodne światło na początku, ciepło
              w sercu i drewniany ślad, który zostaje na długo.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={0.08 * i}>
              <article className="card h-full p-7">
                <h2 className="font-display text-2xl text-ink">{value.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-warm-500">{value.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <Reveal>
          <p className="section-label">Jak powstaje zapach</p>
        </Reveal>

        <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2">
          {CRAFT.map((item, i) => (
            <Reveal key={item.step} delay={0.06 * i}>                <article className="h-full bg-ink p-8">
                  <p className="font-display text-3xl text-gold-300">{item.step}</p>
                  <h3 className="mt-4 font-display text-xl text-cream">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/75">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10">
        <Reveal>
          <p className="mx-auto max-w-3xl font-display text-3xl font-light leading-snug text-ink md:text-5xl">
            „{PRODUCT.scent.story ?? BRAND_SLOGAN}”
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/#produkt" className="btn-primary">
              Poznaj {PRODUCT.name ?? "zapach"}
            </Link>
            <Link href="/#kontakt" className="btn-ghost">
              Napisz do nas
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
