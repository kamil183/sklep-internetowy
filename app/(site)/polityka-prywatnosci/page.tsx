import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/config/brand";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Polityka prywatności sklepu ZODARA PARFUMS — przetwarzanie danych osobowych zgodnie z RODO.",
};

const ADMIN = {
  name: BRAND.name,
  owner: BRAND.owner,
  address: BRAND.fullAddress,
  nip: BRAND.nip,
  email: BRAND.email,
};

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 rounded-2xl border border-line bg-white p-7 md:p-9">
      <h2 className="label mb-5">
        {n}. {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-warm-300">{children}</p>;
}

function L({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-warm-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function PolitykaPrywatnoscPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 pt-36 pb-32 md:pt-44">
      <p className="section-label mb-6">Polityka prywatności</p>

      <h1 className="font-display text-4xl leading-tight font-light md:text-6xl">
        Polityka prywatności
      </h1>

      <p className="mt-6 text-sm leading-relaxed text-warm-500">
        Niniejsza Polityka wyjaśnia, w jaki sposób {ADMIN.name} przetwarza dane osobowe osób
        korzystających ze sklepu internetowego, w szczególności składających zamówienia,
        oraz jakie prawa przysługują w związku z tym osobom. Zasady są zgodne z Rozporządzeniem
        Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO) oraz ustawą z dnia 10 maja 2018 r.
        o ochronie danych osobowych.
      </p>

      {/* 1. Administrator */}
      <Section n="1" title="Administrator danych osobowych">
        <P>
          1.1. Administratorem danych osobowych jest {ADMIN.owner} prowadząca działalność
          gospodarczą pod firmą {ADMIN.name}, {ADMIN.address}, NIP {ADMIN.nip}, dalej „Administrator”.
        </P>
        <P>
          1.2. W sprawach dotyczących danych osobowych możesz skontaktować się z Administratorem
          pod adresem{" "}
          <a href={`mailto:${ADMIN.email}`} className="text-gold transition hover:underline">
            {ADMIN.email}
          </a>
          .
        </P>
      </Section>

      {/* 2. Zakres danych */}
      <Section n="2" title="Zakres przetwarzanych danych">
        <P>2.1. W zależności od sposobu korzystania ze Sklepu Administrator przetwarza:</P>
        <L
          items={[
            <>dane zamawiającego: imię i nazwisko, adres e-mail, numer telefonu,</>,
            <>dane dostawy: ulica i numer, kod pocztowy, miejscowość (oraz kod paczkomatu, jeśli wybrano tę formę dostawy),</>,
            <>dane związane z zamówieniem: zawartość koszyka, kwota, wybrany sposób dostawy i płatności, status płatności,</>,
            <>dane przekazywane przez formularz kontaktowy: imię, adres e-mail, treść wiadomości,</>,
            <>dane techniczne: adres IP, typ przeglądarki, data i czas wizyty — rejestrowane automatycznie w logach serwera w celach bezpieczeństwa,</>,
          ]}
        />
        <P>
          2.2. Podanie danych jest dobrowolne, ale niezbędne do zawarcia i realizacji umowy sprzedaży
          oraz obsługi zgłoszeń — bez nich zamówienie nie może zostać zrealizowane.
        </P>
      </Section>

      {/* 3. Cele i podstawy */}
      <Section n="3" title="Cele i podstawy prawne przetwarzania">
        <P>3.1. Dane są przetwarzane w następujących celach:</P>
        <L
          items={[
            <>zawarcie i realizacja umowy sprzedaży — art. 6 ust. 1 lit. b RODO,</>,
            <>wypełnienie obowiązków prawnych (księgowość, podatki) — art. 6 ust. 1 lit. c RODO,</>,
            <>obsługa zgłoszeń i reklamacji — art. 6 ust. 1 lit. b i f RODO (prawnie uzasadniony interes: obsługa klienta),</>,
            <>ochrona bezpieczeństwa Sklepu (logi, zapobieganie nadużyciom) — art. 6 ust. 1 lit. f RODO,</>,
            <>realizacja płatności za pośrednictwem operatora Stripe — art. 6 ust. 1 lit. b i f RODO,</>,
          ]}
        />
        <P>
          3.2. Administrator nie podejmuje decyzji wywołujących skutki prawne lub w podobny
          istotny sposób wpływających na osoby na podstawie zautomatyzowanego przetwarzania,
          w tym profilowania.
        </P>
      </Section>

      {/* 4. Odbiorcy */}
      <Section n="4" title="Odbiorcy danych">
        <P>
          4.1. Dane mogą być ujawniane wyłącznie podmiotom, które je przetwarzają na polecenie
          Administratora lub na podstawie odrębnych przepisów, w szczególności:
        </P>
        <L
          items={[
            <>Stripe Payments Europe Ltd. — operator płatności internetowych (karty, inne metody udostępnione w kasie),</>,
            <>InPost — przewoźnik realizujący dostawy (Paczkomaty i przesyłki kurierskie),</>,
            <>dostawca hostingu i bazy danych (infrastruktura techniczna Sklepu),</>,
            <>biuro rachunkowe — w zakresie wymaganym przepisami o księgowości i podatkach,</>,
            <>organom państwowym — gdy wymagają tego przepisy prawa,</>,
          ]}
        />
      </Section>

      {/* 5. Okres przechowywania */}
      <Section n="5" title="Okres przechowywania danych">
        <P>5.1. Dane są przechowywane przez okres niezbędny do realizacji celu, w którym zostały zebrane, a następnie:</P>
        <L
          items={[
            "dane związane z zamówieniami — do czasu upływu terminów przedawnienia roszczeń oraz przez okres wymagany przepisami podatkowymi i rachunkowymi (co do zasady 5 lat od końca roku, w którym zakończono sprzedaż),",
            "dane z formularza kontaktowego — do czasu zamknięcia sprawy, a następnie maksymalnie przez okres 3 lat dla potrzeb obrony przed roszczeniami,",
            "dane techniczne (logi) — przez krótki czas, w praktyce nie dłuższy niż kilkanaście dni, chyba że dane są potrzebne do wyjaśnienia incydentu bezpieczeństwa,",
          ]}
        />
      </Section>

      {/* 6. Prawa osób */}
      <Section n="6" title="Prawa osób, których dane dotyczą">
        <P>6.1. Przysługuje Ci prawo do:</P>
        <L
          items={[
            <>dostępu do swoich danych oraz uzyskania ich kopii (art. 15 RODO),</>,
            <>sprostowania danych nieprawidłowych (art. 16 RODO),</>,
            <>usunięcia danych („prawo do zapomnienia”, art. 17 RODO),</>,
            <>ograniczenia przetwarzania (art. 18 RODO),</>,
            <>przenoszenia danych dostarczonych na podstawie zgody lub umowy (art. 20 RODO),</>,
            <>sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie (art. 21 RODO),</>,
            <>cofnięcia zgody w dowolnym momencie, bez wpływu na zgodność wcześniejszego przetwarzania (art. 7 ust. 3 RODO),</>,
          ]}
        />
        <P>
          6.2. Wystarczy wiadomość e-mail na adres{" "}
          <a href={`mailto:${ADMIN.email}`} className="text-gold transition hover:underline">
            {ADMIN.email}
          </a>{" "}
          — Administrator odpowie bez zbędnej zwłoki, nie później niż w terminie 30 dni.
        </P>
        <P>
          6.3. Jeżeli uznasz, że przetwarzanie danych narusza przepisy RODO, przysługuje Ci prawo
          wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.
        </P>
      </Section>

      {/* 7. Cookies */}
      <Section n="7" title="Pliki cookies i logi">
        <P>
          7.1. Sklep korzysta wyłącznie z plików cookies niezbędnych do jego działania
          (np. utrzymanie zawartości koszyka i sesji). Nie są wykorzystywane cookies analityczne
          ani reklamowe podmiotów trzecich.
        </P>
        <P>
          7.2. Ograniczenie lub wyłączenie cookies w przeglądarce może wpłynąć na działanie
          koszyka i składania zamówień.
        </P>
        <P>
          7.3. Adres IP i informacje o wizycie przetwarzane są w logach serwera w celach
          technicznych i bezpieczeństwa, przez czas ograniczony potrzebami operacyjnymi.
        </P>
      </Section>

      {/* 8. Transfer poza EOG */}
      <Section n="8" title="Przekazywanie danych poza Europejski Obszar Gospodarczy">
        <P>
          8.1. Operator płatności Stripe przetwarza dane w państwach spoza EOG (w tym w Stanach
          Zjednoczonych) na podstawie standardowych klauzul umownych zatwierdzonych przez
          Komisję Europejską, w ramach programu EU–US Data Privacy Framework, jeżeli ma
          zastosowanie.
        </P>
        <P>
          8.2. W pozostałym zakresie Administrator nie przekazuje danych poza EOG.
        </P>
      </Section>

      {/* 9. Bezpieczeństwo */}
      <Section n="9" title="Bezpieczeństwo danych">
        <P>
          9.1. Administrator stosuje rozwiązania techniczne i organizacyjne chroniące dane:
          szyfrowane połączenia (HTTPS), kontrolę dostępu do infrastruktury, ograniczony zakres
          przetwarzania oraz przechowywanie danych na zabezpieczonych systemach.
        </P>
        <P>
          9.2. Dane karty płatniczej nie są przetwarzane ani przechowywane przez Administratora —
          płatność realizowana jest na stronie operatora Stripe.
        </P>
      </Section>

      {/* 10. Zmiany */}
      <Section n="10" title="Zmiany Polityki prywatności">
        <P>
          10.1. Polityka może być aktualizowana w razie zmiany przepisów lub sposobu działania
          Sklepu. Aktualna wersja jest zawsze dostępna na tej stronie, a w razie istotnych zmian
          Administrator poinformuje o nich w widoczny sposób.
        </P>
        <P>10.2. Polityka obowiązuje od dnia publikacji w Sklepie.</P>
      </Section>

      <p className="mt-12 text-xs text-warm-500">Ostatnia aktualizacja: październik 2026 r.</p>

      <p className="mt-10">
        <Link href="/" className="btn-ghost">
          Wróć na stronę główną
        </Link>
      </p>
    </main>
  );
}
