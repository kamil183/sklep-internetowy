import StoreNav from "@/components/StoreNav";
import HeroSky from "@/components/HeroSky";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* TŁO NA CAŁĄ STRONĘ — wideo nieba jako warstwa fixed pod całą treścią sklepu. */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <HeroSky />
        {/* Przyciemnienie — tekst i karty czytelne na tle ruchomego nieba. */}
        <div className="absolute inset-0 bg-bg/55" />
      </div>

      <StoreNav />
      <main className="relative z-10">{children}</main>

      {/* Stopka pełni też rolę sekcji kontaktowej (#kontakt). Dane kontaktowe pozostają bez zmian. */}
      <footer id="kontakt" className="relative z-10 mt-20 border-t border-line bg-bg/85 backdrop-blur-lg">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3 md:px-10">
          <div>
            <p className="font-display text-xl tracking-[0.35em] text-cream">ZODARA PARFUMS</p>
            <p className="mt-3 text-sm text-creamdim">
              LAVIÉRA — Eau de Parfum, 50 ml. Zapach, który zostaje w pamięci.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-creamdim">
              Ręcznie komponowane perfumy, produkowane w małych partiach w Polsce.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] uppercase tracking-[0.3em] text-gold">Kontakt</h3>
            <ul className="space-y-2 text-sm text-creamdim">
              <li>
                <a href="mailto:lauraludef11@icloud.com" className="transition hover:text-gold">
                  lauraludef11@icloud.com
                </a>
              </li>
              <li>
                <a href="tel:+48506262674" className="transition hover:text-gold">
                  +48 506 262 674
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] uppercase tracking-[0.3em] text-gold">Informacje</h3>
            <ul className="space-y-2 text-sm text-creamdim">
              <li>Regulamin sklepu · Polityka prywatności</li>
              <li>Zwroty i reklamacje w ciągu 14 dni</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-creamdim md:flex-row md:items-center md:justify-between md:px-10">
            <p>© {new Date().getFullYear()} ZODARA PARFUMS · LAVIÉRA</p>
            <p className="text-creamdim/70">Made by Webilo</p>
          </div>
        </div>
      </footer>
    </>
  );
}
