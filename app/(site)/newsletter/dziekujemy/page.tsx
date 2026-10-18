export const metadata = { title: "Zapisano — ZODARA PARFUMS" };

export default function NewsletterDziekujemy() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-28 text-center">
      <p className="text-[11px] uppercase tracking-[0.4em] text-gold">Newsletter</p>
      <h1 className="mt-4 font-display text-4xl text-cream md:text-5xl">Dziękujemy.</h1>
      <p className="mt-6 text-creamdim">
        Twój adres jest na liście ZODARA PARFUMS. Podpowiemy Ci o premierze LAVIÉRY,
        limitowanych edycjach i cichych przecenach — zawsze krótko i tylko o tym, co się dzieje.
      </p>
      <p className="mt-3 text-sm text-creamdim">
        Zgoda jest dobrowolna; wypiszesz się jednym klikiem, linkiem w każdej wiadomości.
      </p>
      <a
        href="/"
        className="mt-10 inline-block rounded bg-gold px-6 py-3 text-sm font-medium text-bg transition hover:opacity-90"
      >
        Powrót do sklepu
      </a>
    </section>
  );
}
