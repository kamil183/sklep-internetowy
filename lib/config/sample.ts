/**
 * =============================================================================
 * PRÓBKA PERFUM — dodatkowy produkt obok flakonu LAVIÉRA
 * =============================================================================
 *
 * Sklep ma dwa produkty: flakon (`lib/config/product.ts`) i próbkę 5 ml.
 * Oba trafiają do tego samego koszyka i checkoutu — obsługę wielu pozycji
 * znajdziesz w `app/api/checkout/route.ts`.
 *
 * ZDJĘCIE: domyślnie placeholder `public/images/probka-perfum-5ml.svg`.
 * Podmień plik (albo wpisz inną ścieżkę w `images` poniżej) na realne zdjęcie.
 *
 * CENA: 5500 groszy = 55,00 zł.
 */

import type { ProductConfig } from "./product";

export const SAMPLE_PRODUCT: ProductConfig = {
  id: "probka-5ml",
  slug: "probka-perfum-5-ml",
  brand: "ZODARA PARFUMS",
  name: "Próbka perfum 5 ml",
  priceCents: 5500,
  volume: "5 ml",
  concentration: "Eau de Parfum",
  description:
    "Pięć mililitrów LAVIÉRY, żeby poznać zapach na własnej skórze, zanim zdecydujesz się na pełny flakon. " +
    "Wystarcza na kilkanaście aplikacji — dość, by kompozycja przeszła całą drogę: od pierwszych nut, przez serce, " +
    "po to, co zostaje wieczorem. Rozlewana ręcznie, w szklanym atomizerze z precyzyjnym dozownikiem.",
  scent: {
    story: null,
    notes: [],
  },
  features: [],
  availability: "Wysyłka w ciągu 1–2 dni roboczych, razem z zamówieniem",
  images: ["/images/probka-perfum-5ml.svg"],
  isActive: true,
};
