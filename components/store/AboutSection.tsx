import Reveal from "@/components/ui/Reveal";
import { BRAND, BRAND_SLOGAN } from "@/lib/config/brand";

/**
 * Sekcja „O nas" — na wzór masaru.pl: wielki nagłówek po lewej
 * i obszerny akapit opowieści o marce po prawej / poniżej.
 */

const STORY = [
  "ZODARA powstała z prostego przekonania: zapach jest najkrótszą drogą do wspomnienia. Nie opowiadamy o nim jako o dodatku do stylizacji — traktujemy go jak głos, który mówi o Tobie, zanim zdążysz się przedstawić.",
  "Dlatego pracujemy nad jedną kompozycją, a nie nad półką pełną wariantów. Każda butelka to ta sama historia: chłodne światło na początku, ciepło w sercu i drewniany ślad, który zostaje na długo.",
  "Perfumy ZODARA nie są na wielkie wyjście. Są na wtorkowe popołudnie, na spotkanie, na siebie — mają być noszone, nie podziwiane na półce. Nie nosisz ich, żeby komuś zaimponować; nosisz je, bo wiesz, że zostaniesz zapamiętana.",
];

export default function AboutSection() {
  return (
    <section id="o-nas" className="relative z-10 bg-white text-ink">
      <div className="mx-auto w-full max-w-[120rem] px-5 pb-28 md:px-8 md:pb-36">
        <div className="border-t border-line pt-16 md:pt-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20">
            <div>
              <Reveal>
                <h2 className="font-display text-5xl leading-none font-light md:text-7xl">
                  O nas
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="mt-6 font-label text-[10px] uppercase tracking-[0.3em] text-gold">
                  {BRAND.name}
                </p>
              </Reveal>
            </div>

            <div className="max-w-3xl space-y-7">
              {STORY.map((paragraph, index) => (
                <Reveal key={index} delay={0.06 * index}>
                  <p
                    className={`font-display font-light ${
                      index === 0
                        ? "text-2xl leading-snug md:text-3xl"
                        : "text-lg leading-relaxed text-warm-300 md:text-xl"
                    }`}
                  >
                    {paragraph}
                  </p>
                </Reveal>
              ))}

              <Reveal delay={0.24}>
                <p className="pt-2 font-display text-2xl italic text-gold md:text-3xl">
                  „{BRAND_SLOGAN}”
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
