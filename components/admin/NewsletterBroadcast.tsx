"use client";

/**
 * Formularz wysyłki newslettera w panelu administracyjnym.
 * Kampania idzie tylko do potwierdzonych (double opt-in + zgoda RODO w bazie);
 * osobny przycisk dogania zapisy sprzed uruchomienia wysyłki.
 */

import { useRef, useState } from "react";
import {
  resendConfirmationsAction,
  sendNewsletterAction,
  type NewsletterActionResult,
} from "@/lib/actions/newsletter";

export default function NewsletterBroadcast({ pendingCount }: { pendingCount: number }) {
  const [result, setResult] = useState<NewsletterActionResult | null>(null);
  const [pending, setPending] = useState<null | "campaign" | "confirm">(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function runCampaign(formData: FormData) {
    setPending("campaign");
    setResult(null);
    try {
      const res = await sendNewsletterAction(formData);
      setResult(res);
      if (res.ok) formRef.current?.reset();
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "Błąd połączenia." });
    } finally {
      setPending(null);
    }
  }

  async function runConfirm() {
    setPending("confirm");
    setResult(null);
    try {
      setResult(await resendConfirmationsAction());
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "Błąd połączenia." });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="card mb-8 p-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <form ref={formRef} action={runCampaign}>
          <h2 className="label mb-4">Wyślij newsletter</h2>

          <label className="mb-1 block text-xs text-creamdim">Temat wiadomości</label>
          <input
            name="subject"
            maxLength={200}
            required
            placeholder="Np. Premiera LAVIÉRA — pierwsza dostawa"
            className="input-field mb-5"
          />

          <label className="mb-1 block text-xs text-creamdim">
            Treść (pusty wiersz = nowy akapit)
          </label>
          <textarea
            name="body"
            rows={7}
            required
            placeholder={"Cześć!\n\nDziękujemy, że jesteś z nami…"}
            className="input-field mb-5 resize-y"
          />

          <button className="btn-primary" disabled={pending !== null}>
            {pending === "campaign" ? "Wysyłam…" : "Wyślij do potwierdzonych"}
          </button>
        </form>

        <div>
          <h2 className="label mb-4">Double opt-in</h2>
          <p className="mb-4 text-sm leading-relaxed text-creamdim">
            Niepotwierdzone zapisy: <span className="text-cream">{pendingCount}</span>.
            Dostaną link „Potwierdź zapis” — bez kliknięcia nie trafiają do kampanii
            (wysyłka dopiero po potwierdzeniu, zgodnie z RODO).
          </p>
          <button
            onClick={() => void runConfirm()}
            className="btn-outline"
            disabled={pending !== null || pendingCount === 0}
          >
            {pending === "confirm"
              ? "Wysyłam…"
              : `Wyślij linki potwierdzające (${pendingCount})`}
          </button>
        </div>
      </div>

      {result && (
        <p className={`mt-6 text-sm ${result.ok ? "text-gold" : "text-red-400"}`}>
          {result.ok ? result.message : result.error}
        </p>
      )}
    </div>
  );
}
