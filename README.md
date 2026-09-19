# Atelier No.7 — sklep internetowy + panel administracyjny

Prawdziwa aplikacja webowa (Next.js 14 App Router + TypeScript + Prisma/PostgreSQL),
nie makieta. Dane sklepu (produkty, zamówienia, magazyn, kody rabatowe, klienci)
żyją w prawdziwej bazie danych. Płatności obsługuje Stripe (BLIK, Przelewy24,
karta, Apple Pay, Google Pay). Dostawa: oficjalny InPost Geowidget (Paczkomat)
i kurier, z warstwą przygotowaną pod ShipX API (etykiety, tracking).

## 1. Struktura projektu

```
app/
  (store)/                 ← publiczny sklep
    page.tsx                 strona główna
    products/page.tsx        lista produktów
    products/[id]/page.tsx   karta produktu
    cart/page.tsx             koszyk
    checkout/page.tsx         checkout (dane, dostawa, Geowidget InPost)
    order-success/page.tsx    potwierdzenie (czyta status z bazy, nic nie zapisuje)
  admin/
    login/page.tsx            logowanie do panelu
    (panel)/                  wszystko poniżej wymaga zalogowania
      dashboard/               statystyki dnia/miesiąca, ostatnie zamówienia
      orders/                  lista + szczegóły zamówienia, zmiana statusu, etykieta InPost
      products/                CRUD produktów
      discounts/               kody rabatowe + statystyki użycia
      statistics/              sprzedaż, top produkty, źródła ruchu
      settings/                status integracji, lista kont admina
  api/
    checkout/route.ts          tworzy zamówienie (NEW/PENDING) + sesję Stripe Checkout
    webhooks/stripe/route.ts   JEDYNE miejsce, które ustawia "Opłacone" i zmniejsza magazyn
    discounts/validate/route.ts walidacja kodu rabatowego w koszyku
    auth/[...nextauth]/route.ts logowanie admina (NextAuth, hasła bcrypt)
lib/
  prisma.ts, auth.ts, stripe.ts, inpost.ts, orders.ts, notifications.ts
  actions/                    server actions panelu (produkty, zamówienia, rabaty)
prisma/schema.prisma          pełny model danych
scripts/create-admin.ts       jedyny sposób utworzenia konta administratora
middleware.ts                 blokuje dostęp do /admin/* bez sesji
```

## 2. Wymagane konta / usługi

| Usługa | Po co | Koszt |
|---|---|---|
| **Supabase** (albo dowolny Postgres) | baza danych | darmowy plan wystarcza na start |
| **Stripe** | płatności BLIK / Przelewy24 / karta / Apple Pay / Google Pay | prowizja od transakcji, bez abonamentu |
| **InPost dla Biznesu (Manager Paczek)** | Geowidget (paczkomaty) + ShipX API (etykiety) | zależnie od umowy z InPost |
| **Vercel** (albo inny hosting Next.js) | wdrożenie produkcyjne | darmowy plan wystarcza na start |
| **Resend** (opcjonalnie) | e-mail z powiadomieniem o nowym zamówieniu | darmowy plan do kilkuset maili/mies. |

## 3. Konfiguracja bazy danych (Supabase)

1. Załóż projekt na supabase.com.
2. Project Settings → Database → Connection string → skopiuj **URI** (tryb "Session" lub "Transaction pooler" — do Prisma Migrate użyj bezpośredniego połączenia, nie poolera na porcie 6543).
3. Wklej jako `DATABASE_URL` w `.env`.
4. Uruchom migrację (patrz punkt 6) — utworzy wszystkie tabele automatycznie z `prisma/schema.prisma`.

Supabase daje też gotowe Row Level Security — na start aplikacja łączy się z bazą wyłącznie przez Prisma po stronie serwera (nigdy z przeglądarki), więc dane klientów i zamówień nie są nigdzie publicznie wystawione.

## 4. Konfiguracja Stripe

1. Załóż konto na stripe.com, włącz **BLIK** i **Przelewy24** w Dashboard → Settings → Payment methods (dostępne dla kont z siedzibą w PL/UE).
2. Developers → API keys → skopiuj `Secret key` → `STRIPE_SECRET_KEY`, `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Developers → Webhooks → Add endpoint → URL: `https://twoja-domena.pl/api/webhooks/stripe`, zdarzenie: `checkout.session.completed` (i opcjonalnie `checkout.session.async_payment_succeeded/failed` — BLIK bywa asynchroniczny).
4. Skopiuj `Signing secret` → `STRIPE_WEBHOOK_SECRET`.
5. Do testów lokalnych: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI).

Apple Pay / Google Pay pojawiają się automatycznie na stronie Stripe Checkout dla zgodnych przeglądarek/urządzeń — nie wymagają osobnej integracji, tylko włączenia domeny w Stripe Dashboard → Settings → Payment methods → Apple Pay (weryfikacja domeny).

## 5. Konfiguracja InPost

**Geowidget (wybór Paczkomatu na checkoucie):**
1. Załóż konto w Manager Paczek (InPost dla Biznesu).
2. Wygeneruj publiczny token do Geowidgetu.
3. Wklej jako `NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN`.

**ShipX API (tworzenie przesyłek i etykiet z panelu zamówień):**
1. W tym samym panelu wygeneruj token API (OAuth token organizacji).
2. Wklej `INPOST_SHIPX_TOKEN` oraz `INPOST_ORGANIZATION_ID`.
3. Zostaw `INPOST_ENV="sandbox"` do testów, zmień na `"production"` przy realnej wysyłce.

Dopóki te zmienne nie są ustawione, `/admin/orders/[id]` pokaże przycisk generowania etykiety, ale próba użycia go zwróci czytelny błąd zamiast udawać sukces — zgodnie z założeniem "żadnej fikcyjnej integracji".

## 6. Instrukcja uruchomienia (lokalnie)

```bash
npm install
cp .env.example .env
# uzupełnij .env wartościami z punktów 3–5

npx prisma migrate dev --name init     # tworzy tabele w bazie
npm run create-admin -- --email=ty@example.com --password="silne-haslo123" --name="Twoje imię"

npm run dev                             # http://localhost:3000
```

Panel administracyjny: **http://localhost:3000/admin** → zaloguj się kontem utworzonym powyżej.

## 7. Utworzenie pierwszego (i kolejnych) kont administratora

Jedyny sposób to skrypt uruchamiany z serwera/lokalnie z dostępem do bazy —
w aplikacji świadomie nie ma formularza rejestracji admina, więc żaden
użytkownik sklepu nie może sam sobie nadać dostępu do panelu:

```bash
npm run create-admin -- --email=agata@example.com --password="MocneHaslo123!" --name="Agata"
```

Uruchomienie z tym samym e-mailem drugi raz nadpisuje hasło (przydatne przy resecie).

## 8. Wdrożenie produkcyjne (skrót)

1. Wypchnij repo na GitHub, zaimportuj w Vercel.
2. Ustaw wszystkie zmienne z `.env.example` w Vercel → Project → Settings → Environment Variables.
3. Zaktualizuj `NEXT_PUBLIC_APP_URL` i `NEXTAUTH_URL` na docelową domenę.
4. Po pierwszym deployu podmień webhook URL w Stripe na produkcyjną domenę.
5. `npx prisma migrate deploy` (albo dodaj to jako Vercel Build Command razem z `next build`).
6. Uruchom `npm run create-admin` wskazując na produkcyjny `DATABASE_URL`.

## 9. Rzeczy celowo NIE udawane, żeby były jasne

- Zamówienie dostaje status **„Opłacone"** wyłącznie w `app/api/webhooks/stripe/route.ts`, po weryfikacji podpisu Stripe — nigdy przy samym powrocie na `/order-success`.
- Magazyn zmniejsza się **tylko** w tym samym miejscu, transakcyjnie razem ze zmianą statusu płatności.
- Panel `/admin` nie wyrenderuje żadnej strony bez ważnej sesji (middleware + drugi check server-side w layoucie).
- Etykiety InPost i statystyki źródeł ruchu (Google/Instagram/reklamy) mają gotową warstwę integracji, ale realnie zadziałają dopiero po wpięciu kluczy API — do tego czasu zwracają jawny komunikat, nie fałszywe dane.
