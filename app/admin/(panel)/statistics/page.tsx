import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function StatisticsPage() {
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: "PAID" },
    include: { items: { include: { product: true } } },
  });

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const orderCount = paidOrders.length;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const unitsSold = paidOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const entry = productSales.get(item.productId) ?? { name: item.product.name, qty: 0, revenue: 0 };
      entry.qty += item.quantity;
      entry.revenue += item.unitPriceCents * item.quantity;
      productSales.set(item.productId, entry);
    }
  }
  const topProducts = [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const trafficBreakdown = new Map<string, number>();
  for (const order of paidOrders) {
    const key = order.trafficSource ?? "Nieprzypisane";
    trafficBreakdown.set(key, (trafficBreakdown.get(key) ?? 0) + 1);
  }

  const discountStats = await prisma.discountCode.findMany({
    include: { usages: { include: { order: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Statystyki</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Sprzedaż łącznie", value: `${(totalRevenue / 100).toFixed(2)} zł` },
          { label: "Liczba zamówień", value: orderCount },
          { label: "Średnia wartość zamówienia", value: `${(avgOrderValue / 100).toFixed(2)} zł` },
          { label: "Sprzedane sztuki", value: unitsSold },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className="text-creamdim text-xs mb-2">{s.label}</div>
            <div className="font-display text-2xl text-amber">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="card p-5">
          <h2 className="font-display mb-4">Najlepiej sprzedające się produkty</h2>
          {topProducts.length === 0 && <p className="text-creamdim text-sm">Brak danych sprzedażowych.</p>}
          <div className="space-y-2">
            {topProducts.map((p) => (
              <div key={p.name} className="flex justify-between text-sm">
                <span>{p.name} <span className="text-creamdim">× {p.qty}</span></span>
                <span className="text-amber">{(p.revenue / 100).toFixed(2)} zł</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display mb-4">Źródła ruchu (zamówienia opłacone)</h2>
          <p className="text-xs text-creamdim mb-3">
            Wypełnia się automatycznie po podłączeniu Google Analytics / parametrów UTM — patrz README.
          </p>
          {[...trafficBreakdown.entries()].map(([source, count]) => (
            <div key={source} className="flex justify-between text-sm py-1">
              <span className="capitalize">{source}</span>
              <span className="text-creamdim">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display mb-4">Wykorzystanie kodów rabatowych</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-creamdim border-b border-line">
              <th className="py-2">Kod</th>
              <th className="py-2">Użycia</th>
              <th className="py-2">Wygenerowana sprzedaż</th>
            </tr>
          </thead>
          <tbody>
            {discountStats.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0">
                <td className="py-2 text-amber">{d.code}</td>
                <td className="py-2">{d.usages.length}</td>
                <td className="py-2">{(d.usages.reduce((s, u) => s + u.order.totalCents, 0) / 100).toFixed(2)} zł</td>
              </tr>
            ))}
            {discountStats.length === 0 && (
              <tr><td colSpan={3} className="py-4 text-center text-creamdim">Brak kodów rabatowych.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
