import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct, deleteProduct } from "@/lib/actions/products";

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!product) notFound();

  async function save(formData: FormData) {
    "use server";
    await updateProduct(product!.id, formData);
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">Edytuj produkt</h1>
        <form action={deleteProduct.bind(null, product.id)}>
          <button className="text-sm text-red-400 hover:underline">Usuń produkt</button>
        </form>
      </div>

      <form action={save} className="space-y-4">
        <div>
          <label className="text-xs text-creamdim block mb-1">Nazwa</label>
          <input name="name" defaultValue={product.name} className="input-field" required />
        </div>
        <div>
          <label className="text-xs text-creamdim block mb-1">Opis</label>
          <textarea name="description" defaultValue={product.description} rows={4} className="input-field" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-creamdim block mb-1">Cena (zł)</label>
            <input name="price" type="number" step="0.01" defaultValue={(product.priceCents / 100).toFixed(2)} className="input-field" required />
          </div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Stan magazynowy</label>
            <input name="stock" type="number" defaultValue={product.stock} className="input-field" required />
          </div>
        </div>
        <div>
          <label className="text-xs text-creamdim block mb-1">Zdjęcia (jeden URL na linię)</label>
          <textarea
            name="images"
            rows={3}
            defaultValue={product.images.map((i) => i.url).join("\n")}
            className="input-field"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
          Produkt widoczny w sklepie
        </label>
        <button className="btn-primary">Zapisz zmiany</button>
        <p className="text-xs text-creamdim">
          Zmiany są zapisywane bezpośrednio w bazie danych i widoczne na stronie produktu natychmiast po zapisaniu.
        </p>
      </form>
    </div>
  );
}
