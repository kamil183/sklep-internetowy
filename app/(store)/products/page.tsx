import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string } }) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(searchParams.category ? { category: { slug: searchParams.category } } : {}),
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-32 pb-20">
      <h1 className="font-display text-3xl md:text-4xl mb-10">Produkty</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
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
        {products.length === 0 && <p className="text-creamdim text-sm">Brak produktów do wyświetlenia.</p>}
      </div>
    </div>
  );
}
