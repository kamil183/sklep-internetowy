import { contactSchema, firstZodError } from "@/lib/validation/schemas";

/**
 * POST /api/contact — endpoint formularza kontaktowego.
 *
 * Wiadomość jest przekazywana do zewnętrznego serwisu (np. Formspree,
 * Resend, własny endpoint) przez zmienną środowiskową:
 *
 *   CONTACT_WEBHOOK_URL=https://formspree.io/f/xxxxxx
 *
 * Wartości NIE ma w repozytorium — dopóki nie zostanie ustawiona,
 * endpoint zwraca czytelny komunikat 503 zamiast udawać sukces.
 */

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Nieprawidłowe dane żądania." }, 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ ok: false, error: firstZodError(parsed.error) }, 400);
  }
  const { name, email, phone, subject, message } = parsed.data;

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) {
    return json(
      {
        ok: false,
        error:
          "Formularz nie jest jeszcze podłączony — ustaw CONTACT_WEBHOOK_URL w zmiennych środowiskowych (np. adres Formspree).",
      },
      503,
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
        _subject: `[ZODARA] ${subject}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error("[contact] serwis zwrócił błąd:", res.status);
      return json(
        { ok: false, error: "Serwis formularzy zwrócił błąd. Spróbuj ponownie." },
        502,
      );
    }
  } catch (error) {
    console.error("[contact] brak połączenia:", error);
    return json(
      { ok: false, error: "Nie udało się połączyć z serwisem formularzy." },
      502,
    );
  }

  return json({ ok: true });
}
