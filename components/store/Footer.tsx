import Link from "next/link";
import NewsletterForm from "@/components/newsletter-form";
import { BRAND } from "@/lib/config/brand";

/**
 * Stopka — na wzór masaru.pl: jasna, linki prawne (Regulamin,
 * Polityka prywatności, Dostawa, Zwroty), kontakt/media społecznościowe
 * i linia © w drugim wierszu.
 */

const LEGAL_LINKS = [
  { href: "/regulamin", label: "Regulamin" },
  { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
  { href: "/dostawa-i-platnosci", label: "Dostawa i płatności" },
  { href: "/zwroty", label: "Zwroty i reklamacje" },
  { href: "/o-nas", label: "O nas" },
] as const;

export default function Footer() {
  return (
    <footer className="relative z-10 bg-white text-ink">
      <div className="mx-auto w-full max-w-[120rem] px-5 pt-20 pb-10 md:px-8 md:pt-24">
        <div className="grid gap-12 border-t border-line pt-14 md:grid-cols-3">
          {/* Marka */}
          <div>
            <p className="font-display text-2xl tracking-[0.35em] md:text-3xl">ZODARA</p>
            <p className="mt-2 font-label text-[9px] tracking-[0.4em] text-warm-500">PARFUMS</p>
            <address className="mt-6 not-italic text-sm leading-relaxed text-warm-500">
              {BRAND.owner}
              <br />
              {BRAND.street}
              <br />
              {BRAND.postalCode} {BRAND.city}
            </address>
          </div>

          {/* Linki prawne */}
          <div>
            <h3 className="mb-5 font-label text-[10px] uppercase tracking-[0.3em] text-gold">
              Sklep
            </h3>
            <ul className="space-y-3 text-sm">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-300 transition-colors duration-500 hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="mb-5 font-label text-[10px] uppercase tracking-[0.3em] text-gold">
              Kontakt
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="text-warm-300 transition-colors duration-500 hover:text-gold"
                >
                  {BRAND.email}
                </a>
              </li>
              <li>
                <Link href="/#kontakt" className="text-warm-300 transition-colors duration-500 hover:text-gold">
                  Formularz kontaktowy
                </Link>
              </li>
              <li className="pt-2">
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-warm-500">
                  NIP {BRAND.nip}
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-5 font-label text-[10px] uppercase tracking-[0.3em] text-gold">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-warm-300">
              Pierwsza wiadomość o premierach, limitowanych edycjach i promocjach — prosto na Twoją skrzynkę.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 text-xs text-warm-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name} · Made with love and passion.
          </p>
          <p>{BRAND.slogan}</p>
        </div>
      </div>
    </footer>
  );
}
