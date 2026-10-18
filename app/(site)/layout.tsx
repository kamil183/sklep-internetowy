import { CartProvider } from "@/components/store/CartContext";
import CartDrawer from "@/components/store/CartDrawer";
import Header from "@/components/store/Header";
import SmoothScroll from "@/components/store/SmoothScroll";
import Footer from "@/components/store/Footer";

/** Powłoka SKLEPU (publiczna): koszyk, płynny scroll (Lenis), header, stopka. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SmoothScroll />
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
