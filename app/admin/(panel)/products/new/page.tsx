import { createProduct } from "@/lib/actions/products";

export default function NewProductPage() {
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl mb-8">Nowy produkt</h1>
      <form action={createProduct} className="space-y-4">
        <div>
          <label className="text-xs text-creamdim block mb-1">Nazwa</label>
          <input name="name" className="input-field" required />
        </div>
        <div>
          <label className="text-xs text-creamdim block mb-1">Opis</label>
          <textarea name="description" rows={4} className="input-field" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-creamdim block mb-1">Cena (zł)</label>
            <input name="price" type="number" step="0.01" className="input-field" required />
          </div>
          <div>
            <label className="text-xs text-creamdim block mb-1">Stan magazynowy</label>
            <input name="stock" type="number" className="input-field" required />
          </div>
        </div>
        <div>
          <label className="text-xs text-creamdim block mb-1">Kategoria</label>
          <input name="category" className="input-field" placeholder="np. Świece zapachowe" />
        </div>
        <div>
          <label className="text-xs text-creamdim block mb-1">Zdjęcia (jeden URL na linię)</label>
          <textarea name="images" rows={3} className="input-field" placeholder="https://..." />
          <p className="text-xs text-creamdim mt-1">
            Docelowo: podłącz Supabase Storage i wgrywaj pliki bezpośrednio — na razie wklej gotowe adresy URL.
          </p>
        </div>
        <button className="btn-primary">Zapisz produkt</button>
      </form>
    </div>
  );
}
