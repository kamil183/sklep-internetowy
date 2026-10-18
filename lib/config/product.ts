/**
 * =============================================================================
 * KONFIGURACJA PRODUKTU — JEDYNY PRODUKT SKLEPU
 * =============================================================================
 *
 * Teksty pochodzą od marki (LAVIÉRA by Zodara Parfums).
 * Cena jest celowo pusta — podanie wymyślonej kwoty w połączeniu z żywym
 * Stripem skończyłoby się realnym zamówieniem po złej cenie. Ustawia się ją
 * tutaj (`priceCents`, np. 24900 = 249,00 zł) albo w panelu /admin/products.
 *
 * ZDJĘCIA PRODUKTU — jak wstawić:
 *   1. umieść pliki w /public/images/
 *   2. wpisz ich ścieżki w `images` poniżej, np.
 *      images: ["/images/laviera-flakon.jpg", "/images/laviera-pudelek.jpg"],
 *   Pierwsze zdjęcie trafia do sekcji „Produkt" (i do miniatury w koszyku),
 *   a wszystkie po kolei do galerii w sekcji „Flakon".
 *
 * FLAKON 3D: domyślnie model proceduralny odwzorowujący realny kształt flakonu
 * (prostokątny korpus, przezroczyste szkło, jasny płyn, złota zakrętka).
 * Podmiana na własny model GLB: NEXT_PUBLIC_BOTTLE_MODEL_URL=/models/bottle.glb
 */

export interface ProductFeature {
  id: string;
  /** Klucz ikony Lucide (mapowany w sekcji cech). */
  icon: string;
  title: string | null;
  description: string | null;
}

export interface ProductConfig {
  /** Stabilny identyfikator używany w koszyku i checkoutcie. */
  id: string;
  slug: string;
  brand: string;
  /** Nazwa kompozycji. */
  name: string | null;
  /** Cena w groszach — null = brak ceny (sklep wyświetli placeholder). */
  priceCents: number | null;
  /** Pojemność, np. "50 ml". */
  volume: string | null;
  /** Rodzaj stężenia, np. "Eau de Parfum". */
  concentration?: string | null;
  /** Krótki opis produktu (sekcja zakupowa). */
  description: string | null;
  scent: {
    /** Dłuższa opowieść o zapachu (nagłówek sekcji „Historia"). */
    story: string | null;
    /** Krótki akapit o charakterze zapachu (sekcja „Historia", drugi akapit). */
    character?: string | null;
    /** Złoty podpis zamykający sekcję, np. „Twoja skóra. Twój zapach." */
    signature?: string | null;
    /** Nadpis nagłówka chipów — domyślnie „Nuty zapachowe". */
    notesLabel?: string | null;
    /** Chipy pod opowieścią — u LAVIÉRA to charakter, nie nuty. */
    notes: string[];
  };
  /** Cechy produktu (karty w sekcji „Cechy"). */
  features: ProductFeature[];
  /** Dostępność / termin wysyłki. */
  availability: string | null;
  /** Zdjęcia produktu — ścieżki plików w /public. */
  images: string[];
  isActive: boolean;
}

export const PRODUCT: ProductConfig = {
  id: "zodara-1",
  slug: "zodara-parfums",
  brand: "ZODARA PARFUMS",
  name: "LAVIÉRA",
  priceCents: 38999,
  volume: "50 ml",
  concentration: "Eau de Parfum",
  description:
    "LAVIÉRA to kompozycja stworzona dla kobiety, która nie musi wybierać " +
    "między delikatnością a zmysłowością. Otula skórę miękkim, kremowym " +
    "aromatem, w którym subtelność spotyka się z ciepłem, a elegancja nabiera " +
    "bardziej intymnego wymiaru.",
  scent: {
    story:
      "LAVIÉRA nie opowiada o kobiecości w oczywisty sposób. Pozwala ją poczuć.",
    character:
      "To zapach bliskości i przyciągania. Kobiecy, otulający, pełen niuansów. " +
      "Rozwija się na skórze, tworząc aurę, która nie dominuje — lecz sprawia, " +
      "że chce się być bliżej.",
    signature: "Twoja skóra. Twoja obecność. Twój zapach.",
    notesLabel: "Charakter zapachu",
    notes: ["Miękki", "Kremowy", "Zmysłowy"],
  },
  features: [
    {
      id: "feature-1",
      icon: "droplets",
      title: "Miękki, kremowy aromat",
      description:
        "Subtelność spotyka się z ciepłem. Zapach otula skórę i zostaje blisko niej, zamiast ją przytłaczać.",
    },
    {
      id: "feature-2",
      icon: "sparkles",
      title: "Rozwija się na skórze",
      description:
        "Kompozycja odsłania się etapami i buduje aurę, która nie dominuje — i dlatego zostaje w pamięci.",
    },
    {
      id: "feature-3",
      icon: "leaf",
      title: "Zmysłowa elegancja",
      description:
        "Kobiecy, otulający, pełen niuansów. Działa intymniej niż oczywisty gest — nie potrzebuje uwagi, przyciąga ją naturalnie.",
    },
    {
      id: "feature-4",
      icon: "gem",
      title: "Eau de Parfum, 50 ml",
      description:
        "Stężenie eau de parfum i pojemność, którą zawsze warto mieć przy sobie — flakon jak podpis, rozpoznawalny, zanim powiesz swoje imię.",
    },
  ],
  availability: "Gotowa do wysyłki — paczka wychodzi w ciągu 1–2 dni roboczych",
  images: ["/images/laviera-flakon.jpg", "/images/laviera-pudelek.jpg"],
  isActive: true,
};
