import { is_admin_authenticated } from "@/lib/auth/admin";
import { getOrderById } from "@/lib/db/repository";
import { ShipxApiError, getLabelPdf, isShipxConfigured } from "@/lib/shipx/client";

/**
 * GET /admin/orders/[id]/label — pobiera etykietę InPost PDF dla zamówienia.
 *
 * Wymaga sesji admina (ciasteczko ustawione przy logowaniu).
 * Zwraca bajty PDF z nagłówkiem Content-Disposition: inline,
 * więc przeglądarka wyświetli etykietę w nowej karcie do wydruku.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await is_admin_authenticated())) {
    return new Response("Brak uprawnień.", { status: 401 });
  }

  if (!isShipxConfigured()) {
    return new Response(
      "Integracja InPost nie jest skonfigurowana. Ustaw INPOST_SHIPX_TOKEN i INPOST_ORGANIZATION_ID w Vercel.",
      { status: 503 },
    );
  }

  const order = await getOrderById(params.id).catch(() => null);
  if (!order) return new Response("Nie znaleziono zamówienia.", { status: 404 });

  if (order.shipxShipmentId === null) {
    return new Response(
      "Ta przesyłka nie została jeszcze nadana. Użyj przycisku NADAJ PRZESYŁKĘ w panelu zamówienia.",
      { status: 409 },
    );
  }

  try {
    const pdf = await getLabelPdf(order.shipxShipmentId);
    return new Response(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.byteLength),
        // inline = podgląd w karcie; filename = sensowna nazwa przy zapisie
        "Content-Disposition": `inline; filename="etykieta-${order.orderNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ShipxApiError) {
      console.error("[label] błąd ShipX:", error.status, error.details);
      return new Response(error.message, { status: error.status });
    }
    console.error("[label] nieoczekiwany błąd:", error);
    return new Response("Nie udało się pobrać etykiety.", { status: 500 });
  }
}
