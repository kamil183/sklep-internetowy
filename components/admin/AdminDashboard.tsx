import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";

type Stats = {
  ordersTotal: number;
  ordersPaid: number;
  revenueCents: number;
  customersTotal: number;
  productsTotal: number;
  unitsSold: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  last30Days: Array<{ day: string; count: number }>;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  totalCents: number | null;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerName?: string;
};

export default function AdminDashboard({ stats, recentOrders, dbEnabled }: { stats: Stats; recentOrders: OrderRow[]; dbEnabled: boolean }) {
  const cards = [
    { label: "Zamówienia (ogółem)", value: String(stats.ordersTotal) },
    { label: "Opłacone", value: String(stats.ordersPaid) },
    { label: "Przychód", value: formatPrice(stats.revenueCents) },
    { label: "Klienci", value: String(stats.customersTotal) },
    { label: "Produkty", value: String(stats.productsTotal) },
    { label: "Sprzedane sztuki", value: String(stats.unitsSold) },
  ];

  return (
    <div className="space-y-10">
      {!dbEnabled && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-warm-300">
          <p className="mb-1 font-semibold text-warning">Baza danych nie jest podłączona.</p>
          <p className="text-warm-500">
            Ustaw <code className="text-warm-300">DATABASE_URL</code> i uruchom SQL z{" "}
            <code className="text-warm-300">supabase/schema.sql</code>. Statystyki i zamówienia
            pojawią się po podłączeniu bazy — panel nie pokazuje fikcyjnych danych.
          </p>
        </div>
      )}

      <section>
        <h1 className="font-display text-3xl">Pulpit</h1>
        <p className="mt-1 text-sm text-warm-500">Przegląd sklepu ZODARA PARFUMS.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="admin-card">
            <p className="text-[11px] uppercase tracking-widest text-warm-500">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-gold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="admin-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label">Ostatnie zamówienia</h2>
          <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-warm-500 transition hover:text-gold">
            Wszystkie →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-6 text-center text-sm text-warm-500">Brak zamówień.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Numer</th>
                  <th>Klient</th>
                  <th>Wartość</th>
                  <th>Płatność</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} className="admin-link">{o.orderNumber}</Link>
                    </td>
                    <td className="text-warm-300">{o.customerName ?? "—"}</td>
                    <td>{formatPrice(o.totalCents)}</td>
                    <td><span className="admin-badge">{o.paymentStatus}</span></td>
                    <td><span className="admin-badge">{o.status}</span></td>
                    <td className="text-warm-500">{new Date(o.createdAt).toLocaleDateString("pl-PL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
