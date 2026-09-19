import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus, generateShippingLabel } from "@/lib/actions/orders";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

const STATUS_OPTIONS = ["NEW", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { customer: true, items: { include: { product: true } }, payment: true, shipment: true, discountCode: true },
  });
  if (!order) notFound();

  async function changeStatus(formData: FormData) {
    "use server";
    await updateOrderStatus(order!.id, formData.get("status") as any);
  }

  async function createLabel() {
    "use server";
    await generateShippingLabel(order!.id);
    revalidatePath(`/admin/orders/${order!.id}`);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">Zamówienie {order.orderNumber}</h1>
        <form action={changeStatus} className="flex gap-2">
          <select name="status" defaultValue={order.status} className="input-field !py-2 !w-auto">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-outline">Zapisz status</button>
        </form>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-5">
          <h2 className="text-sm text-creamdim mb-3">Klient</h2>
          <p>{order.customer.firstName} {order.customer.lastName}</p>
          <p className="text-creamdim text-sm">{order.customer.email}</p>
          <p className="text-creamdim text-sm">{order.customer.phone}</p>
        </div>
        <div className="card p-5">
          <h2 className="text-sm text-creamdim mb-3">Płatność</h2>
          <p className="text-amber">{order.paymentStatus}</p>
          <p className="text-creamdim text-sm">{order.payment?.method ?? "—"}</p>
          <p className="text-creamdim text-sm">{order.payment?.confirmedAt?.toLocaleString("pl-PL") ?? "Nieopłacone"}</p>
        </div>
        <div className="card p-5">
          <h2 className="text-sm text-creamdim mb-3">Dostawa</h2>
          <p>{order.deliveryMethod === "INPOST_LOCKER" ? `Paczkomat: ${order.inpostLockerCode}` : "Kurier InPost"}</p>
          <p className="text-creamdim text-sm">{order.shipment?.status ?? "Nie utworzono przesyłki"}</p>
          {order.shipment?.trackingNumber && <p className="text-creamdim text-sm">Nr: {order.shipment.trackingNumber}</p>}
          {order.paymentStatus === "PAID" && !order.shipment?.inpostShipmentId && (
            <form action={createLabel} className="mt-3">
              <button className="btn-outline text-xs">Utwórz przesyłkę InPost / etykietę</button>
            </form>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm text-creamdim mb-4">Produkty</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b border-line last:border-0 text-sm">
            <span>{item.product.name} × {item.quantity}</span>
            <span>{((item.unitPriceCents * item.quantity) / 100).toFixed(2)} zł</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 text-sm text-creamdim">
          <span>Suma produktów</span><span>{(order.subtotalCents / 100).toFixed(2)} zł</span>
        </div>
        {order.discountCode && (
          <div className="flex justify-between text-sm text-amber">
            <span>Rabat ({order.discountCode.code})</span><span>−{(order.discountCents / 100).toFixed(2)} zł</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-creamdim">
          <span>Dostawa</span><span>{(order.shippingCents / 100).toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between text-lg pt-3 mt-2 border-t border-line">
          <span>Razem</span><span className="text-amber font-display">{(order.totalCents / 100).toFixed(2)} zł</span>
        </div>
      </div>
    </div>
  );
}
