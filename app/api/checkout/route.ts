import { NextResponse } from "next/server";
import { PRODUCT } from "@/lib/config/product";
import { SAMPLE_PRODUCT } from "@/lib/config/sample";
import { getShippingMethod } from "@/lib/config/shipping";
import {
  DatabaseNotConfiguredError,
  attachStripeSession,
  createOrder,
  ensureProductRow,
  findCustomerOrCreate,
  isDatabaseConfigured,
} from "@/lib/db/repository";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { checkoutSchema, firstZodError } from "@/lib/validation/schemas";
import type { DbProduct } from "@/lib/types";

/**
 * POST /api/checkout
 *
 * Tworzy zamówienie w bazie i uruchamia prawdziwy Stripe Checkout
 * (przekierowanie na stronę Stripe — numer karty, BLIK itd. wpisywane
 * są TYLKO na Stripe, nigdy u nas). Bez skonfigurowanych kluczy/zmiennej
 * zwraca czytelny komunikat — żadnych udawanych płatności.
 *
 * Sklep sprzedaje dwie pozycje: flakon LAVIÉRA i próbkę 5 ml. Każda pozycja
 * koszyka jest osobnym wierszem `order_items` i osobną linią w Stripe.
 */

const json = (error: string, status: number) =>
  NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  // 1. Walidacja danych z formularza (Zod — serwer waliduje niezależnie od UI)
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json("Nieprawidłowe dane żądania.", 400);
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) return json(firstZodError(parsed.error), 400);
  const input = parsed.data;

  // 2. Konfiguracja środowiska
  if (!isDatabaseConfigured()) {
    return json(
      "Brak bazy danych: ustaw DATABASE_URL i uruchom SQL z supabase/schema.sql — zamówienia nie zostaną zapisane.",
      503,
    );
  }
  if ((input.payment?.method ?? "stripe") !== "cod" && !isStripeConfigured()) {
    return json(
      "Płatności nie są jeszcze skonfigurowane: ustaw STRIPE_SECRET_KEY (Stripe Dashboard → Developers → API keys).",
      503,
    );
  }

  // 3. Pozycje koszyka → produkty (katalog: flakon + próbka)
  const CATALOG = [
    { config: PRODUCT, stock: 10 },
    { config: SAMPLE_PRODUCT, stock: 50 },
  ];

  interface OrderLine {
    productId: string;
    name: string;
    volume: string | null;
    quantity: number;
    unitPriceCents: number;
  }

  const lines: OrderLine[] = [];
  // Suma sztuk per produkt — stan magazynowy sprawdzamy na końcu, jednym zapytaniem.
  const perProduct = new Map<
    string,
    { quantity: number; stock: number; label: string }
  >();

  for (const item of input.items) {
    const entry = CATALOG.find(
      (candidate) => candidate.config.id === item.productId,
    );
    if (!entry) return json("Nieznany produkt w koszyku.", 400);
    const { config } = entry;
    const label = config.name ?? config.brand;

    let dbRow: DbProduct;
    try {
      // `order_items.product_id` ma klucz obcy do `products(id)` — wiersz musi istnieć.
      dbRow = await ensureProductRow({
        slug: config.slug,
        name: config.name,
        priceCents: config.priceCents,
        volume: config.volume,
        description: config.description,
        scentStory: config.scent.story,
        notes: config.scent.notes,
        stock: entry.stock,
        isActive: config.isActive,
      });
    } catch (error) {
      if (error instanceof DatabaseNotConfiguredError) {
        return json(error.message, 503);
      }
      console.error("[checkout] nie udało się pobrać produktu:", error);
      return json(
        "Nie udało się zweryfikować produktu. Spróbuj ponownie.",
        500,
      );
    }

    const unitPriceCents = dbRow.priceCents ?? config.priceCents;
    if (unitPriceCents === null || unitPriceCents <= 0) {
      return json(
        `Cena produktu „${label}” nie jest ustawiona — uzupełnij ją w panelu /admin/products.`,
        409,
      );
    }
    if (!dbRow.isActive) {
      return json(`Produkt „${label}” jest aktualnie niedostępny.`, 409);
    }

    lines.push({
      productId: dbRow.id,
      name: dbRow.name ?? label,
      volume: dbRow.volume ?? config.volume,
      quantity: item.quantity,
      unitPriceCents,
    });

    const stats = perProduct.get(dbRow.id) ?? {
      quantity: 0,
      stock: dbRow.stock,
      label,
    };
    stats.quantity += item.quantity;
    perProduct.set(dbRow.id, stats);
  }

  for (const stats of perProduct.values()) {
    if (stats.stock > 0 && stats.quantity > stats.stock) {
      return json(
        `Dostępna ilość „${stats.label}”: ${stats.stock} szt.`,
        409,
      );
    }
  }

  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  // 4. Dostawa
  const shipping = getShippingMethod(input.delivery.method);
  if (!shipping) return json("Nieznany sposób dostawy.", 400);
  if (shipping.priceCents === null || shipping.priceCents < 0) {
    return json(
      "Cena dostawy nie jest ustawiona — uzupełnij lib/config/shipping.ts ([CENA DOSTAWY]).",
      409,
    );
  }
  // Pobranie = gotówka przekazana kurierowi; paczkomat tego nie obsługuje.
  if ((input.payment?.method ?? "stripe") === "cod" && !shipping.codAvailable) {
    return json(
      "Za pobraniem jest dostępne tylko przy dostawie kurierem. Wybierz kuriera albo płatność online.",
      400,
    );
  }

  // 5. Zapis zamówienia w bazie
  let orderId: string;
  let orderNumber: string;
  try {
    const customer = await findCustomerOrCreate(input.customer);
    const paymentMethod = input.payment?.method ?? "stripe";
    const order = await createOrder({
      customerId: customer.id,
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
      })),
      subtotalCents,
      shippingCents: shipping.priceCents,
      deliveryMethod: input.delivery.method,
      lockerCode: input.delivery.lockerCode || null,
      shippingAddress: {
        street: input.delivery.street,
        postCode: input.delivery.postCode,
        city: input.delivery.city,
      },
      paymentMethod,
    });
    orderId = order.id;
    orderNumber = order.orderNumber;
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) return json(error.message, 503);
    console.error("[checkout] błąd zapisu zamówienia:", error);
    return json("Nie udało się zapisać zamówienia. Spróbuj ponownie.", 500);
  }

  // 6. Obsługa płatności
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const paymentMethod = input.payment?.method ?? "stripe";

  if (paymentMethod === "cod") {
    // Płatność przy odbiorze — bez sesji Stripe. Zamówienie jest już zapisane
    // z payment_method = 'cod' i payment_status = 'ON_DELIVERY'.
    return NextResponse.json({ ok: true, url: `${appUrl}/success?order_id=${orderId}&cod=1` });
  }

  // Płatność online przez Stripe
  const stripe = getStripe();
  if (!stripe) return json("Stripe nie jest skonfigurowany.", 503);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customer.email,
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "pln",
          unit_amount: line.unitPriceCents,
          product_data: {
            name: line.name,
            description: line.volume ?? undefined,
          },
        },
      })),
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: shipping.label,
            type: "fixed_amount",
            fixed_amount: { amount: shipping.priceCents, currency: "pln" },
          },
        },
      ],
      allowed_payment_method_types: ["card", "blik", "p24"],
      metadata: { orderId, orderNumber },
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?canceled=1`,
    });

    if (!session.url) return json("Stripe nie zwrócił adresu płatności.", 502);

    await attachStripeSession(orderId, session.id);
    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error("[checkout] błąd Stripe:", error);
    const message =
      error instanceof Error && error.message
        ? `Stripe: ${error.message}`
        : "Nie udało się uruchomić płatności.";
    return json(process.env.NODE_ENV === "development" ? message : "Nie udało się uruchomić płatności.", 502);
  }
}
