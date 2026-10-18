import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Boxes, BarChart3, Settings, Store, LogOut } from "lucide-react";
import { is_admin_authenticated, adminEmail } from "@/lib/auth/admin";
import AdminLogout from "@/components/admin/AdminLogout";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Pulpit", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Zamówienia", icon: Package },
  { href: "/admin/products", label: "Produkty", icon: Boxes },
  { href: "/admin/statistics", label: "Statystyki", icon: BarChart3 },
  { href: "/admin/settings", label: "Ustawienia", icon: Settings },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await is_admin_authenticated())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-onyx-900/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-lg tracking-[0.3em] text-gold">
              ZODARA
            </Link>
            <nav className="flex flex-wrap gap-1" aria-label="Nawigacja panelu">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs uppercase tracking-widest text-warm-500 transition hover:bg-white hover:text-gold"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {adminEmail() && (
              <span className="hidden text-xs text-warm-600 sm:inline" title="Zalogowane konto właścicielki">
                {adminEmail()}
              </span>
            )}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs uppercase tracking-widest text-warm-500 transition hover:bg-white hover:text-gold"
            >
              <Store className="h-4 w-4" aria-hidden /> Sklep
            </Link>
            <AdminLogout>
              <LogOut className="h-4 w-4" aria-hidden />
              Wyloguj
            </AdminLogout>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
