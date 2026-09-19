import { prisma } from "@/lib/prisma";
import { createDiscountCode, toggleDiscountActive, deleteDiscountCode } from "@/lib/actions/discounts";

export const revalidate = 0;

export default async function DiscountsPage() {
  const codes = await prisma.discountCode.findMany({
    include: {
      usages: { include: { order: true } },
      _count: { select: { usages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Kody rabatowe</h1>

      <div className="card p-6 mb-10 max-w-2xl">
        <h2 className="font-display text-lg mb-4">Nowy kod</h2>
        <form action={createDiscountCode} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-creamdim block mb-1">Kod</label>
            <input name="code" className="input-field" placeholder="np. AGATA10" required />
          </div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Typ</label>
            <select name="type" className="input-field">
              <option value="PERCENT">Procent</option>
              <option value="FIXED_AMOUNT">Kwota (zł)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Wartość</label>
            <input name="value" type="number" step="0.01" className="input-field" placeholder="np. 10" required />
          </div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Limit użyć (opcjonalnie)</label>
            <input name="maxUses" type="number" className="input-field" />
          </div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Minimalna wartość zamówienia (zł, opcjonalnie)</label>
            <input name="minOrder" type="number" step="0.01" className="input-field" />
          </div>
          <div></div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Data rozpoczęcia (opcjonalnie)</label>
            <input name="startsAt" type="date" className="input-field" />
          </div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Data zakończenia (opcjonalnie)</label>
            <input name="endsAt" type="date" className="input-field" />
          </div>
          <button className="btn-primary sm:col-span-2">Utwórz kod</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-creamdim border-b border-line">
              <th className="p-4">Kod</th>
              <th className="p-4">Rabat</th>
              <th className="p-4">Użyto</th>
              <th className="p-4">Wygenerowana sprzedaż</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => {
              const salesValue = c.usages.reduce((sum, u) => sum + u.order.totalCents, 0);
              return (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="p-4 font-display text-amber">{c.code}</td>
                  <td className="p-4">{c.type === "PERCENT" ? `${c.value}%` : `${(c.value / 100).toFixed(2)} zł`}</td>
                  <td className="p-4">{c._count.usages}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="p-4">{(salesValue / 100).toFixed(2)} zł</td>
                  <td className="p-4">
                    <form action={toggleDiscountActive.bind(null, c.id, !c.isActive)}>
                      <button className={`text-xs border rounded px-2 py-1 ${c.isActive ? "text-amber border-amberdim" : "text-creamdim border-line"}`}>
                        {c.isActive ? "Aktywny" : "Wyłączony"}
                      </button>
                    </form>
                  </td>
                  <td className="p-4 text-right">
                    <form action={deleteDiscountCode.bind(null, c.id)}>
                      <button className="text-xs text-red-400 hover:underline">Usuń</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-creamdim">Brak kodów rabatowych.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
