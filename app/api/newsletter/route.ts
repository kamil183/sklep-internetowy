import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { confirmationEmail, sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";

const CONSENT_TEXT =
  "Zgadzam się na otrzymywanie newslettera ZODARA PARFUMS (informacje o produktach, premierach i promocjach) na podany adres e-mail. Wiem, że mogę wycofać zgodę w każdej chwili przez link „wypisz się” w każdej wiadomości.";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Podaj poprawny adres e-mail"),
  // Musi być jawnie zaznaczone — brak checkboxa = brak zgody = brak zapisu (RODO).
  consent: z.literal(true),
  source: z.string().trim().max(32).optional(),
});

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "").trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" },
      { status: 400 },
    );
  }

  const { email, source } = parsed.data;

  try {
    // Upsert: ponowny zapis tego samego adresu nie rzuca błędu.
    // Jeśli ktoś wypisał się i wraca — przywracamy subskrypcję (nowa zgoda).
    const sub = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        consentIp: clientIp(req),
        consentText: CONSENT_TEXT,
        source: source && ["footer", "checkout", "popup"].includes(source) ? source : "footer",
      },
      update: {
        consentIp: clientIp(req),
        consentAt: new Date(),
        consentText: CONSENT_TEXT,
        unsubscribedAt: null,
      },
    });

    // Double opt-in: wyślij link potwierdzający (bezpiecznie dla zapisu —
    // jeśli e-mail nie wyjdzie, subskrypcja i tak zostaje, a przyczynę logujemy).
    if (!sub.confirmed) {
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin).replace(/\/$/, "");
      const result = await sendEmail(
        confirmationEmail({ email: sub.email, token: sub.token, baseUrl }),
      );
      if (!result.ok) {
        console.error("[newsletter] nie wysłano maila potwierdzającego:", result.error);
      }
    }

    // Nie zdradzamy, czy adres już istniał (ochrona danych — odpowiedź zawsze taka sama).
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[newsletter] subscribe failed", e);
    return NextResponse.json({ error: "Nie udało się zapisać. Spróbuj ponownie." }, { status: 500 });
  }
}

// GET z tokenem = potwierdzenie (double opt-in) albo wypis, zależnie od parametru.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const action = req.nextUrl.searchParams.get("action"); // "confirm" | "unsubscribe"
  if (!token || !action || !["confirm", "unsubscribe"].includes(action)) {
    return NextResponse.json({ error: "Nieprawidłowy link" }, { status: 400 });
  }

  try {
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { token } });
    if (!sub) {
      return NextResponse.json({ error: "Link wygasł lub jest nieprawidłowy" }, { status: 404 });
    }

    if (action === "confirm") {
      await prisma.newsletterSubscriber.update({
        where: { token },
        data: { confirmed: true, confirmedAt: new Date() },
      });
      return NextResponse.redirect(new URL("/newsletter/dziekujemy", req.url), 303);
    }

    // unsubscribe — idempotentny
    await prisma.newsletterSubscriber.update({
      where: { token },
      data: { unsubscribedAt: sub.unsubscribedAt ?? new Date() },
    });
    return NextResponse.redirect(new URL("/newsletter/wypisano", req.url), 303);
  } catch (e) {
    console.error("[newsletter] token action failed", e);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
