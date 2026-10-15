import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { quickUpdateProduct } from "@/lib/actions/products";

export const revalidate = 0;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const [salesToday, salesMonth, orderCount, productCount, lowStock, recentOrders, products] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfToday() } },
      _sum: { totalCents: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: startOfMonth() } },
      _sum: { totalCents: true },
    }),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({ where: { isActive: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 5 }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { customer: true },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { position: "asc" } } },
    }),
  ]);

  const stats = [
    { label: "Sprzedaż dzisiaj", value: `${((salesToday._sum.totalCents ?? 0) / 100).toFixed(2)} zł` },
    { label: "Sprzedaż w tym miesiącu", value: `${((salesMonth._sum.totalCents ?? 0) / 100).toFixed(2)} zł` },
    { label: "Zamówienia opłacone", value: orderCount },
    { label: "Aktywne produkty", value: productCount },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-creamdim text-xs mb-2">{s.label}</div>
            <div className="font-display text-2xl text-amber">{s.value}</div>
          </div>
        ))}
      </div>

      {searchParams.saved && (
        <div className="mb-6 rounded border border-amberdim/50 bg-amber/10 px-4 py-3 text-sm text-amber">
          Zapisano zmiany — cena, zdjęcie i stan są już aktualne w sklepie.
        </div>
      )}
      {searchParams.error && (
        <div className="mb-6 rounded border border-red-900 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {searchParams.error}
        </div>
      )}

      <section className="mb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 className="font-display text-xl">Szybka edycja — cena, zdjęcie, stan</h2>
          <Link href="/admin/products" className="text-xs text-creamdim hover:text-amber">
            Pełna edycja produktów →
          </Link>
        </div>

        {products.length === 0 && (
          <p className="text-creamdim text-sm">Brak produktów w bazie.</p>
        )}

        <div className="space-y-6">
          {products.map((p) => (
            <form key={p.id} action={quickUpdateProduct} className="card p-5">
              <input type="hidden" name="productId" value={p.id} />

              <div className="flex flex-wrap items-center gap-4 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0]?.url ?? "/images/laviera-flakon.jpg"}
                  alt=""
                  className="h-16 w-16 rounded object-cover bg-bg2"
                />
                <div>
                  <p className="font-display text-lg">{p.name}</p>
                  <p className="text-xs text-creamdim">
                    {p.images.length} {p.images.length === 1 ? "zdjęcie" : "zdjęć w galerii"} ·{" "}
                    <Link href={`/admin/products/${p.id}/edit`} className="hover:text-amber">
                      edycja pełna →
                    </Link>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor={`price-${p.id}`} className="text-xs text-creamdim block mb-1">
                    Cena (zł)
                  </label>
                  <input
                    id={`price-${p.id}`}
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(p.priceCents / 100).toFixed(2)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`stock-${p.id}`} className="text-xs text-creamdim block mb-1">
                    Stan magazynowy (szt.)
                  </label>
                  <input
                    id={`stock-${p.id}`}
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={p.stock}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`image-${p.id}`} className="text-xs text-creamdim block mb-1">
                    Zdjęcie główne (URL)
                  </label>
                  <input
                    id={`image-${p.id}`}
                    name="image"
                    defaultValue={p.images[0]?.url ?? ""}
                    placeholder="/images/laviera-flakon.jpg"
                    className="input-field"
                  />
                  <p className="mt-1 text-[11px] text-creamdim">
                    Puste = bez zmian. Podmienia pierwsze zdjęcie w galerii.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <button type="submit" className="btn-primary">
                  Zapisz zmiany
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-display mb-4">Produkty z niskim stanem</h2>
          {lowStock.length === 0 && <p className="text-creamdim text-sm">Wszystko w normie.</p>}
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <Link href={`/admin/products/${p.id}/edit`} className="hover:text-amber">{p.name}</Link>
                <span className="text-amber">{p.stock} szt.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display mb-4">Ostatnie zamówienia</h2>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex justify-between text-sm hover:text-amber">
                <span>{o.orderNumber} — {o.customer.firstName} {o.customer.lastName}</span>
                <span>{(o.totalCents / 100).toFixed(2)} zł</span>
              </Link>
            ))}
            {recentOrders.length === 0 && <p className="text-creamdim text-sm">Brak zamówień.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
