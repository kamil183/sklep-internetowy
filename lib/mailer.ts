/**
 * Wysyłka e-maili przez Resend (bez SDK — ten sam wzorzec fetch co lib/notifications.ts).
 *
 * Konfiguracja (Vercel → Settings → Environment Variables, potem redeploy):
 *   RESEND_API_KEY             — klucz API z https://resend.com/api-keys
 *   NOTIFICATIONS_FROM_EMAIL   — nadawca na domenie zweryfikowanej w Resend
 *                                 (np. newsletter@zodaraparfums.com)
 *   NEXT_PUBLIC_APP_URL        — bazowy adres sklepu w linkach (https://zodaraparfums.com)
 *
 * Bez klucza sklep działa dalej: wysyłka zwraca czytelny błąd zamiast milczeć.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  ok: boolean;
  error?: string;
}

export function mailerReady(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATIONS_FROM_EMAIL);
}

export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  if (!mailerReady()) {
    return {
      ok: false,
      error:
        "Brak konfiguracji e-mail: ustaw RESEND_API_KEY i NOTIFICATIONS_FROM_EMAIL w Vercel (Settings → Environment Variables) i zrób redeploy.",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFICATIONS_FROM_EMAIL,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `Resend HTTP ${res.status} ${detail.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/* ============================== SZABLONY ============================== */

const GOLD = "#a8813f";
const CREAM_BG = "#f6f1e9";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wspólny „papier firmowy" — nagłówek, stopka z wypisem. */
function layout(bodyHtml: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html lang="pl">
<body style="margin:0;background:${CREAM_BG};font-family:Georgia,'Times New Roman',serif;color:#2b2118;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <p style="font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:${GOLD};margin:0 0 28px;">ZODARA PARFUMS</p>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #e4dccb;margin:36px 0 16px;" />
    <p style="font-size:11px;line-height:1.65;color:#8a7f6d;margin:0;">
      ZODARA PARFUMS · LAVIÉRA — Eau de Parfum 50 ml.<br/>
      Ta wiadomość trafiła na Twój adres na podstawie zgody wyrażonej przy zapisie do newslettera.
      Możesz się <a href="${unsubscribeUrl}" style="color:${GOLD};">wypisać w każdej chwili</a>.
    </p>
  </div>
</body>
</html>`;
}

function button(label: string, url: string): string {
  return `<p style="margin:28px 0 8px;">
    <a href="${url}" style="display:inline-block;background:${GOLD};color:#fdfbf6;text-decoration:none;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;padding:14px 28px;border-radius:2px;">${label}</a>
  </p>
  <p style="font-size:11px;color:#8a7f6d;word-break:break-all;margin:12px 0 0;">Jeśli przycisk nie działa, skopiuj link do przeglądarki:<br/>${url}</p>`;
}

/** Mail potwierdzający zapis (double opt-in) — link do istniejącego endpointu GET. */
export function confirmationEmail(opts: {
  email: string;
  token: string;
  baseUrl: string;
}): EmailPayload {
  const confirmUrl = `${opts.baseUrl}/api/newsletter?token=${encodeURIComponent(opts.token)}&action=confirm`;
  const unsubscribeUrl = `${opts.baseUrl}/api/newsletter?token=${encodeURIComponent(opts.token)}&action=unsubscribe`;

  const bodyHtml = `
    <h1 style="font-size:26px;font-weight:normal;margin:0 0 16px;">Potwierdź zapis do newslettera</h1>
    <p style="font-size:15px;line-height:1.7;margin:0;">Dziękujemy za zainteresowanie ZODARA PARFUMS. Aby potwierdzić, że to naprawdę Twój adres, kliknij przycisk poniżej — dostaniesz od nas tylko informacje o produktach, premierach i promocjach.</p>
    ${button("Potwierdź zapis", confirmUrl)}
    <p style="font-size:13px;line-height:1.7;color:#6f6555;margin:24px 0 0;">Bez potwierdzenia zapis nie zostanie aktywowany (double opt-in). Jeśli to nie Ty — po prostu zignoruj tego maila.</p>`;

  const text = `ZODARA PARFUMS — potwierdź zapis do newslettera.\n\nAby aktywować zapis, otwórz link:\n${confirmUrl}\n\nJeśli to nie Ty — zignoruj tę wiadomość.`;

  return {
    to: opts.email,
    subject: "Potwierdź zapis do newslettera ZODARA PARFUMS",
    html: layout(bodyHtml, unsubscribeUrl),
    text,
  };
}

/** Mail kampanii newslettera — treść od właścicielki, stopka z wypisem. */
export function newsletterEmail(opts: {
  email: string;
  token: string;
  baseUrl: string;
  subject: string;
  body: string;
}): EmailPayload {
  const unsubscribeUrl = `${opts.baseUrl}/api/newsletter?token=${encodeURIComponent(opts.token)}&action=unsubscribe`;

  // Paragrafy: podwójny enter = nowy akapit, pojedynczy = nowa linia.
  const paragraphs = opts.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="font-size:15px;line-height:1.75;margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");

  const bodyHtml = `
    <h1 style="font-size:24px;font-weight:normal;margin:0 0 18px;">${escapeHtml(opts.subject)}</h1>
    ${paragraphs}`;

  const text = `${opts.subject}\n\n${opts.body}`;

  return {
    to: opts.email,
    subject: opts.subject,
    html: layout(bodyHtml, unsubscribeUrl),
    text,
  };
}
