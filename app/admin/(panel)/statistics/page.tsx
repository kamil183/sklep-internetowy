import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { getStatistics } from "@/lib/db/repository";
import { dbReady, DB_OFFLINE_NOTICE } from "@/lib/admin/guard";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Statystyki" };
export const dynamic = "force-dynamic";

export default async function AdminStatisticsPage() {
  if (!dbReady()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl">Statystyki</h1>
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-warm-300">
          <p className="text-warm-500">{DB_OFFLINE_NOTICE}</p>
        </div>
      </div>
    );
  }

  const stats = await getStatistics();
  const maxDaily = Math.max(1, ...stats.last30Days.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Statystyki</h1>
        <p className="mt-1 text-sm text-warm-500">Dane wyłącznie opłaconych zamówień (potwierdzonych webhookiem Stripe).</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Przychód" value={formatPrice(stats.revenueCents)} />
        <Card label="Zamówienia opłacone" value={`${stats.ordersPaid} / ${stats.ordersTotal}`} />
        <Card label="Sprzedane sztuki" value={String(stats.unitsSold)} />
        <Card label="Klienci" value={String(stats.customersTotal)} />
      </section>

      {stats.statusBreakdown.length > 0 && (
        <section className="admin-card">
          <h2 className="label mb-4">Statusy zamówień</h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {stats.statusBreakdown.map((row) => (
              <li key={row.status} className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="admin-badge">{row.status}</span>
                <span className="text-warm-300">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="admin-card">
        <h2 className="label mb-4">Zamówienia z ostatnich 30 dni</h2>
        {stats.last30Days.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BarChart3 className="h-8 w-8 text-warm-600" aria-hidden />
            <p className="text-sm text-warm-500">Brak danych w ostatnich 30 dniach.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {stats.last30Days.map((row) => (
              <li key={row.day} className="flex items-center gap-4 text-sm">
                <span className="w-24 shrink-0 text-warm-500">{row.day}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <span
                    className="block h-full rounded-full bg-gold"
                    style={{ width: `${Math.max(6, (row.count / maxDaily) * 100)}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-warm-300">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-card">
      <p className="text-[11px] uppercase tracking-widest text-warm-500">{label}</p>
      <p className="mt-2 font-display text-3xl text-gold">{value}</p>
    </div>
  );
}
