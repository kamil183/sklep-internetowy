import BrandCurtain from "@/components/store/BrandCurtain";
import WardrobeSection from "@/components/store/WardrobeSection";
import AboutSection from "@/components/store/AboutSection";
import ContactSection from "@/components/store/ContactSection";

/** Strona główna ZODARA PARFUMS — bez hero:
 *  otwarcie (pełny ekran, atrament) z poszarpanym napisem ZODARA (kurtyna),
 *  a po przewinięciu „Garderoba zapachów" → „O nas" → kontakt.
 *  Kolejna sekcja nasuwa się na otwarcie podczas scrollu (płynne przejście).
 */
export default function HomePage() {
  return (
    <>
      {/* Otwarcie — pełny ekran pod kurtynę (poszarpany ZODARA na wejściu) */}
      <section aria-hidden="true" className="h-screen bg-ink" />
      {/* Kurtyna przejścia otwarcie → sklep (poszarpany ZODARA) */}
      <BrandCurtain />
      <div className="relative z-10">
        <WardrobeSection />
        <AboutSection />
        <ContactSection />
      </div>
    </>
  );
}
