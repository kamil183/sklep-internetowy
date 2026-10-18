# ZODARA PARFUMS — sklep internetowy

Produkcyjnie przygotowany, jednoproduktowy sklep luksusowej marki perfum
(**ZODARA PARFUMS**, Laura Ludef, Rakoniewice).

- **Stack:** Next.js (App Router, TypeScript), Tailwind CSS v4, React Three Fiber (flakon 3D),
  GSAP ScrollTrigger + Lenis (smooth scroll), Stripe Checkout, PostgreSQL/Supabase.
- **Architektura:** front i API osobno, cała logika danych w `lib/`, konfiguracja w `lib/config/`.
- Bez sekretów w kodzie — wszystkie klucze przez zmienne środowiskowe.

---

## Szybki start (lokalnie)

```bash
npm install
cp .env.example .env.local   # uzupełnij wartości
npm run dev                  # http://localhost:3000
```

Sklep **działa od razu** także bez bazy i Stripe — dane produktu z `lib/config/product.ts`
(placeholdery `[CENA]`, `[NAZWA PERFUM]`…), checkout zwraca czytelny komunikat 503 zamiast
udawać płatność. Aby włączyć prawdziwe zamówienia, uzupełnij sekcje „Podłączenie" poniżej.

---

## Struktura

```
app/
  (site)/            # publiczny sklep (ukryty route group — bez URL w adresie)
    page.tsx         # strona główna: hero, historia, flakon 3D, cechy, zakup, CTA, kontakt
    checkout/        # formularz zamówienia + przekierowanie do Stripe Checkout
    success/         # strona po powrocie ze Stripe (NIE dowód płatności)
    regulamin/ polityka-prywatnosci/ dostawa-i-platnosci/ zwroty/   # placeholdery prawne
  admin/
    login/           # logowanie hasłem (ADMIN_PASSWORD)
    (panel)/         # pulpit, zamówienia (+ [id]), produkty, statystyki, ustawienia
  api/
    checkout/        # POST — utworzenie zamówienia + sesja Stripe Checkout
    checkout/webhook/# Stripe webhook (jedyne źródło statusu płatności)
    contact/         # POST — formularz kontaktowy
components/
  3d/                # PerfumeBottle3D, PlaceholderBottle, BottleScene, scrollStore
  store/             # sekcje strony, koszyk (context + drawer), smooth scroll
  checkout/          # formularz checkoutu
  admin/             # komponenty panelu
lib/
  config/            # brand.ts (dane marki), product.ts (PRODUKT — tu uzupełniasz dane), shipping.ts
  db/                # index.ts (pool, transakcje), repository.ts (cała logika SQL)
  stripe/            # server.ts (instancja Stripe z env)
  auth/              # admin.ts (sesja HMAC panelu)
  validation/        # schemas.ts (Zod — wspólny front/back)
supabase/schema.sql  # kompletne tabele + przykładowy wiersz produktu
```

---

## Podłączenie bazy (Supabase / PostgreSQL)

1. Stwórz projekt w Supabase (lub użyj własnego PostgreSQL).
2. W **SQL Editorze** wklej i uruchom całą treść `supabase/schema.sql`
   (tabele: `customers`, `products`, `orders`, `order_items` + indeksy + przykładowy produkt).
3. Pobierz **connection string poolera transakcyjnego** (port `6543`, parametr
   `pgbouncer=true`) i wpisz do `DATABASE_URL` (local `.env.local` oraz Vercel).
4. Wejdź na `/admin` — zakładka *Produkty* pozwala edytować nazwę, cenę, opisy i stan.

Bez `DATABASE_URL` sklep nadal renderuje się z konfiguracji plikowej, a panel jasno
informuje, że baza nie jest podłączona.

---

## Podłączenie płatności (Stripe)

1. `STRIPE_SECRET_KEY` (sk_…) i `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_…)
   z *Developers → API keys*.
2. *Developers → Webhooks → Add endpoint*:
   - URL: `https://<twoj-domena>/api/checkout/webhook`
   - zdarzenia: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`
   - skopiowany **Signing secret** (whsec_…) → `STRIPE_WEBHOOK_SECRET`.
3. Lokalny test webhooka: `stripe listen --forward-to localhost:3000/api/checkout/webhook`.

**Status płatności zmienia się wyłącznie w webhooku** (weryfikacja sygnatury + `payment_status`).
Powrót użytkownika na `/success` NIE oznacza opłacenia zamówienia.

---

## Panel administracyjny

- Adres: `/admin` (logowanie hasłem z `ADMIN_PASSWORD`; sesja — token HMAC podpisany
  `AUTH_SECRET`, ważny 8 h).
- Widoki: pulpit, **zamówienia** (zmiana statusu logistycznego; status płatności tylko z webhooka),
  **produkty** (nazwa, cena, stan, opisy, nuty, aktywność), **statystyki**, **ustawienia**
  (checklista zmiennych środowiskowych — bez ujawniania wartości).
- Sesja jest bezstanowa (bezpieczna na Vercel/serverless).

---

## Uzupełnienie danych produktu (bez wymyślania)

Wszystkie brakujące dane są oznaczone placeholderami i są **jednym plikiem** do edycji:
`lib/config/product.ts` (albo panel `/admin/products` po podłączeniu bazy).

`[NAZWA PERFUM]`, `[CENA]`, `[POJEMNOŚĆ]`, `[OPIS]`, `[OPIS ZAPACHU]`, `[NUTY ZAPACHOWE]`,
`[CECHY]`, `[ZDJĘCIE PRODUKTU]`, `[DOSTĘPNOŚĆ]`. Ceny i dostawa: `lib/config/shipping.ts`.
Treści prawne: wklej tekst do `app/(site)/<strona>/page.tsx`.

Zdjęcie produktu: wrzuć plik do `public/images/` i wpisz ścieżkę w `images: [...]`
(oraz `image_url` w bazie). Model 3D flakonu: podmień placeholder w
`components/3d/PerfumeBottle3D.tsx` na plik GLB w `public/models/` (dynamiczny import,
obsługa `DRACO`/rozmiaru — komponent jest już napisany pod podmianę).

---

## Wydajność i 3D

- Scena 3D ładuje się **dynamicznie** (`next/dynamic`, `ssr: false`), rendering tylko gdy
  sekcja jest w kadrze, `pixelRatio` ograniczone (1.5 mobile / 2 desktop), `frameloop="demand"`
  poza animacjami.
- `prefers-reduced-motion` wyłącza Lenis i animacje GSAP.
- Sekcje poza viewportem nie renderują ciężkich elementów; obrazy przez `next/image`.

---

## Wdrożenie (GitHub + Vercel)

1. `git add . && git commit -m "ZODARA PARFUMS — start" && git push` (repozytorium GitHub).
2. Vercel → *Add New Project* → import repozytorium (wykrywa Next.js automatycznie).
3. *Settings → Environment Variables* — ustaw wszystkie zmienne z `.env.example`
   (produkcyjne `NEXT_PUBLIC_APP_URL`, klucze Stripe, `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`).
4. Deploy. Po wdrożeniu: zaktualizuj URL webhooka Stripe na produkcyjny.

---

## Bezpieczeństwo

- Żadnych sekretów w repozytorium (`.env*` w `.gitignore`).
- Webhook Stripe zweryfikowany sygnaturą; płatność tylko z webhooka.
- SQL wyłącznie parametryzowany (`pg`), walidacja Zod po stronie serwera niezależnie od UI.
- Panel za tokenem HMAC; porównanie hasła w czasie stałym; cookie `httpOnly`.
- Kontrola orygina żądania przy mutacjach (ten sam origin) + limity na polach formularzy.
