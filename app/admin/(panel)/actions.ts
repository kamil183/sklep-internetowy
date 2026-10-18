"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  DatabaseNotConfiguredError,
  updateOrderStatus,
  updateProduct,
} from "@/lib/db/repository";
import type { OrderStatus } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = [
  "NEW",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export type ActionResult = { ok: true } | { ok: false; error: string };

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof DatabaseNotConfiguredError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Aktualizacja produktu (nazwa, cena, stan, opisy). Wymaga sesji admina. */
export async function updateProductAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Brak identyfikatora produktu." };

  const name = String(formData.get("name") ?? "").trim();
  const volume = String(formData.get("volume") ?? "").trim();
  const price = String(formData.get("price") ?? "").trim().replace(",", ".");
  const stock = String(formData.get("stock") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scentStory = String(formData.get("scentStory") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  let priceCents: number | null = null;
  if (price !== "") {
    const parsed = Math.round(parseFloat(price) * 100);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { ok: false, error: "Nieprawidłowa cena — podaj wartość liczbową, np. 199.00." };
    }
    priceCents = parsed;
  }

  let stockValue: number | undefined;
  if (stock !== "") {
    const parsed = Number(stock);
    if (!Number.isInteger(parsed) || parsed < 0) {
      return { ok: false, error: "Stan magazynowy musi być liczbą całkowitą ≥ 0." };
    }
    stockValue = parsed;
  }

  const notes = notesRaw
    ? notesRaw.split("\n").map((line) => line.trim()).filter(Boolean)
    : [];

  try {
    await updateProduct(id, {
      name: name || null,
      volume: volume || null,
      priceCents,
      description: description || null,
      scentStory: scentStory || null,
      notes,
      stock: stockValue,
      isActive,
    });
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Nie udało się zapisać produktu.") };
  }

  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Zmiana statusu zamówienia (logistyka). Status płatności zmienia tylko webhook Stripe. */
export async function setOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<ActionResult> {
  await requireAdmin();

  if (!ORDER_STATUSES.includes(status)) {
    return { ok: false, error: "Nieprawidłowy status." };
  }

  try {
    await updateOrderStatus(orderId, status);
  } catch (error) {
    return { ok: false, error: errorMessage(error, "Nie udało się zmienić statusu.") };
  }

  revalidatePath("/admin/orders");
  if (orderId) revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

/** Akcja pod useActionState w formularzu statusu (orderId z inputu ukrytego). */
export async function setOrderStatusFormAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  return setOrderStatusAction(orderId, status);
}
