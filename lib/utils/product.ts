import { PRODUCT, type ProductConfig } from "@/lib/config/product";

/**
 * Wyświetlanie danych produktu z czytelnymi placeholderami.
 * Dzięki temu brakujące dane nigdy nie wyglądają jak „puste pola" —
 * a ich uzupełnienie sprowadza się do edycji lib/config/product.ts
 * (albo panelu /admin/products przy podłączonej bazie).
 */

export function displayName(p: ProductConfig = PRODUCT): string {
  return p.name ?? "[NAZWA PERFUM]";
}

export function displayVolume(p: ProductConfig = PRODUCT): string {
  return p.volume ?? "[POJEMNOŚĆ]";
}

export function displayDescription(p: ProductConfig = PRODUCT): string {
  return p.description ?? "[OPIS]";
}

export function displayScentStory(p: ProductConfig = PRODUCT): string {
  return p.scent.story ?? "[OPIS ZAPACHU]";
}

export function displayScentCharacter(p: ProductConfig = PRODUCT): string {
  return p.scent.character ?? "[CHARAKTER ZAPACHU]";
}

export function displayNotes(p: ProductConfig = PRODUCT): string[] {
  return p.scent.notes.length > 0 ? p.scent.notes : ["[NUTY ZAPACHOWE]"];
}

export function displayNotesLabel(p: ProductConfig = PRODUCT): string {
  return p.scent.notesLabel ?? "Nuty zapachowe";
}

export function displaySignature(p: ProductConfig = PRODUCT): string | null {
  return p.scent.signature ?? null;
}

export function displayConcentration(p: ProductConfig = PRODUCT): string | null {
  return p.concentration ?? null;
}

export function displayAvailability(p: ProductConfig = PRODUCT): string {
  return p.availability ?? "[DOSTĘPNOŚĆ]";
}

export function displayFeatureTitle(p: ProductConfig, index: number): string {
  return p.features[index]?.title ?? `[CECHA ${index + 1}]`;
}

export function displayFeatureDescription(p: ProductConfig, index: number): string {
  return p.features[index]?.description ?? "[OPIS CECHY]";
}

/** Czy produkt ma komplet danych do złożenia zamówienia? */
export function isPurchasable(p: ProductConfig = PRODUCT): boolean {
  return p.isActive && typeof p.priceCents === "number" && p.priceCents > 0;
}

/** Czy wartość to jeszcze placeholder (zaczyna się od "[")? */
export function isPlaceholder(value: string): boolean {
  return value.trimStart().startsWith("[");
}
