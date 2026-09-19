import Link from "next/link";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  stock: number;
  imageUrl: string;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;
  return (
    <Link href={`/products/${product.slug}`} className="card overflow-hidden group block">
      <div className="aspect-square bg-bg2 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg mb-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-amber font-display text-lg">{(product.priceCents / 100).toFixed(2)} zł</span>
          {outOfStock ? (
            <span className="text-xs text-creamdim border border-line rounded px-2 py-1">Wyprzedane</span>
          ) : (
            <span className="text-xs text-creamdim">{product.stock} szt. dostępnych</span>
          )}
        </div>
      </div>
    </Link>
  );
}
