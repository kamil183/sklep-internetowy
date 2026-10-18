import Reveal from "@/components/ui/Reveal";
import { BRAND } from "@/lib/config/brand";

/** Sekcja kontaktu — jasna, w stylu reszty strony (masaru.pl). */
export default function ContactSection() {
  return (
    <section id="kontakt" className="relative z-10 bg-cream text-ink">
      <div className="mx-auto w-full max-w-[120rem] px-5 py-24 md:px-8 md:py-32">
        <div className="max-w-2xl">
          <div>
            <Reveal>
              <p className="section-label">Kontakt</p>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="mt-8 font-display text-5xl leading-[0.95] font-light md:text-7xl">
                Porozmawiajmy
                <br />o {BRAND.shortName}
              </h2>
            </Reveal>

            <Reveal delay={0.18}>
              <address className="mt-10 not-italic">
                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-warm-500">
                  Napisz
                </p>
                <p className="mt-3">
                  <a
                    href={`mailto:${BRAND.email}`}
                    className="font-display text-2xl underline decoration-gold decoration-1 underline-offset-6 transition hover:text-gold md:text-3xl"
                  >
                    {BRAND.email}
                  </a>
                </p>

                <p className="mt-8 font-label text-[10px] uppercase tracking-[0.3em] text-warm-500">
                  Adres
                </p>
                <p className="mt-3 text-sm leading-relaxed text-warm-300">
                  {BRAND.owner}
                  <br />
                  {BRAND.street}
                  <br />
                  {BRAND.postalCode} {BRAND.city}
                  <br />
                  NIP: {BRAND.nip}
                </p>
              </address>
            </Reveal>
          </div>


        </div>
      </div>
    </section>
  );
}
