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
    <Link href={`/products/${product.slug}`} className="card group block overflow-hidden transition-colors hover:border-gold/50">
      <div className="aspect-square overflow-hidden bg-bg2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg tracking-wide transition-colors group-hover:text-gold">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-display text-lg text-gold">{(product.priceCents / 100).toFixed(2)} zł</span>
          {outOfStock ? (
            <span className="border border-line px-2 py-1 text-xs text-creamdim">Wyprzedane</span>
          ) : (
            <span className="text-xs text-creamdim">{product.stock} szt. dostępnych</span>
          )}
        </div>
      </div>
    </Link>
  );
}
