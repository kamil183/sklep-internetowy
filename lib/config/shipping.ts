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
  /** Czy kurier może pobrać pieniądze przy dostawie (za pobraniem). */
  codAvailable: boolean;
}

// Za pobraniem tylko kurier — w paczkomacie nie ma komu wręczyć gotówki.
export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "INPOST_LOCKER", label: "Paczkomat", priceCents: 1149, codAvailable: false },
  { id: "INPOST_COURIER", label: "Kurier", priceCents: 1499, codAvailable: true },
];

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id);
}
