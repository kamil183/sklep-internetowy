import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { listOrders } from "@/lib/db/repository";
import { dbReady, DB_OFFLINE_NOTICE } from "@/lib/admin/guard";
import { formatPrice, paymentStatusLabel } from "@/lib/utils/format";
import OrderStatusControl from "@/components/admin/OrderStatusControl";

export const metadata: Metadata = { title: "Zamówienia" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!dbReady()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl">Zamówienia</h1>
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-warm-300">
          <p className="mb-1 font-semibold text-warning">Brak bazy danych.</p>
          <p className="text-warm-500">{DB_OFFLINE_NOTICE}</p>
          <p className="mt-2 text-warm-500">
            Płatności online potwierdza webhook Stripe; pobranie oznaczasz ręcznie w szczegółach zamówienia.
          </p>
        </div>
      </div>
    );
  }

  const orders = await listOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Zamówienia</h1>
        <p className="mt-1 text-sm text-warm-500">
          Płatności online potwierdza webhook Stripe; pobranie oznaczasz ręcznie w szczegółach zamówienia.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="admin-card flex flex-col items-center gap-3 py-12 text-center">
          <Package className="h-8 w-8 text-warm-600" aria-hidden />
          <p className="text-sm text-warm-500">Brak zamówień w bazie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <section key={order.id} className="admin-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link href={`/admin/orders/${order.id}`} className="admin-link font-display text-xl text-gold">
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-sm text-warm-300">
                    {order.customer
                      ? `${order.customer.firstName} ${order.customer.lastName} · ${order.customer.email}`
                      : "—"}
                  </p>
                  <p className="mt-1 text-xs text-warm-500">
                    {new Date(order.createdAt).toLocaleString("pl-PL")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-gold">{formatPrice(order.totalCents)}</p>
                  <p className="mt-1">
                    <span className="admin-badge">
                      {order.paymentMethod === "cod" ? "ZA POBRANIEM" : "STRIPE"} · PŁATNOŚĆ:{" "}
                      {paymentStatusLabel(order.paymentStatus)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-5 border-t border-white/10 pt-5">
                <OrderStatusControl orderId={order.id} status={order.status} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
