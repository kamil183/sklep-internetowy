import { prisma } from "@/lib/prisma";

export const revalidate = 0;

function StatusRow({ label, configured, hint }: { label: string; configured: boolean; hint: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-xs text-creamdim">{hint}</div>
      </div>
      <span className={`text-xs border rounded px-2 py-1 ${configured ? "text-amber border-amberdim" : "text-creamdim border-line"}`}>
        {configured ? "Skonfigurowane" : "Brak konfiguracji"}
      </span>
    </div>
  );
}

export default async function SettingsPage() {
  const admins = await prisma.adminUser.findMany({ select: { email: true, name: true, role: true, lastLoginAt: true } });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-8">Ustawienia</h1>

      <div className="card p-5 mb-8">
        <h2 className="font-display mb-4">Status integracji</h2>
        <StatusRow label="Stripe" configured={!!process.env.STRIPE_SECRET_KEY} hint="Płatności BLIK / Przelewy24 / karta / Apple Pay / Google Pay" />
        <StatusRow label="Stripe Webhook" configured={!!process.env.STRIPE_WEBHOOK_SECRET} hint="Wymagane, aby zamówienia otrzymywały status „Opłacone”" />
        <StatusRow label="InPost Geowidget" configured={!!process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN} hint="Wybór Paczkomatu na checkoucie" />
        <StatusRow label="InPost ShipX API" configured={!!process.env.INPOST_SHIPX_TOKEN} hint="Tworzenie przesyłek i etykiet z panelu zamówień" />
        <StatusRow label="Powiadomienia e-mail" configured={!!process.env.RESEND_API_KEY} hint="Powiadomienie właścicielki o nowym opłaconym zamówieniu" />
      </div>

      <div className="card p-5">
        <h2 className="font-display mb-4">Konta administratorów</h2>
        <p className="text-xs text-creamdim mb-4">
          Nowe konto administratora tworzy się wyłącznie poleceniem <code className="text-amber">npm run create-admin</code> z serwera —
          nie ma tu formularza rejestracji, więc nikt nie może sam nadać sobie dostępu do panelu.
        </p>
        {admins.map((a) => (
          <div key={a.email} className="flex justify-between text-sm py-2 border-b border-line last:border-0">
            <span>{a.name} ({a.email})</span>
            <span className="text-creamdim">{a.role} · ostatnie logowanie: {a.lastLoginAt?.toLocaleString("pl-PL") ?? "nigdy"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
