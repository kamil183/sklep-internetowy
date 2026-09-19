import StoreNav from "@/components/StoreNav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreNav />
      <main>{children}</main>
      <footer className="border-t border-line py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-8 text-sm text-creamdim">
          <div>
            <div className="font-display text-cream text-base mb-2">ATELIER No.7</div>
            <p>Ręcznie lane świece sojowe, produkowane w małych partiach w Polsce.</p>
          </div>
          <div>
            <div className="text-cream mb-2">Kontakt</div>
            <p>kontakt@ateliernumero7.pl</p>
            <p>+48 500 000 000</p>
          </div>
          <div>
            <div className="text-cream mb-2">Informacje</div>
            <p>Regulamin sklepu · Polityka prywatności</p>
            <p>Zwroty i reklamacje w ciągu 14 dni</p>
          </div>
        </div>
        <div className="text-center text-xs text-creamdim/60 mt-10">Made by Webilo</div>
      </footer>
    </>
  );
}
