import type { Metadata } from "next";
import { SHIPPING_METHODS } from "@/lib/config/shipping";
import { PRODUCT } from "@/lib/config/product";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — ZODARA PARFUMS",
  description: "Finalizacja zamówienia w sklepie ZODARA PARFUMS.",
  robots: { index: false },
};

export default function CheckoutPage() {
  const shippingMethods = SHIPPING_METHODS.map((method) => ({
    id: method.id,
    label: method.label,
    priceCents: method.priceCents,
  }));

  return (
    <CheckoutClient
      shippingMethods={shippingMethods}
      stripeEnabled={Boolean(process.env.STRIPE_SECRET_KEY)}
      dbEnabled={Boolean(process.env.DATABASE_URL)}
      product={{
        brand: PRODUCT.brand,
        name: PRODUCT.name,
        volume: PRODUCT.volume,
        priceCents: PRODUCT.priceCents,
      }}
    />
  );
}
