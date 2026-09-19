import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/lib/actions/products";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl">Produkty</h1>
        <Link href="/admin/products/new" className="btn-primary">+ Dodaj produkt</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-creamdim border-b border-line">
              <th className="p-4">Produkt</th>
              <th className="p-4">Kategoria</th>
              <th className="p-4">Cena</th>
              <th className="p-4">Stan</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="p-4 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]?.url ?? ""} alt="" className="w-10 h-10 rounded object-cover bg-bg2" />
                  <Link href={`/admin/products/${p.id}/edit`} className="hover:text-amber">{p.name}</Link>
                </td>
                <td className="p-4 text-creamdim">{p.category?.name ?? "—"}</td>
                <td className="p-4">{(p.priceCents / 100).toFixed(2)} zł</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <span className={`text-xs border rounded px-2 py-1 ${p.isActive ? "text-amber border-amberdim" : "text-creamdim border-line"}`}>
                    {p.isActive ? "Aktywny" : "Ukryty"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <form action={deleteProduct.bind(null, p.id)}>
                    <button className="text-xs text-red-400 hover:underline">Usuń</button>
                  </form>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-creamdim">Brak produktów. Dodaj pierwszy.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
