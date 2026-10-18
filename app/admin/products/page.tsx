import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { listProducts } from "@/lib/db/repository";
import { dbReady, DB_OFFLINE_NOTICE } from "@/lib/admin/guard";
import { PRODUCT } from "@/lib/config/product";
import ProductEditor from "@/components/admin/ProductEditor";

export const metadata: Metadata = { title: "Produkty" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!dbReady()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl">Produkty</h1>
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-warm-300">
          <p className="mb-1 font-semibold text-warning">Edycja produktu wymaga bazy danych.</p>
          <p className="text-warm-500">{DB_OFFLINE_NOTICE}</p>
        </div>
        <div className="admin-card">
          <p className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-widest text-warm-500">
            <Boxes className="h-4 w-4" aria-hidden /> Produkt z konfiguracji (tylko do odczytu)
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Slug" value={PRODUCT.slug} />
            <Row label="Marka" value={PRODUCT.brand} />
            <Row label="Nazwa" value={PRODUCT.name ?? "[NAZWA PERFUM]"} />
            <Row label="Cena" value={PRODUCT.priceCents !== null ? `${(PRODUCT.priceCents / 100).toFixed(2)} zł` : "[CENA]"} />
            <Row label="Pojemność" value={PRODUCT.volume ?? "[POJEMNOŚĆ]"} />
            <Row label="Aktywny" value={PRODUCT.isActive ? "Tak" : "Nie"} />
          </dl>
          <p className="mt-5 text-[11px] text-warm-600">
            Aby edytować te wartości bez bazy, zmień je w <code className="text-warm-300">lib/config/product.ts</code>.
          </p>
        </div>
      </div>
    );
  }

  const products = await listProducts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Produkty</h1>
        <p className="mt-1 text-sm text-warm-500">Edycja danych produktu widocznych w sklepie.</p>
      </div>
      {products.length === 0 ? (
        <div className="admin-card text-center text-sm text-warm-500">
          Brak produktów w bazie. Uruchom SQL z <code className="text-warm-300">supabase/schema.sql</code>,
          aby dodać produkt startowy.
        </div>
      ) : (
        products.map((product) => (
          <section key={product.id} className="admin-card">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="font-display text-xl text-gold">{product.name ?? "[NAZWA PERFUM]"}</p>
                <p className="text-xs text-warm-500">slug: {product.slug}</p>
              </div>
              <span className="admin-badge">{product.isActive ? "AKTYWNY" : "NIEAKTYWNY"}</span>
            </div>
            <ProductEditor product={product} />
          </section>
        ))
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-warm-600">{label}</dt>
      <dd className="text-warm-300">{value}</dd>
    </div>
  );
}
