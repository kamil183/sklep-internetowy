"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Nieprawidłowy e-mail lub hasło.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Brak połączenia z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="admin-card w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl tracking-[0.3em] text-gold">ZODARA</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-warm-500">
            Panel administracyjny
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-[11px] uppercase tracking-widest text-warm-500">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-[11px] uppercase tracking-widest text-warm-500">
              Hasło
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="admin-btn w-full justify-center">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Lock className="h-4 w-4" aria-hidden />}
            {loading ? "SPRAWDZANIE…" : "ZALOGUJ SIĘ"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-warm-600">
          Konto właścicielki: e-mail i hasło z zmiennych <code className="text-warm-300">ADMIN_EMAIL</code> i <code className="text-warm-300">ADMIN_PASSWORD</code>.
        </p>

        <p className="mt-4 text-center">
          <Link href="/" className="text-[11px] uppercase tracking-widest text-warm-500 transition hover:text-gold">
            ← Wróć do sklepu
          </Link>
        </p>
      </div>
    </main>
  );
}
