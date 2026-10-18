import type { Metadata } from "next";
import { BRAND, BRAND_SLOGAN } from "@/lib/config/brand";
import { PRODUCT } from "@/lib/config/product";

export const metadata: Metadata = { title: "Ustawienia" };

const ENV_CHECKS = [
  { key: "DATABASE_URL", hint: "Connection string Supabase/PostgreSQL (pooler transakcyjny, port 6543)." },
  { key: "STRIPE_SECRET_KEY", hint: "Stripe Dashboard → Developers → API keys (sekret). Prefiks sk_" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", hint: "Klucz publiczny Stripe (prefiks pk_)." },
  { key: "STRIPE_WEBHOOK_SECRET", hint: "Sekret webhooka Stripe (whsec_…) dla {APP_URL}/api/checkout/webhook." },
  { key: "NEXT_PUBLIC_APP_URL", hint: "Publiczny adres sklepu, np. https://twojadomena.pl" },
  { key: "ADMIN_EMAIL", hint: "E-mail logowania właścicielki do panelu /admin (opcjonalny — bez niego logowanie samym hasłem)." },
  { key: "ADMIN_PASSWORD", hint: "Hasło do panelu /admin." },
  { key: "AUTH_SECRET", hint: "Losowy sekret sesji admina, np.: openssl rand -base64 32" },
  { key: "CONTACT_WEBHOOK_URL", hint: "Opcjonalny endpoint formularza (np. Formspree)." },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Ustawienia</h1>
        <p className="mt-1 text-sm text-warm-500">Stan konfiguracji i dane marki (tylko do odczytu).</p>
      </div>

      <section className="admin-card">
        <h2 className="label mb-4">Zmienne środowiskowe</h2>
        <p className="mb-4 text-xs text-warm-600">
          Wartości sekretów nie są tutaj wyświetlane — widoczna jest wyłącznie obecność zmiennej.
          Edycja: Vercel → Settings → Environment Variables (lub <code className="text-warm-300">.env.local</code>).
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ENV_CHECKS.map(({ key, hint }) => {
            const present = Boolean(process.env[key]);
            return (
              <li key={key} className="rounded-lg border border-white/10 bg-onyx-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-xs text-warm-300">{key}</code>
                  <span
                    className={`admin-badge ${present ? "border-gold/50 text-gold" : "border-danger-400/40 text-danger-400"}`}
                  >
                    {present ? "USTAWIONA" : "BRAK"}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-warm-600">{hint}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="admin-card">
        <h2 className="label mb-4">Dane marki</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Row label="Marka" value={BRAND.name} />
          <Row label="Właściciel" value={BRAND.owner} />
          <Row label="Adres" value={BRAND.fullAddress} />
          <Row label="NIP" value={BRAND.nip} />
          <Row label="E-mail" value={BRAND.email} />
          <Row label="Slogan" value={BRAND_SLOGAN} />
        </dl>
        <p className="mt-5 text-[11px] text-warm-600">
          Dane pochodzą z <code className="text-warm-300">lib/config/brand.ts</code> i nie są edytowalne z poziomu panelu.
        </p>
      </section>

      <section className="admin-card">
        <h2 className="label mb-4">Uzupełnienia produktu</h2>
        <ul className="grid gap-2 text-sm text-warm-300 sm:grid-cols-2">
          <Placeholder filled={PRODUCT.name !== null}>[NAZWA PERFUM]</Placeholder>
          <Placeholder filled={PRODUCT.priceCents !== null}>[CENA]</Placeholder>
          <Placeholder filled={PRODUCT.volume !== null}>[POJEMNOŚĆ]</Placeholder>
          <Placeholder filled={PRODUCT.description !== null}>[OPIS]</Placeholder>
          <Placeholder filled={PRODUCT.scent.story !== null}>[OPIS ZAPACHU]</Placeholder>
          <Placeholder filled={PRODUCT.scent.notes.length > 0}>[NUTY ZAPACHOWE]</Placeholder>
          <Placeholder filled={PRODUCT.images.length > 0}>[ZDJĘCIE PRODUKTU]</Placeholder>
          <Placeholder filled={PRODUCT.availability !== null}>[DOSTĘPNOŚĆ]</Placeholder>
        </ul>
        <p className="mt-5 text-[11px] text-warm-600">
          Edycja: panel <code className="text-warm-300">/admin/products</code> (przy podłączonej bazie)
          albo plik <code className="text-warm-300">lib/config/product.ts</code>.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-warm-600">{label}</dt>
      <dd className="text-warm-300">{value}</dd>
    </div>
  );
}

function Placeholder({ filled, children }: { filled: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`admin-badge ${filled ? "border-gold/50 text-gold" : "text-warm-600"}`}>
        {filled ? "OK" : "BRAK"}
      </span>
      <span className={filled ? "text-warm-300" : "text-warm-600"}>{children}</span>
    </li>
  );
}
