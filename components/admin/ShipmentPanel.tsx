"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2, PackageCheck } from "lucide-react";
import { createShipmentAction, type ShipmentResult } from "@/app/admin/actions";

/**
 * Nadanie przesyłki InPost z poziomu zamówienia.
 *
 * - „NADAJ PRZESYŁKĘ" tworzy przesyłkę w ShipX i zapisuje numer nadania.
 * - „ETYKIETA PDF" otwiera kartę z etykietą do wydruku.
 *
 * Przy zamówieniu za pobraniem kwota pobrania jest przekazywana automatycznie
 * (tylko przy dostawie kurierem — paczkomat nie obsługuje gotówki).
 */
export default function ShipmentPanel({
  orderId,
  shipxShipmentId,
  shipxTrackingNumber,
  isCod,
  isCourier,
}: {
  orderId: string;
  shipxShipmentId: number | null;
  shipxTrackingNumber: string | null;
  isCod: boolean;
  isCourier: boolean;
}) {
  const [result, setResult] = useState<ShipmentResult | null>(null);
  const [tracking, setTracking] = useState<string | null>(shipxTrackingNumber);
  const [pending, startTransition] = useTransition();

  const alreadyShipped = shipxShipmentId !== null;

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        {!alreadyShipped ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setResult(null);
              startTransition(async () => {
                const res = await createShipmentAction(orderId);
                setResult(res);
                if (res.ok) setTracking(res.trackingNumber);
              });
            }}
            className="admin-btn"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <PackageCheck className="h-4 w-4" aria-hidden />
            )}
            {pending ? "NADAJE…" : "NADAJ PRZESYŁKĘ"}
          </button>
        ) : (
          <a
            href={`/admin/orders/${orderId}/label`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn"
          >
            <FileText className="h-4 w-4" aria-hidden />
            ETYKIETA PDF
          </a>
        )}

        {isCod && isCourier && (
          <span className="text-xs text-warm-600">
            Pobranie zostanie przekazane InPost automatycznie.
          </span>
        )}
        {isCod && !isCourier && (
          <span className="text-xs text-danger-400">
            Za pobraniem nie można nadać paczkomatu.
          </span>
        )}
      </div>

      {tracking && (
        <p className="mt-3 text-xs text-warm-500">
          Numer nadania: <code className="text-gold">{tracking}</code>
        </p>
      )}

      {result && !result.ok && (
        <p className="mt-3 text-sm text-danger-400">{result.error}</p>
      )}
      {result?.ok && !tracking && (
        <p className="mt-3 text-sm text-gold">
          Przesyłka nadana, ale InPost nie zwrócił numeru nadania.
        </p>
      )}
    </div>
  );
}
