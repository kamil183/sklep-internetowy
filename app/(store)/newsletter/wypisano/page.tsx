export const metadata = { title: "Wypisano — ZODARA PARFUMS" };

export default function NewsletterWypisano() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-28 text-center">
      <p className="text-[11px] uppercase tracking-[0.4em] text-gold">Newsletter</p>
      <h1 className="mt-4 font-display text-4xl text-cream md:text-5xl">Do zobaczenia.</h1>
      <p className="mt-6 text-creamdim">
        Twój adres został wypisany z newslettera ZODARA PARFUMS. Nie dostaniesz już od nas
        wiadomości — a jeśli kiedykolwiek zmienisz zdanie, zawsze możesz wrócić.
      </p>
      <a
        href="/"
        className="mt-10 inline-block rounded border border-line px-6 py-3 text-sm text-cream transition hover:border-gold"
      >
        Powrót do sklepu
      </a>
    </section>
  );
}
