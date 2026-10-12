import StoreNav from "@/components/StoreNav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreNav />
      <main>{children}</main>

      {/* Stopka pełni też rolę sekcji kontaktowej (#kontakt). Dane kontaktowe pozostają bez zmian. */}
      <footer id="kontakt" className="relative z-10 border-t border-line bg-bg mt-20">
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
                <a href="mailto:kontakt@ateliernumero7.pl" className="transition hover:text-gold">
                  kontakt@ateliernumero7.pl
                </a>
              </li>
              <li>
                <a href="tel:+48500000000" className="transition hover:text-gold">
                  +48 500 000 000
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
