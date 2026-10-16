import { prisma } from "@/lib/prisma";
import NewsletterBroadcast from "@/components/admin/NewsletterBroadcast";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

// Panel subskrybentów newslettera. Widac tu dowód zgody: kiedy, z jakiego IP,
// jaki tekst zgody, czy potwierdzona (double opt-in liczy się do wysyłki).
export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const perPage = 50;

  const where = query ? { email: { contains: query } } : {};

  const [total, confirmedTotal, pendingTotal, rows] = await Promise.all([
    prisma.newsletterSubscriber.count({ where }),
    prisma.newsletterSubscriber.count({ where: { confirmed: true, unsubscribedAt: null } }),
    prisma.newsletterSubscriber.count({ where: { confirmed: false, unsubscribedAt: null } }),
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
  ]);


  async function deleteSub(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (id) {
      await prisma.newsletterSubscriber.delete({ where: { id } });
      revalidatePath("/admin/newsletter");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl">Newsletter</h1>
        <div className="flex items-center gap-3">
          <a href="/api/admin/newsletter" className="btn btn-outline">
            Eksport CSV (zgody)
          </a>
          <a href="/admin/newsletter" className="text-sm text-creamdim">
            Odśwież
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
        <div className="card p-4">
          <p className="text-xs text-creamdim">Wszystkich</p>
          <p className="font-display text-2xl">{total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-creamdim">Potwierdzeni (aktywni)</p>
          <p className="font-display text-2xl">{confirmedTotal}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-creamdim">Ostatni zapis</p>
          <p className="font-display text-2xl">
            {rows[0] ? new Date(rows[0].createdAt).toLocaleDateString("pl-PL") : "—"}
          </p>
        </div>
      </div>

      <form className="mb-6 flex gap-2 max-w-md" action="/admin/newsletter" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Szukaj e-maila…"
          className="input-field"
        />
        <button className="btn">Szukaj</button>
      </form>

      <NewsletterBroadcast pendingCount={pendingTotal} />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-creamdim border-b border-line">
            <tr>
              <th className="p-3">E-mail</th>
              <th className="p-3">Zgoda (data)</th>
              <th className="p-3">Potwierdzona</th>
              <th className="p-3">Wypisany</th>
              <th className="p-3">Źródło</th>
              <th className="p-3">IP</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line/60">
                <td className="p-3">{r.email}</td>
                <td className="p-3 text-creamdim">
                  {new Date(r.consentAt).toLocaleString("pl-PL")}
                </td>
                <td className="p-3">{r.confirmed ? "✔" : "—"}</td>
                <td className="p-3 text-creamdim">
                  {r.unsubscribedAt ? new Date(r.unsubscribedAt).toLocaleDateString("pl-PL") : "—"}
                </td>
                <td className="p-3 text-creamdim">{r.source}</td>
                <td className="p-3 font-mono text-xs text-creamdim">{r.consentIp}</td>
                <td className="p-3">
                  <form action={deleteSub}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-xs text-red-400 hover:text-red-300">Usuń</button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-creamdim">
                  Brak subskrybentów — pierwsze zapisy pojawią się z formularza w stopce sklepu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > perPage && (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: Math.ceil(total / perPage) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/newsletter?page=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`rounded border px-3 py-1 text-sm ${p === pageNum ? "border-gold text-gold" : "border-line text-creamdim"}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
