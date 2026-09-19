import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

const STATUS_OPTIONS = ["NEW", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const orders = await prisma.order.findMany({
    where: {
      ...(searchParams.status ? { status: searchParams.status as any } : {}),
      ...(searchParams.q
        ? {
            OR: [
              { orderNumber: { contains: searchParams.q, mode: "insensitive" } },
              { customer: { email: { contains: searchParams.q, mode: "insensitive" } } },
              { customer: { lastName: { contains: searchParams.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Zamówienia</h1>

      <form className="flex flex-wrap gap-3 mb-6">
        <input className="input-field max-w-xs" name="q" placeholder="Szukaj: nr zamówienia, e-mail, nazwisko" defaultValue={searchParams.q} />
        <select className="input-field max-w-[200px]" name="status" defaultValue={searchParams.status ?? ""}>
          <option value="">Wszystkie statusy</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-outline">Filtruj</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-creamdim border-b border-line">
              <th className="p-4">Nr zamówienia</th>
              <th className="p-4">Data</th>
              <th className="p-4">Klient</th>
              <th className="p-4">Kwota</th>
              <th className="p-4">Płatność</th>
              <th className="p-4">Status</th>
              <th className="p-4">Dostawa</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0 hover:bg-bg2">
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}`} className="text-amber hover:underline">{o.orderNumber}</Link>
                </td>
                <td className="p-4 text-creamdim">{o.createdAt.toLocaleDateString("pl-PL")}</td>
                <td className="p-4">{o.customer.firstName} {o.customer.lastName}</td>
                <td className="p-4">{(o.totalCents / 100).toFixed(2)} zł</td>
                <td className="p-4"><PaymentBadge status={o.paymentStatus} /></td>
                <td className="p-4"><StatusBadge status={o.status} /></td>
                <td className="p-4 text-creamdim">{o.deliveryMethod === "INPOST_LOCKER" ? "Paczkomat" : "Kurier"}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-creamdim">Brak zamówień spełniających kryteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NEW: "text-creamdim border-line",
    PAID: "text-amber border-amberdim",
    PROCESSING: "text-amber border-amberdim",
    SHIPPED: "text-cream border-line",
    DELIVERED: "text-green-400 border-green-800",
    CANCELLED: "text-red-400 border-red-900",
  };
  return <span className={`text-xs border rounded px-2 py-1 ${colors[status] ?? ""}`}>{status}</span>;
}

function PaymentBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs rounded px-2 py-1 border ${status === "PAID" ? "text-amber border-amberdim" : "text-creamdim border-line"}`}>
      {status}
    </span>
  );
}
