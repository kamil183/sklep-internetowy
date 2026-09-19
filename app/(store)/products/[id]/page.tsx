import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartForm from "@/components/AddToCartForm";

export const revalidate = 0;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }], isActive: true },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });

  if (!product) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 pt-32 pb-24 grid md:grid-cols-2 gap-14">
      <div className="aspect-square card overflow-hidden">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-creamdim text-sm">Brak zdjęcia</div>
        )}
      </div>
      <div>
        {product.category && <div className="text-amberdim text-xs mb-3">{product.category.name}</div>}
        <h1 className="font-display text-3xl md:text-4xl mb-4">{product.name}</h1>
        <div className="font-display text-2xl text-amber mb-6">{(product.priceCents / 100).toFixed(2)} zł</div>
        <p className="text-creamdim mb-8 max-w-[48ch]">{product.description}</p>
        <AddToCartForm
          productId={product.id}
          name={product.name}
          priceCents={product.priceCents}
          imageUrl={product.images[0]?.url ?? ""}
          stock={product.stock}
        />
      </div>
    </div>
  );
}
