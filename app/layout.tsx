import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["300", "400", "500", "600"] });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", weight: ["300", "400", "500", "600"] });

export const metadata: Metadata = {
  title: "Atelier No.7 — Świece rzemieślnicze",
  description: "Ręcznie lane świece sojowe. Zamówienia z płatnością BLIK, Przelewy24, Apple Pay i dostawą InPost.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
