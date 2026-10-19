import type { Order } from "@/lib/types";
import type { ShipxShipmentPayload } from "./client";

/** Domyślny rozmiar paczki InPost — flakon 50 ml w pudełku. */
const DEFAULT_PARCEL_TEMPLATE = "small";

/** Numer telefonu do ShipX: tylko cyfry, bez spacji i myślników. */
function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** Format kodu pocztowego do ShipX: 00-000. */
function formatPostCode(postCode: string | null | undefined): string {
  const raw = (postCode ?? "").trim();
  // "00000" -> "00-000"; "00-000" zostaje bez zmian
  if (/^\d{5}$/.test(raw)) return `${raw.slice(0, 2)}-${raw.slice(2)}`;
  return raw;
}

/**
 * Adres kurierski wymaga rozdzielenia ulicy i numeru budynku.
 * "Ul. Wielichowska 4" -> { street: "Ul. Wielichowska", building_number: "4" }
 * Jeśli nie ma wyraźnego numeru, cały ciąg trafia do street, a numer zostaje pusty.
 */
function splitStreet(street: string): { street: string; buildingNumber: string } {
  const match = street.trim().match(/^(.*\S)\s+([0-9]+[A-Za-z]?(?:\s*\/\s*[0-9A-Za-z]+)?)$/);
  if (match) {
    return { street: match[1].trim(), buildingNumber: match[2].trim() };
  }
  return { street: street.trim(), buildingNumber: "" };
}

export class OrderDataIncompleteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderDataIncompleteError";
  }
}

/**
 * Buduje payload ShipX z zamówienia.
 *
 * - Pobranie (`cod`) przysługuje TYLKO przy dostawie kurierem (blokada w checkoutcie),
 *   ale walidujemy to tutaj ponownie — serwer nigdy nie ufa frontowi.
 * - Przy pobraniu ustawiamy ubezpieczenie równe wartości zamówienia —
 *   InPost odrzuca przesyłkę, gdy ubezpieczenie jest niższe od pobrania.
 */
export function buildShipmentPayload(order: Order): ShipxShipmentPayload {
  if (!order.customer) {
    throw new OrderDataIncompleteError("Zamówienie nie ma danych klienta.");
  }
  if (!order.shippingAddress) {
    throw new OrderDataIncompleteError("Zamówienie nie ma adresu dostawy.");
  }

  const phone = normalizePhone(order.customer.phone);
  if (phone.length < 9) {
    throw new OrderDataIncompleteError("Numer telefonu klienta jest niepełny — uzupełnij go przed nadaniem.");
  }

  const firstName = order.customer.firstName.trim() || "—";
  const lastName = order.customer.lastName.trim() || "—";

  const isCourier = order.deliveryMethod === "INPOST_COURIER";
  const isCod = order.paymentMethod === "cod";

  // Pobranie tylko przy kurierze — w paczkomacie nie ma komu wręczyć gotówki.
  if (isCod && !isCourier) {
    throw new OrderDataIncompleteError(
      "Za pobraniem można nadać wyłącznie przesyłkę kurierską (nie paczkomat).",
    );
  }

  const receiver: ShipxShipmentPayload["receiver"] = {
    first_name: firstName,
    last_name: lastName,
    email: order.customer.email,
    phone,
  };

  if (isCourier) {
    const { street, buildingNumber } = splitStreet(order.shippingAddress.street);
    receiver.address = {
      street,
      building_number: buildingNumber,
      city: order.shippingAddress.city.trim(),
      post_code: formatPostCode(order.shippingAddress.postCode),
      country_code: "PL",
    };
  }

  const payload: ShipxShipmentPayload = {
    receiver,
    parcels: [{ template: DEFAULT_PARCEL_TEMPLATE }],
    service: isCourier ? "inpost_courier_standard" : "inpost_locker_standard",
    reference: order.orderNumber,
  };

  if (!isCourier) {
    const target = (order.lockerCode ?? "").trim();
    if (!target) {
      throw new OrderDataIncompleteError("Brak kodu paczkomatu — uzupełnij go przed nadaniem.");
    }
    payload.custom_attributes = { target_point: target };
  }

  if (isCod && order.totalCents !== null && order.totalCents > 0) {
    const amount = order.totalCents / 100;
    payload.cod = { amount, currency: "PLN" };
    payload.insurance = { amount, currency: "PLN" };
  }

  return payload;
}
