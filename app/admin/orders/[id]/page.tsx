import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/db/repository";
import { dbReady, DB_OFFLINE_NOTICE } from "@/lib/admin/guard";
import { formatPrice, paymentStatusLabel } from "@/lib/utils/format";
import OrderStatusControl from "@/components/admin/OrderStatusControl";
import CashPaymentControl from "@/components/admin/CashPaymentControl";

export const metadata: Metadata = { title: "Zamówienie" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!dbReady()) {
    return (
      <div className="space-y-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-500 hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Zamówienia
        </Link>
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-warm-300">
          <p className="text-warm-500">{DB_OFFLINE_NOTICE}</p>
        </div>
      </div>
    );
  }

  const order = await getOrderById(id);

  if (!order) {
    return (
      <div className="space-y-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-500 hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Zamówienia
        </Link>
        <div className="admin-card text-center text-sm text-warm-500">Nie znaleziono zamówienia.</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-500 hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> Zamówienia
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-warm-500">{new Date(order.createdAt).toLocaleString("pl-PL")}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl text-gold">{formatPrice(order.totalCents)}</p>
          <p className="mt-1">
            <span className="admin-badge">
              {order.paymentMethod === "cod" ? "ZA POBRANIEM" : "STRIPE"} · {paymentStatusLabel(order.paymentStatus)}
            </span>
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="label mb-4">Klient</h2>
          {order.customer ? (
            <dl className="space-y-2 text-sm">
              <div><dt className="text-warm-600">Imię i nazwisko</dt><dd className="text-warm-300">{order.customer.firstName} {order.customer.lastName}</dd></div>
              <div><dt className="text-warm-600">E-mail</dt><dd className="text-warm-300">{order.customer.email}</dd></div>
              <div><dt className="text-warm-600">Telefon</dt><dd className="text-warm-300">{order.customer.phone || "—"}</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-warm-500">Brak danych.</p>
          )}
        </div>

        <div className="admin-card">
          <h2 className="label mb-4">Dostawa</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-warm-600">Sposób</dt><dd className="text-warm-300">{order.deliveryMethod === "INPOST_LOCKER" ? "Paczkomat" : "Kurier"}</dd></div>
            {order.lockerCode && <div><dt className="text-warm-600">Kod paczkomatu</dt><dd className="text-warm-300">{order.lockerCode}</dd></div>}
            {order.shippingAddress && (
              <div>
                <dt className="text-warm-600">Adres</dt>
                <dd className="text-warm-300">
                  {order.shippingAddress.street}, {order.shippingAddress.postCode} {order.shippingAddress.city}
                </dd>
              </div>
            )}
            <div><dt className="text-warm-600">Dostawa</dt><dd className="text-warm-300">{formatPrice(order.shippingCents)}</dd></div>
          </dl>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="label mb-4">Pozycje</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Produkt</th><th>Ilość</th><th>Cena jedn.</th><th>Wartość</th></tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="text-warm-300">Produkt (ID: {item.productId})</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.unitPriceCents)}</td>
                <td>{item.unitPriceCents !== null ? formatPrice(item.unitPriceCents * item.quantity) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-card">
        <h2 className="label mb-4">Status zamówienia</h2>
        <OrderStatusControl orderId={order.id} status={order.status} />
        {order.paymentMethod === "cod" && order.paymentStatus !== "PAID" && (
          <CashPaymentControl orderId={order.id} />
        )}
        {order.stripeCheckoutSessionId && (
          <p className="mt-4 text-[11px] text-warm-600">
            Stripe session: <code className="text-warm-300">{order.stripeCheckoutSessionId}</code>
          </p>
        )}
      </section>
    </div>
  );
}
