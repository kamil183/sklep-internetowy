/** Formatowanie ceny. Dla `null` zwraca placeholder [CENA]. */
export function formatPrice(priceCents: number | null): string {
  if (priceCents === null || priceCents === undefined) return "[CENA]";
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(priceCents / 100);
}

/** Formatowanie daty w stylu polskim. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Bezpieczne pobranie pojedynczego parametru URL. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
