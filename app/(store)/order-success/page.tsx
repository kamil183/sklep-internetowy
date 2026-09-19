import { prisma } from "@/lib/prisma";
import ClearCartOnLoad from "@/components/ClearCartOnLoad";

export const revalidate = 0;

export default async function OrderSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  const order = searchParams.order
    ? await prisma.order.findUnique({
        where: { orderNumber: searchParams.order },
        include: { items: { include: { product: true } } },
      })
    : null;

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-6 pt-40 pb-24 text-center">
        <h1 className="font-display text-2xl mb-4">Nie znaleziono zamówienia</h1>
        <p className="text-creamdim text-sm">Sprawdź link lub skontaktuj się z nami, podając numer zamówienia.</p>
      </div>
    );
  }

  // Important: this page only ever *reads* order.paymentStatus. It never writes
  // it. If Stripe's webhook hasn't landed yet (rare, but possible on slow
  // networks), the customer correctly sees "oczekuje na potwierdzenie" instead
  // of a false "opłacone".
  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="max-w-lg mx-auto px-6 pt-40 pb-24 text-center">
      <ClearCartOnLoad />
      <div className="w-14 h-14 rounded-full border border-amber flex items-center justify-center mx-auto mb-6 text-amber text-xl">
        {isPaid ? "✓" : "…"}
      </div>
      <h1 className="font-display text-2xl mb-3">
        {isPaid ? "Dziękujemy za zamówienie" : "Oczekujemy na potwierdzenie płatności"}
      </h1>
      <p className="text-creamdim text-sm mb-8">
        Numer zamówienia: <span className="text-cream">{order.orderNumber}</span>
        {!isPaid && " — status zostanie zaktualizowany automatycznie w ciągu kilku minut."}
      </p>
      <div className="card p-6 text-left text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-1.5 text-creamdim">
            <span>{item.product.name} × {item.quantity}</span>
            <span>{((item.unitPriceCents * item.quantity) / 100).toFixed(2)} zł</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-3 border-t border-line text-cream">
          <span>Razem</span>
          <span className="text-amber font-display">{(order.totalCents / 100).toFixed(2)} zł</span>
        </div>
      </div>
    </div>
  );
}
