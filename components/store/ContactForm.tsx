"use client";

/**
 * Contact form (no page refresh).
 * Sends data to /api/contact — backend can be attached via
 * CONTACT_WEBHOOK_URL (e.g. Formspree) without changing this file.
 */

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "sending" | "success" | "error";

const EMPTY = {
  name: "",
  email: "",
  subject: "",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const set = (key: keyof typeof EMPTY, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation (server validates again — Zod)
    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) {
      setErrorMessage("Uzupełnij wymagane pola.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMessage("Podaj poprawny adres e-mail.");
      setStatus("error");
      return;
    }
    if (!form.consent) {
      setErrorMessage("Wymagana jest zgoda na kontakt.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error ?? "Nie udało się wysłać wiadomości. Spróbuj ponownie.");
        setStatus("error");
        return;
      }

      setForm(EMPTY);
      setStatus("success");
    } catch {
      setErrorMessage("Błąd połączenia. Spróbuj ponownie.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
        <CheckCircle2 size={36} className="text-gold" />
        <p className="font-display text-2xl">Dziękujemy za wiadomość.</p>
        <p className="text-sm text-creamdim">Odpowiemy najszybciej, jak to możliwe.</p>
        <button
          type="button"
          className="btn-ghost mt-4"
          onClick={() => setStatus("idle")}
        >
          Wyślij kolejną
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8" noValidate>
      <div className="space-y-5">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-[11px] uppercase tracking-[0.25em] text-creamdim">
            Imię i nazwisko *
          </label>
          <input
            id="contact-name"
            className="input-field"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="contact-email" className="mb-1 block text-[11px] uppercase tracking-[0.25em] text-creamdim">
              E-mail *
            </label>
            <input
              id="contact-email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-1 block text-[11px] uppercase tracking-[0.25em] text-creamdim">
            Temat *
          </label>
          <input
            id="contact-subject"
            className="input-field"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1 block text-[11px] uppercase tracking-[0.25em] text-creamdim">
            Wiadomość *
          </label>
          <textarea
            id="contact-message"
            rows={5}
            className="input-field resize-none"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            required
          />
        </div>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-creamdim">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#c9a96a]"
            required
          />
          <span>
            Wyrażam zgodę na kontakt w sprawie mojego zapytania. *
          </span>
        </label>

        {errorMessage && (
          <p role="alert" className="border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
          {status === "sending" ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Wysyłanie…
            </>
          ) : (
            "Wyślij wiadomość"
          )}
        </button>
      </div>
    </form>
  );
}
