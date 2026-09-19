import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

export default async function DashboardPage() {
  const [salesToday, salesMonth, orderCount, productCount, lowStock, recentOrders] = await Promise.all([
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
