import { NextResponse } from "next/server";
import { PRODUCT } from "@/lib/config/product";
import { getShippingMethod } from "@/lib/config/shipping";
import {
  DatabaseNotConfiguredError,
  attachStripeSession,
  createOrder,
  findCustomerOrCreate,
  isDatabaseConfigured,
  resolveCheckoutProduct,
} from "@/lib/db/repository";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { checkoutSchema, firstZodError } from "@/lib/validation/schemas";

/**
 * POST /api/checkout
 *
 * Tworzy zamówienie w bazie i uruchamia prawdziwy Stripe Checkout
 * (przekierowanie na stronę Stripe — numer karty, BLIK itd. wpisywane
 * są TYLKO na Stripe, nigdy u nas). Bez skonfigurowanych kluczy/zmiennej
 * zwraca czytelny komunikat — żadnych udawanych płatności.
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

  // 3. Produkt i cena (jeden produkt sklepu)
  let dbProduct = await resolveCheckoutProduct(input.items[0].productId).catch(() => null);
  // If DB configured but product not found, try to ensure it exists
  if (!dbProduct && isDatabaseConfigured()) {
    try {
      // Try to find by slug again or insert from config
      const { getPool } = await import("@/lib/db/index");
      const res = await getPool().query(
        `insert into products (id, slug, name, price_cents, volume, description, scent_story, notes, stock, is_active)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         on conflict (slug) do update set updated_at = now()
         returning *`,
        [
          PRODUCT.id,
          PRODUCT.slug,
          PRODUCT.name,
          PRODUCT.priceCents,
          PRODUCT.volume,
          PRODUCT.description,
          PRODUCT.scent.story,
          JSON.stringify(PRODUCT.scent.notes || []),
          10,
          PRODUCT.isActive,
        ]
      );
      if (res.rows[0]) {
        dbProduct = {
          id: res.rows[0].id,
          slug: res.rows[0].slug,
          name: res.rows[0].name,
          priceCents: res.rows[0].price_cents,
          volume: res.rows[0].volume,
          description: res.rows[0].description,
          scentStory: res.rows[0].scent_story,
          notes: Array.isArray(res.rows[0].notes) ? res.rows[0].notes : [],
          stock: res.rows[0].stock,
          isActive: res.rows[0].is_active,
          imageUrl: res.rows[0].image_url,
          createdAt: res.rows[0].created_at?.toISOString(),
          updatedAt: res.rows[0].updated_at?.toISOString(),
        } as any;
      }
    } catch (e) {
      console.error("Failed to ensure product exists:", e);
    }
  }

  const knownIds = new Set([PRODUCT.id, dbProduct?.id].filter(Boolean) as string[]);
  if (input.items.some((item) => !knownIds.has(item.productId))) {
    return json("Nieznany produkt w koszyku.", 400);
  }

  const priceCents = dbProduct?.priceCents ?? PRODUCT.priceCents;
  if (priceCents === null || priceCents <= 0) {
    return json(
      "Cena produktu nie jest ustawiona — uzupełnij ją w panelu /admin/products lub w lib/config/product.ts.",
      409,
    );
  }

  if (dbProduct && !dbProduct.isActive) {
    return json("Produkt jest aktualnie niedostępny.", 409);
  }
  const quantity = input.items.reduce((sum, item) => sum + item.quantity, 0);
  if (dbProduct && dbProduct.stock > 0 && quantity > dbProduct.stock) {
    return json(`Dostępna ilość: ${dbProduct.stock} szt.`, 409);
  }

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
      items: [
        {
          productId: dbProduct!.id,
          quantity,
          unitPriceCents: priceCents,
        },
      ],
      subtotalCents: priceCents * quantity,
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

  const productName = dbProduct?.name ?? PRODUCT.name ?? PRODUCT.brand;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customer.email,
      line_items: [
        {
          quantity,
          price_data: {
            currency: "pln",
            unit_amount: priceCents,
            product_data: {
              name: productName,
              description: dbProduct?.volume ?? undefined,
            },
          },
        },
      ],
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
