"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source: "footer" }),
      });
      if (res.ok) {
        setState("done");
      } else {
        const data = await res.json().catch(() => null);
        setState("error");
        setMsg(data?.error ?? "Nie udało się zapisać. Spróbuj ponownie.");
      }
    } catch {
      setState("error");
      setMsg("Błąd połączenia. Spróbuj ponownie.");
    }
  }

  if (state === "done") {
    return (
      <div className="text-sm text-gold">
        <p className="font-medium">Dziękujemy! 🖤</p>
        <p className="mt-1 text-creamdim">
          Jesteś na liście — powiadomimy Cię o premierze LAVIÉRY i premierach zapachów.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Twój adres e-mail"
          aria-label="Adres e-mail"
          className="min-w-0 flex-1 rounded border border-line bg-bg/60 px-3 py-2 text-sm text-cream placeholder:text-creamdim/70 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "sending" || !consent || email.length < 5}
          className="rounded bg-gold px-4 py-2 text-sm font-medium text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "sending" ? "Zapisuję…" : "Zapisz się"}
        </button>
      </div>

      <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs text-creamdim">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 flex-none accent-[#a86f4c]"
        />
        <span>
          Zapisuję się do newslettera ZODARA PARFUMS i akceptuję otrzymywanie informacji o
          produktach i premierach. Mogę wycofać zgodę w każdej chwili (link w każdej
          wiadomości).
        </span>
      </label>

      {state === "error" && <p className="mt-2 text-xs text-red-400">{msg}</p>}
    </form>
  );
}
