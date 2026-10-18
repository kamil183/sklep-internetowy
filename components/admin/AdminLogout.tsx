"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function AdminLogout({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs uppercase tracking-widest text-warm-500 transition hover:bg-white/5 hover:text-gold"
    >
      {children}
    </button>
  );
}
