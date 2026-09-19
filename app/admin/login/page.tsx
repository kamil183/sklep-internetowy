"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Nieprawidłowy e-mail lub hasło.");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-8">
        <h1 className="font-display text-2xl mb-1">Panel administracyjny</h1>
        <p className="text-creamdim text-sm mb-8">Atelier No.7</p>
        <div className="space-y-4 mb-6">
          <input className="input-field" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-field" type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Logowanie…" : "Zaloguj się"}</button>
      </form>
    </div>
  );
}
