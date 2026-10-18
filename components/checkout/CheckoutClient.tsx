"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/store/CartContext";
import { formatPrice } from "@/lib/utils/format";
import {
  checkoutSchema,
  firstZodError,
  type CheckoutInput,
} from "@/lib/validation/schemas";

type ShippingMethodView = { id: string; label: string; priceCents: number | null };

type Props = {
  shippingMethods: ShippingMethodView[];
  stripeEnabled: boolean;
  dbEnabled: boolean;
  product: {
    brand: string;
    name: string | null;
    volume: string | null;
    priceCents: number | null;
  };
};

type CustomerForm = CheckoutInput["customer"];
type DeliveryForm = CheckoutInput["delivery"];

const EMPTY_CUSTOMER: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const EMPTY_DELIVERY: DeliveryForm = {
  method: "INPOST_LOCKER",
  lockerCode: "",
  street: "",
  postCode: "",
  city: "",
};

export default function CheckoutClient({ shippingMethods, stripeEnabled, dbEnabled, product }: Props) {
  const { items, subtotalCents, clearCart } = useCart();
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerForm>(EMPTY_CUSTOMER);
  const [delivery, setDelivery] = useState<DeliveryForm>(EMPTY_DELIVERY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const selectedShipping = useMemo(
    () => shippingMethods.find((method) => method.id === delivery.method) ?? shippingMethods[0],
    [shippingMethods, delivery.method],
  );
  const shippingCents = selectedShipping?.priceCents ?? null;

  const displayName = product.name ?? "[NAZWA PERFUM]";
  const totalCents =
    subtotalCents !== null && shippingCents !== null ? subtotalCents + shippingCents : null;

  function setCustomerField<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  }
  function setDeliveryField<K extends keyof DeliveryForm>(key: K, value: DeliveryForm[K]) {
    setDelivery((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestError(null);
    setErrors({});

    if (items.length === 0) {
      setRequestError("Koszyk jest pusty.");
      return;
    }

    const payload: CheckoutInput = {
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      customer,
      delivery: {
        ...delivery,
        lockerCode: delivery.lockerCode?.trim() ? delivery.lockerCode.trim() : undefined,
      },
    };

    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const path = parsed.error.issues[0]?.path.join(".") ?? "form";
      setErrors({ [path]: firstZodError(parsed.error) });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: { ok?: boolean; url?: string; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok || !data.url) {
        setRequestError(data.error ?? `Błąd ${res.status} — spróbuj ponownie.`);
        return;
      }

      clearCart();
      window.location.href = data.url; // przekierowanie do prawdziwego Stripe Checkout
    } catch {
      setRequestError("Brak połączenia z serwerem. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-40 pb-32 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-gold" aria-hidden />
        <h1 className="mt-6 font-display text-3xl">Twój koszyk jest pusty</h1>
        <p className="mt-3 text-sm text-warm-500">Dodaj produkt, aby przejść do checkoutu.</p>
        <button type="button" onClick={() => router.push("/")} className="btn-primary mt-8">
          WRÓĆ DO STRONY
        </button>
      </main>
    );
  }

  const missing = [
    !stripeEnabled && "STRIPE_SECRET_KEY",
    !dbEnabled && "DATABASE_URL",
  ].filter(Boolean) as string[];

  return (
    <main className="mx-auto max-w-6xl px-6 pt-36 pb-28 md:pt-44">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mb-10 inline-flex items-center gap-2 text-xs tracking-widest text-warm-500 uppercase transition hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" /> Wróć do sklepu
      </button>

      <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>
      <p className="mt-3 text-sm text-warm-500">
        Płatność obsługiwana przez Stripe — numer karty wpisywany jest wyłącznie na stronie Stripe.
      </p>

      {missing.length > 0 && (
        <div className="mt-8 rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-warm-300">
          <p className="mb-1 font-semibold text-warning">Wymagana konfiguracja środowiska:</p>
          <p className="text-warm-500">
            Ustaw <code className="text-warm-300">{missing.join(", ")}</code> w Vercel
            (Settings → Environment Variables) lub w pliku{" "}
            <code className="text-warm-300">.env.local</code>. Dopóki zmiennych brakuje, checkout
            nie uruchomi płatności — bez udawanych transakcji.
          </p>
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          <section>
            <h2 className="label mb-6">Dane klienta</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Imię"
                name="firstName"
                value={customer.firstName}
                onChange={(v) => setCustomerField("firstName", v)}
                error={errors["customer.firstName"]}
              />
              <Field
                label="Nazwisko"
                name="lastName"
                value={customer.lastName}
                onChange={(v) => setCustomerField("lastName", v)}
                error={errors["customer.lastName"]}
              />
              <Field
                label="E-mail"
                name="email"
                type="email"
                value={customer.email}
                onChange={(v) => setCustomerField("email", v)}
                error={errors["customer.email"]}
                className="sm:col-span-2"
              />
              <Field
                label="Telefon"
                name="phone"
                type="tel"
                value={customer.phone}
                onChange={(v) => setCustomerField("phone", v)}
                error={errors["customer.phone"]}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section>
            <h2 className="label mb-6">Adres dostawy</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Ulica i numer"
                name="street"
                value={delivery.street}
                onChange={(v) => setDeliveryField("street", v)}
                error={errors["delivery.street"]}
                className="sm:col-span-2"
              />
              <Field
                label="Kod pocztowy"
                name="postCode"
                placeholder="00-000"
                value={delivery.postCode}
                onChange={(v) => setDeliveryField("postCode", v)}
                error={errors["delivery.postCode"]}
              />
              <Field
                label="Miejscowość"
                name="city"
                value={delivery.city}
                onChange={(v) => setDeliveryField("city", v)}
                error={errors["delivery.city"]}
              />
            </div>
          </section>

          <section>
            <h2 className="label mb-6">Sposób dostawy</h2>
            <div className="space-y-3">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-sm transition ${
                    delivery.method === method.id
                      ? "border-gold/60 bg-gold/5"
                      : "border-warm-800/70 bg-onyx-950/40 hover:border-gold/30"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery-method"
                      className="accent-gold-400"
                      checked={delivery.method === method.id}
                      onChange={() => setDeliveryField("method", method.id as DeliveryForm["method"])}
                    />
                    {method.label}
                  </span>
                  <span className="text-warm-500">
                    {method.priceCents !== null
                      ? method.priceCents > 0
                        ? formatPrice(method.priceCents)
                        : "Gratis"
                      : "[CENA DOSTAWY]"}
                  </span>
                </label>
              ))}
            </div>

            {delivery.method === "INPOST_LOCKER" && (
              <div className="mt-4">
                <Field
                  label="Kod paczkomatu (opcjonalnie)"
                  name="lockerCode"
                  placeholder="np. WAW01M"
                  value={delivery.lockerCode ?? ""}
                  onChange={(v) => setDeliveryField("lockerCode", v)}
                />
              </div>
            )}
            {errors["delivery.method"] && (
              <p className="field-error mt-3">{errors["delivery.method"]}</p>
            )}
          </section>

          {requestError && (
            <div
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200"
              role="alert"
            >
              {requestError}
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? "PRZEKIEROWYWANIE…" : "PRZEJDŹ DO PŁATNOŚCI (STRIPE)"}
          </button>
          <p className="flex items-center justify-center gap-2 text-[11px] text-warm-600">
            <Lock className="h-3.5 w-3.5" /> Płatność obsługiwana przez Stripe
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-gold/15 bg-onyx-950/60 p-6 lg:sticky lg:top-28">
          <h2 className="label mb-6">Twoje zamówienie</h2>
          <div className="space-y-4 border-b border-white/10 pb-5">
            {items.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="text-warm-300">
                    {product.brand} — {displayName}
                  </p>
                  <p className="text-xs text-warm-600">
                    {product.volume ?? "[POJEMNOŚĆ]"} · {item.quantity} szt.
                  </p>
                </div>
                <span className="shrink-0">
                  {item.priceCents !== null ? formatPrice(item.priceCents * item.quantity) : "[CENA]"}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-b border-white/10 py-5 text-sm">
            <div className="flex justify-between text-warm-500">
              <span>Produkty</span>
              <span>{subtotalCents !== null ? formatPrice(subtotalCents) : "[CENA]"}</span>
            </div>
            <div className="flex justify-between text-warm-500">
              <span>Dostawa</span>
              <span>
                {shippingCents !== null
                  ? shippingCents > 0
                    ? formatPrice(shippingCents)
                    : "Gratis"
                  : "[CENA DOSTAWY]"}
              </span>
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-5">
            <span className="label">Razem</span>
            <span className="font-display text-2xl text-gold">
              {totalCents !== null ? formatPrice(totalCents) : "[CENA]"}
            </span>
          </div>
          <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-warm-600">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Status płatności potwierdzany jest przez webhook Stripe, nie przez powrót na stronę.
          </p>
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-[11px] tracking-widest text-warm-500 uppercase">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`input-field ${error ? "border-rose-500/60" : ""}`}
      />
      {error && <p className="field-error mt-1.5">{error}</p>}
    </div>
  );
}
