"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Zamówienia" },
  { href: "/admin/products", label: "Produkty" },
  { href: "/admin/discounts", label: "Kody rabatowe" },
  { href: "/admin/statistics", label: "Statystyki" },
  { href: "/admin/settings", label: "Ustawienia" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-60 shrink-0 bg-panel border-r border-line min-h-screen p-6 flex flex-col">
      <div className="font-display text-lg mb-10">
        ATELIER <span className="text-amber">No.7</span>
        <div className="text-xs text-creamdim font-sans mt-0.5">Panel administracyjny</div>
      </div>
      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2.5 rounded text-sm transition-colors ${
              pathname?.startsWith(link.href) ? "bg-amber text-bg" : "text-creamdim hover:text-cream hover:bg-bg2"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-line pt-4 mt-4">
        <div className="text-xs text-creamdim mb-2">{session?.user?.email}</div>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="text-xs text-amber hover:underline">
          Wyloguj się
        </button>
      </div>
    </aside>
  );
}
