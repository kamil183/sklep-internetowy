/**
 * Repozytorium danych sklepu — JEDYNE miejsce mówiące z bazą.
 *
 * Wszystkie funkcje są bezpieczne bez podłączonej bazy:
 * rzucają DatabaseNotConfiguredError, który warstwa wyżej zamienia
 * na czytelny komunikat „podłącz DATABASE_URL" (bez crashy builda).
 *
 * Wymagane tabele: supabase/schema.sql
 */

import { DatabaseNotConfiguredError, getPool, isDatabaseConfigured, withTransaction } from "./index";
import { PRODUCT } from "@/lib/config/product";
import type {
  Customer,
  DbProduct,
  DeliveryMethod,
  Order,
  OrderItem,
  OrderStatus,
} from "@/lib/types";

export { isDatabaseConfigured, DatabaseNotConfiguredError };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(value: unknown): string {
  return value == null ? "" : String(value);
}
function nullableInt(value: unknown): number | null {
  return value == null ? null : Number(value);
}
function int(value: unknown): number {
  return Number(value ?? 0);
}
function date(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(str(value)).toISOString();
}

/* ------------------------------------------------------------------ */
/* Produkty                                                            */
/* ------------------------------------------------------------------ */

interface ProductRow {
  id: string;
  slug: string;
  name: string | null;
  price_cents: number | null;
  volume: string | null;
  description: string | null;
  scent_story: string | null;
  notes: unknown;
  stock: number;
  is_active: boolean;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapProduct(row: ProductRow): DbProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    priceCents: nullableInt(row.price_cents),
    volume: row.volume,
    description: row.description,
    scentStory: row.scent_story,
    notes: Array.isArray(row.notes) ? (row.notes as string[]) : [],
    stock: int(row.stock),
    isActive: Boolean(row.is_active),
    imageUrl: row.image_url,
    createdAt: date(row.created_at),
    updatedAt: date(row.updated_at),
  };
}

export async function listProducts(): Promise<DbProduct[]> {
  const res = await getPool().query<ProductRow>(
    "select * from products order by created_at asc",
  );
  return res.rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<DbProduct | null> {
  const res = await getPool().query<ProductRow>(
    "select * from products where slug = $1 limit 1",
    [slug],
  );
  return res.rows[0] ? mapProduct(res.rows[0]) : null;
}

export interface ProductPatch {
  name?: string | null;
  priceCents?: number | null;
  volume?: string | null;
  description?: string | null;
  scentStory?: string | null;
  notes?: string[];
  stock?: number;
  isActive?: boolean;
  imageUrl?: string | null;
}

export async function updateProduct(id: string, patch: ProductPatch): Promise<DbProduct> {
  const fields: string[] = [];
  // $1 to zawsze id — numeracja pozostałych parametrów startuje od 2.
  const values: unknown[] = [id];
  const push = (column: string, value: unknown) => {
    values.push(value);
    fields.push(`${column} = $${values.length}`);
  };

  if (patch.name !== undefined) push("name", patch.name);
  if (patch.priceCents !== undefined) push("price_cents", patch.priceCents);
  if (patch.volume !== undefined) push("volume", patch.volume);
  if (patch.description !== undefined) push("description", patch.description);
  if (patch.scentStory !== undefined) push("scent_story", patch.scentStory);
  if (patch.notes !== undefined) push("notes", JSON.stringify(patch.notes));
  if (patch.stock !== undefined) push("stock", patch.stock);
  if (patch.isActive !== undefined) push("is_active", patch.isActive);
  if (patch.imageUrl !== undefined) push("image_url", patch.imageUrl);

  if (fields.length === 0) {
    const current = await getPool().query<ProductRow>(
      "select * from products where id = $1",
      [id],
    );
    if (!current.rows[0]) throw new Error("Produkt nie istnieje.");
    return mapProduct(current.rows[0]);
  }

  push("updated_at", new Date());
  const res = await getPool().query<ProductRow>(
    `update products set ${fields.join(", ")} where id = $1 returning *`,
    values,
  );
  if (!res.rows[0]) throw new Error("Produkt nie istnieje.");
  return mapProduct(res.rows[0]);
}

/**
 * Rozpoznanie produktu dla checkoutu (sklep jednoproduktowy):
 * 1. wiersz w bazie po UUID z koszyka, 2. po slugu z konfiguracji,
 * 3. konfiguracja plikowa jako źródło wyświetlania.
 * Wynik: produkt DB (FK poprawne) albo null → użyj konfiguracji.
 */
export async function resolveCheckoutProduct(
  productId: string,
): Promise<DbProduct | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    if (UUID_RE.test(productId)) {
      const byId = await getPool().query<ProductRow>(
        "select * from products where id = $1",
        [productId],
      );
      if (byId.rows[0]) return mapProduct(byId.rows[0]);
    }
    return await getProductBySlug(PRODUCT.slug);
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Klienci                                                             */
/* ------------------------------------------------------------------ */

interface CustomerRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: Date;
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    createdAt: date(row.created_at),
  };
}

export async function findCustomerOrCreate(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<Customer> {
  const res = await getPool().query<CustomerRow>(
    `insert into customers (email, first_name, last_name, phone)
     values ($1, $2, $3, $4)
     on conflict (email) do update
       set first_name = excluded.first_name,
           last_name  = excluded.last_name,
           phone      = excluded.phone
     returning *`,
    [input.email, input.firstName, input.lastName, input.phone],
  );
  return mapCustomer(res.rows[0]);
}

/* ------------------------------------------------------------------ */
/* Zamówienia                                                          */
/* ------------------------------------------------------------------ */

interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal_cents: number | null;
  shipping_cents: number;
  total_cents: number | null;
  delivery_method: string;
  locker_code: string | null;
  shipping_address: unknown;
  status: string;
  payment_status: string;
  stripe_checkout_session_id: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapOrder(row: OrderRow, items: OrderItem[] = [], customer?: Customer): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customer,
    items,
    subtotalCents: nullableInt(row.subtotal_cents),
    shippingCents: int(row.shipping_cents),
    totalCents: nullableInt(row.total_cents),
    deliveryMethod: row.delivery_method as Order["deliveryMethod"],
    lockerCode: row.locker_code,
    shippingAddress:
      row.shipping_address && typeof row.shipping_address === "object"
        ? (row.shipping_address as Order["shippingAddress"])
        : null,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as Order["paymentStatus"],
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    createdAt: date(row.created_at),
    updatedAt: date(row.updated_at),
  };
}

/** Licznik kolejnego numeru zamówienia (prosty, dla jednego sklepu). */
async function nextOrderNumber(client: import("pg").PoolClient): Promise<string> {
  const year = new Date().getFullYear();
  const res = await client.query<{ count: string }>(
    "select count(*)::text as count from orders where created_at >= date_trunc('year', now())",
  );
  const seq = int(res.rows[0]?.count) + 1;
  return `ZD-${year}-${String(seq).padStart(5, "0")}`;
}

export interface CreateOrderInput {
  customerId: string;
  items: Array<{ productId: string; quantity: number; unitPriceCents: number | null }>;
  subtotalCents: number;
  shippingCents: number;
  deliveryMethod: DeliveryMethod;
  lockerCode: string | null;
  shippingAddress: { street: string; postCode: string; city: string };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return withTransaction(async (client) => {
    const orderNumber = await nextOrderNumber(client);
    const totalCents = input.subtotalCents + input.shippingCents;

    const orderRes = await client.query<OrderRow>(
      `insert into orders
         (order_number, customer_id, subtotal_cents, shipping_cents, total_cents,
          delivery_method, locker_code, shipping_address)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning *`,
      [
        orderNumber,
        input.customerId,
        input.subtotalCents,
        input.shippingCents,
        totalCents,
        input.deliveryMethod,
        input.lockerCode,
        JSON.stringify(input.shippingAddress),
      ],
    );
    const orderRow = orderRes.rows[0];

    const items: OrderItem[] = [];
    for (const item of input.items) {
      const itemRes = await client.query<{ id: string }>(
        `insert into order_items (order_id, product_id, quantity, unit_price_cents)
         values ($1,$2,$3,$4) returning id`,
        [orderRow.id, item.productId, item.quantity, item.unitPriceCents],
      );
      items.push({
        id: itemRes.rows[0].id,
        orderId: orderRow.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      });
    }

    return mapOrder(orderRow, items);
  });
}

export async function attachStripeSession(orderId: string, sessionId: string): Promise<void> {
  await getPool().query(
    "update orders set stripe_checkout_session_id = $2, updated_at = now() where id = $1",
    [orderId, sessionId],
  );
}

export async function getOrderBySession(sessionId: string): Promise<Order | null> {
  const res = await getPool().query<OrderRow>(
    "select * from orders where stripe_checkout_session_id = $1 limit 1",
    [sessionId],
  );
  return res.rows[0] ? mapOrder(res.rows[0]) : null;
}

/**
 * Potwierdzenie płatności z webhooka Stripe — to TU status zmienia się
 * na „PAID", nigdy wyłącznie dlatego, że klient wrócił na stronę success.
 */
export async function confirmOrderPayment(
  sessionId: string,
  paymentStatus: "PAID" | "FAILED",
): Promise<Order | null> {
  const res = await getPool().query<OrderRow>(
    `update orders
        set payment_status = $2,
            status = case when $2 = 'PAID' then 'PAID' else status end,
            updated_at = now()
      where stripe_checkout_session_id = $1
      returning *`,
    [sessionId, paymentStatus],
  );
  return res.rows[0] ? mapOrder(res.rows[0]) : null;
}

interface ItemRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number | null;
}

async function loadItems(orderIds: string[]): Promise<Map<string, OrderItem[]>> {
  if (orderIds.length === 0) return new Map();
  const res = await getPool().query<ItemRow>(
    "select * from order_items where order_id = any($1)",
    [orderIds],
  );
  const map = new Map<string, OrderItem[]>();
  for (const row of res.rows) {
    const item: OrderItem = {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: int(row.quantity),
      unitPriceCents: nullableInt(row.unit_price_cents),
    };
    const list = map.get(row.order_id) ?? [];
    list.push(item);
    map.set(row.order_id, list);
  }
  return map;
}

type OrderWithCustomerRow = OrderRow &
  Partial<Record<"c_email" | "c_first_name" | "c_last_name" | "c_phone" | "c_created_at", unknown>>;

export async function listOrders(): Promise<Order[]> {
  const res = await getPool().query<OrderWithCustomerRow>(
    `select o.*,
            c.email as c_email, c.first_name as c_first_name,
            c.last_name as c_last_name, c.phone as c_phone,
            c.created_at as c_created_at
       from orders o
       join customers c on c.id = o.customer_id
      order by o.created_at desc`,
  );
  if (res.rows.length === 0) return [];

  const itemsMap = await loadItems(res.rows.map((r) => r.id));

  return res.rows.map((row) => {
    const customer: Customer | undefined =
      row.c_email != null
        ? {
            id: row.customer_id,
            email: str(row.c_email),
            firstName: str(row.c_first_name),
            lastName: str(row.c_last_name),
            phone: str(row.c_phone),
            createdAt: date(row.c_created_at),
          }
        : undefined;
    return mapOrder(row, itemsMap.get(row.id) ?? [], customer);
  });
}

/** Pojedyncze zamówienie (z klientem i pozycjami) — panel /admin/orders/[id]. */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const res = await getPool().query<OrderWithCustomerRow>(
    `select o.*,
            c.email as c_email, c.first_name as c_first_name,
            c.last_name as c_last_name, c.phone as c_phone,
            c.created_at as c_created_at
       from orders o
       join customers c on c.id = o.customer_id
      where o.id = $1
      limit 1`,
    [orderId],
  );
  const row = res.rows[0];
  if (!row) return null;
  const itemsMap = await loadItems([row.id]);
  const customer: Customer = {
    id: row.customer_id,
    email: str(row.c_email),
    firstName: str(row.c_first_name),
    lastName: str(row.c_last_name),
    phone: str(row.c_phone),
    createdAt: date(row.c_created_at),
  };
  return mapOrder(row, itemsMap.get(row.id) ?? [], customer);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const res = await getPool().query<OrderRow>(
    "update orders set status = $2, updated_at = now() where id = $1 returning *",
    [orderId, status],
  );
  if (!res.rows[0]) throw new Error("Zamówienie nie istnieje.");
  return mapOrder(res.rows[0]);
}

/* ------------------------------------------------------------------ */
/* Statystyki (panel admina)                                           */
/* ------------------------------------------------------------------ */

export interface Statistics {
  ordersTotal: number;
  ordersPaid: number;
  revenueCents: number;
  customersTotal: number;
  productsTotal: number;
  unitsSold: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  last30Days: Array<{ day: string; count: number }>;
}

export async function getStatistics(): Promise<Statistics> {
  const pool = getPool();

  const [totals, statuses, daily] = await Promise.all([
    pool.query<{
      orders_total: string;
      orders_paid: string;
      revenue_cents: string | null;
      customers_total: string;
      products_total: string;
      units_sold: string | null;
    }>(
      `select
         (select count(*) from orders) as orders_total,
         (select count(*) from orders where payment_status = 'PAID') as orders_paid,
         (select coalesce(sum(total_cents), 0) from orders where payment_status = 'PAID') as revenue_cents,
         (select count(*) from customers) as customers_total,
         (select count(*) from products) as products_total,
         (select coalesce(sum(quantity), 0) from order_items) as units_sold`,
    ),
    pool.query<{ status: string; count: string }>(
      "select status, count(*)::text as count from orders group by status order by count desc",
    ),
    pool.query<{ day: Date; count: string }>(
      `select date_trunc('day', created_at) as day, count(*)::text as count
         from orders
        where created_at >= now() - interval '30 days'
        group by 1 order by 1`,
    ),
  ]);

  const t = totals.rows[0];
  return {
    ordersTotal: int(t?.orders_total),
    ordersPaid: int(t?.orders_paid),
    revenueCents: int(t?.revenue_cents),
    customersTotal: int(t?.customers_total),
    productsTotal: int(t?.products_total),
    unitsSold: int(t?.units_sold),
    statusBreakdown: statuses.rows.map((r) => ({
      status: r.status,
      count: int(r.count),
    })),
    last30Days: daily.rows.map((r) => ({
      day: date(r.day).slice(0, 10),
      count: int(r.count),
    })),
  };
}
