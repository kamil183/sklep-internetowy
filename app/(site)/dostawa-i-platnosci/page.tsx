import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Dostawa i płatności",
  description: "Sposoby dostawy i płatności w sklepie ZODARA PARFUMS.",
};

export default function Page() {
  return (
    <LegalPage
      title="Dostawa i płatności"
      slug="dostawa-i-platnosci"
      intro="Informacje o sposobach dostawy, kosztach oraz metodach płatności — online (Stripe: karta, BLIK, Przelewy24) i za pobraniem u kuriera."
    />
  );
}
