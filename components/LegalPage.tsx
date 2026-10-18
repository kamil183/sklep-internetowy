import Link from "next/link";
import { BRAND } from "@/lib/config/brand";

/**
 * Common layout for legal pages.
 * Content is NOT invented — intentionally left as placeholders for the
 * brand owner (or their lawyer) to fill in.
 */
export default function LegalPage({ title, intro, slug }: { title: string; intro: string; slug: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-40 pb-32">
      <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
      <p className="mt-6 text-sm leading-relaxed text-warm-500">{intro}</p>

      <div className="mt-10 rounded-2xl border border-dashed border-gold/40 bg-white p-8">
        <p className="label mb-3">Miejsce na treść dokumentu</p>
        <p className="text-sm leading-relaxed text-warm-300">
          [TREŚĆ DO UZUPEŁNIENIA] — dokument nie został jeszcze dostarczony. Nie zastępujemy go
          zmyślonymi postanowieniami. Po otrzymaniu tekstu wystarczy wkleić go w to miejsce:
          plik <code className="text-gold">app/(site)/{slug}/page.tsx</code>.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="label mb-4">Dane administratora sklepu</h2>
        <address className="space-y-1 text-sm not-italic leading-relaxed text-warm-300">
          <p className="text-ink">{BRAND.name}</p>
          <p>{BRAND.owner}</p>
          <p>{BRAND.fullAddress}</p>
          <p>NIP: {BRAND.nip}</p>
          <p>
            <a href={`mailto:${BRAND.email}`} className="transition hover:text-gold">{BRAND.email}</a>
          </p>
        </address>
      </section>

      <p className="mt-12">
        <Link href="/" className="btn-ghost">WRÓĆ NA STRONĘ GŁÓWNĄ</Link>
      </p>
    </main>
  );
}
