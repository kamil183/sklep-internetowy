/**
 * InPost integration layer.
 *
 * Two separate InPost products are used here and must not be confused:
 *
 * 1. GEOWIDGET (frontend only, no secret key) — the official map/picker the
 *    customer uses at checkout to choose a Paczkomat. It only needs the
 *    public NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN. See:
 *    app/(store)/checkout/InpostGeowidget.tsx
 *
 * 2. SHIPX API (backend only, secret token) — used by the admin/backend to
 *    actually create shipments, generate labels and track parcels once an
 *    order is paid. This requires INPOST_SHIPX_TOKEN and INPOST_ORGANIZATION_ID,
 *    which are NOT available until the store owner registers a ShipX (Manager
 *    Paczek / InPost dla Biznesu) account and issues an API token there.
 *
 * Until those env vars are set, the functions below throw a clear error
 * instead of silently pretending to create a real shipment — per the brief,
 * this must never be faked.
 */

const SHIPX_BASE_URL =
  process.env.INPOST_ENV === "production"
    ? "https://api-shipx-pl.easypack24.net/v1"
    : "https://sandbox-api-shipx-pl.easypack24.net/v1";

function assertConfigured() {
  if (!process.env.INPOST_SHIPX_TOKEN || !process.env.INPOST_ORGANIZATION_ID) {
    throw new Error(
      "InPost ShipX is not configured yet. Set INPOST_SHIPX_TOKEN and " +
        "INPOST_ORGANIZATION_ID in .env once the store owner has a ShipX account. " +
        "See README.md → 'Konfiguracja InPost'."
    );
  }
}

interface CreateShipmentParams {
  orderId: string;
  receiver: { name: string; email: string; phone: string };
  targetPoint?: string; // Paczkomat code, for locker delivery
  address?: { street: string; city: string; postCode: string; countryCode: string }; // for courier
  parcel: { weightKg: number; sizeCode?: "small" | "medium" | "large" };
  isCod: boolean; // pobranie
  codAmountCents?: number;
}

/** Creates a real ShipX shipment. Throws until INPOST_SHIPX_TOKEN is configured. */
export async function createShipment(params: CreateShipmentParams) {
  assertConfigured();

  const body = {
    receiver: {
      name: params.receiver.name,
      email: params.receiver.email,
      phone: params.receiver.phone,
    },
    parcels: [{ weight: { amount: params.parcel.weightKg, unit: "kg" } }],
    service: params.targetPoint ? "inpost_locker_standard" : "inpost_courier_standard",
    ...(params.targetPoint
      ? { custom_attributes: { target_point: params.targetPoint } }
      : { receiver: { ...params.receiver, address: params.address } }),
    ...(params.isCod && params.codAmountCents
      ? {
          cod: {
            amount: (params.codAmountCents / 100).toFixed(2),
            currency: "PLN",
          },
        }
      : {}),
    reference: params.orderId,
  };

  const res = await fetch(
    `${SHIPX_BASE_URL}/organizations/${process.env.INPOST_ORGANIZATION_ID}/shipments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.INPOST_SHIPX_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`InPost ShipX createShipment failed (${res.status}): ${text}`);
  }
  return res.json();
}

/** Fetches current status + tracking info for an existing shipment. */
export async function getShipment(inpostShipmentId: string) {
  assertConfigured();
  const res = await fetch(
    `${SHIPX_BASE_URL}/organizations/${process.env.INPOST_ORGANIZATION_ID}/shipments/${inpostShipmentId}`,
    { headers: { Authorization: `Bearer ${process.env.INPOST_SHIPX_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`InPost ShipX getShipment failed (${res.status})`);
  return res.json();
}

/** Requests a printable label (PDF) for a confirmed shipment. */
export async function getShipmentLabel(inpostShipmentId: string) {
  assertConfigured();
  const res = await fetch(
    `${SHIPX_BASE_URL}/shipments/${inpostShipmentId}/label?format=pdf&type=normal`,
    { headers: { Authorization: `Bearer ${process.env.INPOST_SHIPX_TOKEN}` } }
  );
  if (!res.ok) throw new Error(`InPost ShipX getShipmentLabel failed (${res.status})`);
  return res.arrayBuffer();
}
