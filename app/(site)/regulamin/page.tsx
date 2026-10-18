import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/config/brand";
import { PRODUCT } from "@/lib/config/product";

export const metadata: Metadata = {
  title: "Regulamin sklepu",
  description:
    "Regulamin sklepu internetowego ZODARA PARFUMS — zasady zakupu, płatności, dostawy, odstąpienia od umowy i reklamacji.",
};

const ADMIN = {
  name: BRAND.name,
  owner: BRAND.owner,
  address: BRAND.fullAddress,
  street: BRAND.street,
  postalCode: BRAND.postalCode,
  city: BRAND.city,
  nip: BRAND.nip,
  email: BRAND.email,
};

const PRODUCT_LINE = `${PRODUCT.brand} ${PRODUCT.name ?? ""} — ${PRODUCT.concentration ?? ""} ${PRODUCT.volume ?? ""}`.trim();

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

export default function RegulaminPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 pt-36 pb-32 md:pt-44">
      <p className="section-label mb-6">Regulamin sklepu</p>

      <h1 className="font-display text-4xl leading-tight font-light md:text-6xl">
        Regulamin sklepu internetowego
      </h1>

      <p className="mt-6 text-sm leading-relaxed text-warm-500">
        Niniejszy Regulamin określa zasady zawierania i realizacji umów sprzedaży za pośrednictwem
        sklepu internetowego {ADMIN.name}. Zakup w sklepie oznacza akceptację poniższych
        postanowień. Dokument został sporządzony dla konsumentów w rozumieniu ustawy z dnia
        30 maja 2014 r. o prawach konsumenta.
      </p>

      {/* 1. Postanowienia ogólne */}
      <Section n="1" title="Postanowienia ogólne">
        <P>
          1.1. Sklep internetowy działa pod adresem wskazanym w adresie strony i jest prowadzony
          przez {ADMIN.owner} prowadzącą działalność gospodarczą pod firmą {ADMIN.name}
          {" "}({ADMIN.address}, NIP {ADMIN.nip}), zwaną dalej „Sprzedawcą”.
        </P>
        <P>
          1.2. Użyte w Regulaminie określenia oznaczają:
        </P>
        <L
          items={[
            <>„Kupujący” — osoba fizyczna, w tym konsument, a także osoba prawna lub jednostka organizacyjna niebędąca osobą prawną, która zamierza kupić lub kupiła Produkt,</>,
            <>„Konsument” — konsument w rozumieniu art. 22¹ Kodeksu cywilnego,</>,
            <>„Sklep” — sklep internetowy prowadzony przez Sprzedawcę,</>,
            <>„Produkt” — towar prezentowany w Sklepie, w szczególności perfumy marki ZODARA PARFUMS,</>,
            <>„Umowa” — umowa sprzedaży zawierana na odległość między Kupującym a Sprzedawcą,</>,
            <>„Dni robocze” — dni tygodnia od poniedziałku do piątku, z wyłączeniem dni ustawowo wolnych od pracy,</>,
          ]}
        />
        <P>
          1.3. W sprawach nieuregulowanych w Regulaminie zastosowanie mają przepisy prawa polskiego,
          w szczególności: ustawa z dnia 23 kwietnia 1964 r. — Kodeks cywilny, ustawa z dnia 30 maja
          2014 r. o prawach konsumenta oraz ustawa z dnia 12 marca 2004 r. o prawie konsumenta
          (ustawa o prawach konsumenta).
        </P>
        <P>
          1.4. Regulamin jest dostępny nieodpłatnie na stronie Sklepu w formie umożliwiającej jego
          pozyskanie, utrwalenie i odtworzenie.
        </P>
      </Section>

      {/* 2. Dane sprzedawcy */}
      <Section n="2" title="Dane Sprzedawcy i kontakt">
        <P>
          2.1. Sprzedawca: {ADMIN.owner}, {ADMIN.name}
          <br />
          {ADMIN.street}, {ADMIN.postalCode} {ADMIN.city}
          <br />
          NIP: {ADMIN.nip}
        </P>
        <P>
          2.2. Kontakt w sprawach związanych ze sprzedażą:{" "}
          <a href={`mailto:${ADMIN.email}`} className="text-gold transition hover:underline">
            {ADMIN.email}
          </a>
          .
        </P>
        <P>
          2.3. Kupujący może kontaktować się ze Sprzedawcą również za pośrednictwem formularza
          kontaktowego dostępnego w Sklepie.
        </P>
      </Section>

      {/* 3. Wymagania techniczne */}
      <Section n="3" title="Wymagania techniczne">
        <P>
          3.1. Do korzystania ze Sklepu niezbędne jest urządzenie z aktywnym połączeniem
          z Internetem, przeglądarką internetową umożliwiającą wyświetlanie stron WWW oraz
          adresem e-mail do odbioru potwierdzeń zamówienia.
        </P>
        <P>
          3.2. Korzystanie ze Sklepu jest nieodpłatne. Kupujący ponosi wyłącznie koszty połączenia
          z Internetem zgodnie z taryfą swojego operatora.
        </P>
      </Section>

      {/* 4. Składanie zamówień */}
      <Section n="4" title="Składanie zamówień">
        <P>4.1. Zamówienie składa się w następujący sposób:</P>
        <L
          items={[
            "wybranie Produktu i dodanie go do koszyka,",
            "wpisanie danych do dostawy i kontaktowych,",
            "wybór sposobu dostawy i płatności,",
            "sprawdzenie podsumowania zamówienia (produkt, ilość, cena, koszt dostawy, suma),",
            "potwierdzenie zamówienia przyciskiem uruchamiającym płatność.",
          ]}
        />
        <P>
          4.2. Kliknięcie przycisku płatności oznacza złożenie przez Kupującego oferty zawarcia umowy
          sprzedaży na warunkach podanych w podsumowaniu.
        </P>
        <P>
          4.3. Umowa zostaje zawarta z chwilą otrzymania przez Kupującego potwierdzenia przyjęcia
          zamówienia wraz z informacją o rozpoczęciu realizacji, wysyłanego na adres e-mail podany
          w zamówieniu.
        </P>
        <P>
          4.4. Dane podawane w zamówieniu powinny być prawdziwe i kompletne. Sprzedawca skontaktuje
          się z Kupującym, jeśli dane uniemożliwiają realizację zamówienia.
        </P>
        <P>
          4.5. Treść zamówień jest przechowywana i archiwizowana przez Sprzedawcę w celu realizacji
          umów oraz wypełniania obowiązków rachunkowo-podatkowych.
        </P>
      </Section>

      {/* 5. Ceny i płatności */}
      <Section n="5" title="Ceny i płatności">
        <P>
          5.1. Ceny podane w Sklepie są cenami brutto, wyrażonymi w złotych polskich, i obejmują
          podatek VAT. Cena wiążąca jest ceną wyświetloną przy Produkcie w chwili składania
          zamówienia.
        </P>
        <P>
          5.2. Do łącznej kwoty zamówienia doliczany jest koszt dostawy w wysokości wybranej przez
          Kupującego w kasie; pełna kwota do zapłaty jest zawsze widoczna w podsumowaniu przed
          płatnością.
        </P>
        <P>
          5.3. Płatności obsługuje operator Stripe Payments Europe Ltd. (zgodnie z prawem irlandzkim)
          — Kupujący może zapłacić kartą płatniczą lub inną metodą udostępnioną w kasie Stripe.
        </P>
        <P>
          5.4. Dane karty płatniczej nie są przetwarzane ani przechowywane przez Sprzedawcę — są
          wprowadzane bezpośrednio na bezpiecznej stronie operatora płatności.
        </P>
        <P>
          5.5. W przypadku odrzucenia płatności zamówienie nie jest realizowane. Kupujący może
          powtórzyć próbę lub skontaktować się ze Sprzedawcą.
        </P>
      </Section>

      {/* 6. Dostawa */}
      <Section n="6" title="Dostawa i czas realizacji">
        <P>6.1. Dostawa realizowana jest na terenie Polski, w wybrany przez Kupującego sposób:</P>
        <L items={["automat paczkowy InPost (Paczkomat),", "przesyłka kurierska InPost."]} />
        <P>
          6.2. Koszt dostawy jest podawany w kasie przed płatnością. Przy przekroczeniu progów
          darmowej dostawy (jeśli są ogłoszone w Sklepie) koszt wynosi 0 zł.
        </P>
        <P>
          6.3. Zamówienia realizowane są w dni robocze. Termin wysyłki wynosi do 3 dni roboczych od
          zaksięgowania płatności (o ile przy Produkcie nie podano innego terminu), a przewidywany
          czas dostawy to kolejne 1–2 dni robocze.
        </P>
        <P>
          6.4. W razie przewlekłego opóźnienia Kupujący może wyznaczyć dodatkowy termin; po jego
          bezskutecznym upływie może odstąpić od umowy na podstawie art. 491 Kodeksu cywilnego.
        </P>
        <P>
          6.5. Sprzedawca ponosi ryzyko uszkodzenia lub utraty przesyłki do momentu jej wydania
          Kupującemu. Jeżeli przesyłka została uszkodzona lub zaginęła, prosimy o kontakt —
          Sprzedawca podejmie działania reklamacyjne u przewoźnika.
        </P>
      </Section>

      {/* 7. Odstąpienie */}
      <Section n="7" title="Prawo odstąpienia od umowy">
        <P>
          7.1. Konsument ma prawo odstąpić od umowy w terminie 14 dni bez podawania przyczyny.
        </P>
        <P>
          7.2. Termin biegnie od objęcia Produktu w posiadanie przez Konsumenta lub wskazaną przez
          niego osobę trzecią inną niż przewoźnik, a przy zamówieniu obejmującym wiele rzeczy
          dostarczanych osobno — od objęcia w posiadanie ostatniej rzeczy.
        </P>
        <P>
          7.3. Aby skorzystać z prawa odstąpienia, Konsument informuje Sprzedawcę o swojej decyzji
          w formie jednoznacznego oświadczenia (np. listownie lub e-mailem na adres{" "}
          <a href={`mailto:${ADMIN.email}`} className="text-gold transition hover:underline">
            {ADMIN.email}
          </a>
          ) — można skorzystać z wzoru stanowiącego Załącznik nr 1 do Regulaminu, jednak nie jest to
          obowiązkowe.
        </P>
        <P>
          7.4. Do zachowania terminu wystarczy wysłanie oświadczenia przed jego upływem.
        </P>
        <P>
          7.5. W razie odstąpienia Sprzedawca zwraca Konsumentowi niezwłocznie, nie później niż
          w terminie 14 dni od otrzymania oświadczenia, wszystkie dokonane płatności, w tym koszty
          dostawy (najtańszy standardowy sposób dostawy oferowany przez Sprzedawcę). Zwrot następuje
          tym samym sposobem, w jakim Konsument zapłacił, chyba że wyrazi on zgodę na inny sposób —
          bez ponoszenia dodatkowych kosztów.
        </P>
        <P>
          7.6. Konsument zwraca Produkt niezwłocznie, nie później niż w terminie 14 dni od
          odstąpienia. Do zachowania terminu wystarczy odesłanie Produktu przed jego upływem.
          Bezpośrednie koszty zwrotu ponosi Konsument.
        </P>
        <P>
          7.7. Konsument ponosi odpowiedzialność za zmniejszenie wartości Produktu wynikające
          z korzystania z niego w sposób inny niż konieczny do stwierdzenia charakteru, cech
          i funkcjonowania Produktu.
        </P>
        <P>
          7.8. Prawo odstąpienia nie przysługuje Konsumentowi w odniesieniu do umów, w których
          przedmiotem świadczenia jest rzecz zapieczętowana, której po otwarciu opakowania nie można
          ze względu na ochronę zdrowia lub higienę zwrócić, jeżeli opakowanie zostało otwarte po
          dostarczeniu (art. 38 ust. 1 pkt 3 ustawy o prawach konsumenta) — dotyczy to m.in.
          otwartego flakonu perfum. Odstąpienie jest więc możliwe, dopóki opakowanie produktu nie
          zostało otwarte.
        </P>
        <P>
          7.9. Sprzedawca dokonuje zwrotu płatności po otrzymaniu Produktu lub dowodu jego odesłania
          — w zależności od tego, co nastąpi wcześniej.
        </P>
      </Section>

      {/* 8. Reklamacja */}
      <Section n="8" title="Reklamacja (rękojmia za wady)">
        <P>
          8.1. Sprzedawca odpowiada wobec Kupującego za wady fizyczne lub prawne Produktu na
          podstawie przepisów rękojmi (art. 556 i nast. Kodeksu cywilnego).
        </P>
        <P>
          8.2. Reklamację można złożyć mailowo na adres{" "}
          <a href={`mailto:${ADMIN.email}`} className="text-gold transition hover:underline">
            {ADMIN.email}
          </a>{" "}
          lub listownie na adres Sprzedawcy, podając: dane kontaktowe, numer zamówienia, opis wady
          oraz żądanie (np. wymiana, obniżenie ceny, odstąpienie).
        </P>
        <P>
          8.3. Sprzedawca ustosunkuje się do reklamacji niezwłocznie, nie później niż w terminie
          14 dni. Odpowiedź zawiera wynik rozpatrzenia oraz dalsze instrukcje (np. adres wysyłki
          reklamowanego Produktu).
        </P>
        <P>
          8.4. W przypadku uznania reklamacji Sprzedawca niezwłocznie naprawia lub wymienia Produkt
          na wolny od wad albo obniża cenę, chyba że naprawa lub wymiana są niemożliwe lub wymagałyby
          nadmiernych kosztów.
        </P>
        <P>
          8.5. Konsument może również skorzystać z uprawnień wynikających z rękojmi, gdy wada
          została stwierdzona w okresie 2 lat od wydania Produktu.
        </P>
      </Section>

      {/* 9. Pozasądowe ścieżki */}
      <Section n="9" title="Pozasądowe dochodzenie roszczeń">
        <P>
          9.1. Konsument może skorzystać z pozasądowych sposobów rozpatrywania reklamacji
          i dochodzenia roszczeń, w szczególności zwracając się do:
        </P>
        <L
          items={[
            "powiatowego (miejskiego) rzecznika konsumentów,",
            "wojewódzkiego inspektora Inspekcji Handlowej (wniosek o rozstrzygnięcie sporu za pośrednictwem WTOK),",
            "ogólnopolskiego punktu kontaktowego DSIT (sieć Europejskiego Centrum Konsumenckiego).",
          ]}
        />
        <P>
          9.2. Informacje o sposobach dostępu do tych procedur dostępne są także na stronie
          urzędu ochrony konkurencji i konsumentów.
        </P>
        <P>
          9.3. Sprzedawca deklaruje gotowość do polubownego rozwiązania sporu — wystarczy kontakt
          e-mailowy.
        </P>
      </Section>

      {/* 10. Dane osobowe */}
      <Section n="10" title="Dane osobowe">
        <P>
          10.1. Administratorem danych osobowych Kupujących jest {ADMIN.owner} ({ADMIN.address}).
        </P>
        <P>
          10.2. Dane przetwarzane są w celu zawarcia i realizacji umowy, wypełnienia obowiązków
          rachunkowo-podatkowych oraz obsługi zgłoszeń. Szczegóły, w tym prawa Kupującego i okresy
          przechowywania, określa Polityka prywatności dostępna w Sklepie.
        </P>
      </Section>

      {/* 11. Postanowienia końcowe */}
      <Section n="11" title="Postanowienia końcowe">
        <P>
          11.1. Sprzedawca może zmienić Regulamin z ważnych przyczyn (zmiana przepisów, zmiana
          sposobów płatności lub dostawy, zmiana organizacji Sklepu). Zmiany nie naruszają praw
          Kupujących złożonych przed ich wejściem w życie — zamówienia złożone przed zmianą realizowane
          są na warunkach obowiązujących w dniu złożenia zamówienia.
        </P>
        <P>
          11.2. Zmieniony Regulamin zostanie podany do wiadomości na stronie Sklepu przed
          wejściem w życie.
        </P>
        <P>
          11.3. Umowy zawierane są w języku polskim. Sprzedawca nie stosuje dodatkowych kodeksów
          dobrych praktyk w rozumieniu ustawy o przeciwdziałaniu nieuczciwym praktykom rynkowym.
        </P>
        <P>
          11.4. W sprawach nieuregulowanych Regulaminem stosuje się przepisy prawa polskiego, a
          wobec Konsumentów — zgodnie z właściwością określoną przepisami prawa procesowego.
        </P>
        <P>11.5. Regulamin obowiązuje od dnia publikacji w Sklepie.</P>
      </Section>

      {/* Załącznik */}
      <section className="mt-12 rounded-2xl border border-dashed border-gold/50 bg-panel p-7 md:p-9">
        <h2 className="label mb-5">Załącznik nr 1 — Wzór formularza odstąpienia od umowy</h2>
        <div className="space-y-4 text-sm leading-relaxed text-warm-300">
          <p>
            (formularz ten należy wypełnić i odesłać tylko wtedy, gdy chce się odstąpić od umowy)
          </p>
          <div className="rounded-xl border border-line bg-white p-6">
            <p className="text-sm">
              <strong>Adresat:</strong> {ADMIN.owner}, {ADMIN.name}, {ADMIN.street},{" "}
              {ADMIN.postalCode} {ADMIN.city}, {ADMIN.email}
            </p>
            <p className="mt-4 text-sm">
              Oświadczam, że zgodnie z art. 27 ustawy z dnia 30 maja 2014 r. o prawach konsumenta
              odstępuję od umowy sprzedaży następującego/ych produktu/ów:
            </p>
            <p className="mt-2 text-sm">.......................................................</p>
            <p className="mt-4 text-sm">Data zawarcia umowy/odbioru produktu/ów: .....................</p>
            <p className="mt-4 text-sm">Imię i nazwisko konsumenta/konsumentki: .....................</p>
            <p className="mt-2 text-sm">Adres: ....................................................................</p>
            <p className="mt-2 text-sm">
              Data: ...................................... Podpis: ............................
            </p>
          </div>
          <p className="text-xs text-warm-500">
            Dopisek „Załącznik nr 1” nie jest wymagany — wzór ma charakter pomocniczy.
          </p>
        </div>
      </section>

      <p className="mt-12 text-xs text-warm-500">
        Ostatnia aktualizacja: październik 2026 r. · {PRODUCT_LINE}
      </p>

      <p className="mt-10">
        <Link href="/" className="btn-ghost">
          Wróć na stronę główną
        </Link>
      </p>
    </main>
  );
}
