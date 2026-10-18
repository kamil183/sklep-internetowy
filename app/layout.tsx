import type { Metadata, Viewport } from "next";
import "@fontsource/newsreader/300.css";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/syncopate/400.css";
import "@fontsource/syncopate/700.css";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "LAVIÉRA — ZODARA PARFUMS",
    template: "%s — ZODARA PARFUMS",
  },
  description:
    "LAVIÉRA by ZODARA PARFUMS — zapach, który zostaje w pamięci. Miękki, kremowy, zmysłowy. Eau de Parfum 50 ml. Laura Ludef, Rakoniewice.",
  keywords: ["LAVIÉRA", "ZODARA", "ZODARA PARFUMS", "perfumy", "eau de parfum", "luksusowe perfumy", "zapach"],
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "ZODARA PARFUMS",
    title: "ZODARA PARFUMS — luksusowe perfumy",
    description: "LAVIÉRA by ZODARA PARFUMS — miękki, kremowy, zmysłowy. Eau de Parfum 50 ml.",
    url: appUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZODARA PARFUMS — luksusowe perfumy",
    description: "LAVIÉRA by ZODARA PARFUMS — miękki, kremowy, zmysłowy. Eau de Parfum 50 ml.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2f0e6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-cream font-body text-ink">{children}</body>
    </html>
  );
}
