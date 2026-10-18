/**
 * Sposoby dostawy w checkoutcie.
 * `priceCents: null` = [CENA DOSTAWY] jeszcze nieustawiona —
 * checkout pokaże czytelny komunikat zamiast udawać działanie.
 * Uzupełnij wartości w groszach, np. 1200 = 12,00 zł.
 */
export interface ShippingMethod {
  id: "INPOST_LOCKER" | "INPOST_COURIER";
  label: string;
  priceCents: number | null;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "INPOST_LOCKER", label: "Paczkomat", priceCents: null },
  { id: "INPOST_COURIER", label: "Kurier", priceCents: null },
];

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id);
}
