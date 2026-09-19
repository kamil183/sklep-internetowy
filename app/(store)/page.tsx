import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0; // always show current stock/prices from the DB

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
  ]);

  return (
    <div>
      <section className="min-h-[90vh] flex items-center px-6 md:px-10 pt-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="text-amberdim text-sm tracking-wide mb-5">RĘCZNIE LANE · WOSK SOJOWY · 100% NATURALNE</div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.04] max-w-[11ch]">
              Świece, które pamięta się na długo po zgaszeniu.
            </h1>
            <p className="mt-6 max-w-[42ch] text-creamdim">
              Małe partie, prawdziwy wosk sojowy i zapachy, które nie znikają po dziesięciu minutach.
            </p>
            <div className="mt-9 flex gap-4">
              <Link href="/products" className="btn-primary">Zobacz produkty</Link>
              <Link href="#o-nas" className="btn-outline">O pracowni</Link>
            </div>
          </div>
          <div className="aspect-square card flex items-center justify-center text-creamdim text-sm">
            [ zdjęcie hero — do podmiany na realne ]
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 py-20">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-display text-2xl md:text-3xl">Wyróżnione produkty</h2>
          <Link href="/products" className="text-sm text-amber hover:underline">Zobacz wszystkie →</Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                priceCents: p.priceCents,
                stock: p.stock,
                imageUrl: p.images[0]?.url ?? "/placeholder-product.jpg",
              }}
            />
          ))}
          {featured.length === 0 && (
            <p className="text-creamdim text-sm col-span-full">
              Brak produktów w bazie — dodaj pierwszy w /admin/products/new.
            </p>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 border-t border-line">
          <h2 className="font-display text-2xl mb-8">Kategorie</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/products?category=${c.slug}`} className="card px-5 py-3 text-sm hover:border-amberdim transition-colors">
                {c.name} <span className="text-creamdim">({c._count.products})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="o-nas" className="max-w-6xl mx-auto px-6 md:px-10 py-20 border-t border-line grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-2xl md:text-3xl max-w-[14ch] mb-4">Zrobione z tego, co widać, nie z obietnic na etykiecie.</h2>
          <p className="text-creamdim max-w-[48ch]">
            Każda świeca jest lana ręcznie, w małych partiach, z wosku sojowego i knotem z drewna. Szklany słoik zostaje po świecy.
          </p>
        </div>
        <div className="space-y-6">
          <blockquote className="card p-6 text-sm">
            <p className="text-creamdim">„Zapach trzyma się długo, a knot z drewna trzaska jak prawdziwy kominek.”</p>
            <div className="mt-3 text-amber text-xs">— Klientka, Warszawa</div>
          </blockquote>
          <blockquote className="card p-6 text-sm">
            <p className="text-creamdim">„Zamówienie doszło szybko, świeca ładnie zapakowana.”</p>
            <div className="mt-3 text-amber text-xs">— Klientka, Kraków</div>
          </blockquote>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 py-20 text-center border-t border-line">
        <h2 className="font-display text-3xl mb-6">Gotowa na swoją pierwszą świecę Atelier No.7?</h2>
        <Link href="/products" className="btn-primary inline-block">Zobacz produkty</Link>
      </section>
    </div>
  );
}
