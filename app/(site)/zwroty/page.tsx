import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje",
  description: "Zwroty i reklamacje w sklepie ZODARA PARFUMS.",
};

export default function Page() {
  return (
    <LegalPage
      title="Zwroty i reklamacje"
      slug="zwroty"
      intro="Informacje o prawie odstąpienia od umowy oraz trybie zgłaszania reklamacji."
    />
  );
}
