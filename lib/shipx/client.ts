/**
 * Klient ShipX API (InPost) — TYLKO po stronie serwera.
 *
 * Token nigdy nie trafia do przeglądarki ani do repozytorium.
 * Wymagane zmienne środowiskowe (Vercel → Settings → Environment Variables):
 *
 *   INPOST_SHIPX_TOKEN      — token z Managera Paczek → Moje konto → API → ShipX API
 *   INPOST_ORGANIZATION_ID  — identyfikator organizacji w ShipX
 *   INPOST_ENV              — "test"/"sandbox" dla sandboxa; cokolwiek innego = produkcja
 *   SHIPX_BASE_URL          — OPCJONALNY, nadpisuje bazowy adres API
 */

export class ShipxNotConfiguredError extends Error {
  constructor() {
    super(
      "Integracja InPost nie jest skonfigurowana. Ustaw INPOST_SHIPX_TOKEN i INPOST_ORGANIZATION_ID w Vercel.",
    );
    this.name = "ShipxNotConfiguredError";
  }
}

export class ShipxApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ShipxApiError";
    this.status = status;
    this.details = details;
  }
}

const PRODUCTION_BASE_URL = "https://api-shipx-pl.easypack24.net/v1";
const SANDBOX_BASE_URL = "https://sandbox-api-shipx-pl.easypack24.net/v1";

export function isShipxConfigured(): boolean {
  return Boolean(
    process.env.INPOST_SHIPX_TOKEN && process.env.INPOST_ORGANIZATION_ID,
  );
}

/**
 * Bazowy adres API. SHIPX_BASE_URL nadpisuje wszystko; w przeciwnym razie
 * INPOST_ENV decyduje o środowisku: "test"/"sandbox"/"dev" → sandbox,
 * reszta (lub brak zmiennej) → produkcja.
 */
function baseUrl(): string {
  if (process.env.SHIPX_BASE_URL) {
    return process.env.SHIPX_BASE_URL.replace(/\/+$/, "");
  }
  const env = (process.env.INPOST_ENV ?? "").trim().toLowerCase();
  const base = env === "test" || env === "sandbox" || env === "dev"
    ? SANDBOX_BASE_URL
    : PRODUCTION_BASE_URL;
  return base;
}

function organizationId(): string {
  const id = process.env.INPOST_ORGANIZATION_ID;
  if (!id) throw new ShipxNotConfiguredError();
  return id;
}

function authHeaders(): Record<string, string> {
  const token = process.env.INPOST_SHIPX_TOKEN;
  if (!token) throw new ShipxNotConfiguredError();
  return { Authorization: `Bearer ${token}` };
}

export interface ShipxReceiver {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    building_number: string;
    city: string;
    post_code: string;
    country_code: string;
  };
}

export interface ShipxShipmentPayload {
  receiver: ShipxReceiver;
  parcels: Array<{ template: string }>;
  service: "inpost_courier_standard" | "inpost_locker_standard";
  custom_attributes?: { target_point?: string };
  reference?: string;
  cod?: { amount: number; currency: string };
  insurance?: { amount: number; currency: string };
}

export interface ShipxShipment {
  id: number;
  tracking_number: string | null;
  status?: string;
  [key: string]: unknown;
}

function errorDetails(data: unknown): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj.details) return JSON.stringify(obj.details);
    if (obj.error) return typeof obj.error === "string" ? obj.error : JSON.stringify(obj.error);
    return JSON.stringify(data);
  }
  return String(data);
}

/**
 * Tworzy przesyłkę w ShipX. Zwraca ID i numer nadania.
 * Błąd API zamienia na ShipxApiError z czytelnym komunikatem dla panelu admina.
 */
export async function createShipment(payload: ShipxShipmentPayload): Promise<ShipxShipment> {
  if (!isShipxConfigured()) throw new ShipxNotConfiguredError();

  const url = `${baseUrl()}/organizations/${encodeURIComponent(organizationId())}/shipments`;

  const res = await fetch(url, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = res.status === 401
      ? "Token ShipX jest nieprawidłowy lub wygasł."
      : res.status === 403
        ? "Konto InPost nie ma uprawnień do tej usługi."
        : res.status === 422
          ? "InPost odrzucił dane przesyłki — sprawdź adres, telefon i kwotę pobrania."
          : `InPost zwrócił błąd ${res.status}.`;
    throw new ShipxApiError(res.status, message, errorDetails(data));
  }

  return data as ShipxShipment;
}

/** Pobiera etykietę PDF jako bajty. */
export async function getLabelPdf(shipmentId: number): Promise<Uint8Array> {
  if (!isShipxConfigured()) throw new ShipxNotConfiguredError();

  const url = `${baseUrl()}/shipments/${encodeURIComponent(String(shipmentId))}/label?format=pdf`;

  const res = await fetch(url, {
    method: "GET",
    headers: { ...authHeaders(), Accept: "application/pdf" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ShipxApiError(
      res.status,
      res.status === 404
        ? "Etykieta nie jest jeszcze dostępna dla tej przesyłki."
        : `Nie udało się pobrać etykiety (${res.status}).`,
      errorDetails(data),
    );
  }

  const buffer = await res.arrayBuffer();
  return new Uint8Array(buffer);
}

/** Pobiera status przesyłki po numerze nadania. */
export async function getTracking(trackingNumber: string): Promise<unknown> {
  if (!isShipxConfigured()) throw new ShipxNotConfiguredError();

  const url = `${baseUrl()}/tracking/${encodeURIComponent(trackingNumber)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { ...authHeaders(), Accept: "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ShipxApiError(res.status, `Nie udało się sprawdzić statusu (${res.status}).`, errorDetails(data));
  }

  return res.json();
}
