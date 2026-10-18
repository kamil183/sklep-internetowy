"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  confirmationEmail,
  mailerReady,
  newsletterEmail,
  sendEmail,
} from "@/lib/mailer";

export type NewsletterActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://zodaraparfums.com").replace(/\/$/, "");
}

/** Równoległość 5, żeby zmieścić się w limicie czasu funkcji na Vercel. */
const CHUNK = 5;

async function sendBatch(
  emails: { email: string; token: string }[],
  make: (s: { email: string; token: string }) => ReturnType<typeof confirmationEmail>,
): Promise<{ sent: number; failed: number; firstError: string }> {
  let sent = 0;
  let failed = 0;
  let firstError = "";
  for (let i = 0; i < emails.length; i += CHUNK) {
    const chunk = emails.slice(i, i + CHUNK);
    const results = await Promise.all(chunk.map((s) => sendEmail(make(s))));
    for (const r of results) {
      if (r.ok) sent++;
      else {
        failed++;
        if (!firstError && r.error) firstError = r.error;
      }
    }
  }
  return { sent, failed, firstError };
}

/**
 * Wyślij kampanię newslettera do WSZYSTKICH potwierdzonych subskrybentów.
 * Każda wiadomość ma własny link wypisania (RODO) — dlatego pętla, a nie „uduplikowany" odbiorca.
 */
export async function sendNewsletterAction(
  formData: FormData,
): Promise<NewsletterActionResult> {
  try {
    await requireAdmin();

    if (!mailerReady()) {
      return {
        ok: false,
        error:
          "Brak konfiguracji e-mail: ustaw RESEND_API_KEY i NOTIFICATIONS_FROM_EMAIL w Vercel (Settings → Environment Variables) i zrób redeploy.",
      };
    }

    const subject = String(formData.get("subject") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!subject || !body) return { ok: false, error: "Podaj temat i treść wiadomości." };
    if (subject.length > 200) return { ok: false, error: "Temat może mieć max 200 znaków." };
    if (body.length > 20000) return { ok: false, error: "Treść może mieć max 20 000 znaków." };

    const subs = await prisma.newsletterSubscriber.findMany({
      where: { confirmed: true, unsubscribedAt: null },
      select: { email: true, token: true },
    });
    if (subs.length === 0) {
      return {
        ok: false,
        error:
          "Brak potwierdzonych subskrybentów — najpierw muszą kliknąć „Potwierdź zapis\" w mailu aktywacyjnym.",
      };
    }

    const url = baseUrl();
    const { sent, failed, firstError } = await sendBatch(subs, (s) =>
      newsletterEmail({ email: s.email, token: s.token, baseUrl: url, subject, body }),
    );

    revalidatePath("/admin/newsletter");

    if (sent === 0 && failed > 0) return { ok: false, error: `Nie udało się wysłać żadnej wiadomości. ${firstError}` };
    if (failed > 0) return { ok: true, message: `Wysłano ${sent}, nieudanych: ${failed}. ${firstError}` };
    return { ok: true, message: `Wysłano ${sent} wiadomości do potwierdzonych subskrybentów.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Nieznany błąd serwera." };
  }
}

/**
 * Wyślij (ponownie) mail potwierdzający do zapisów bez statusu „potwierdzony".
 * Dzięki temu nikt, kto zapisał się przed uruchomieniem wysyłki, nie zostaje bez linku.
 */
export async function resendConfirmationsAction(): Promise<NewsletterActionResult> {
  try {
    await requireAdmin();

    if (!mailerReady()) {
      return {
        ok: false,
        error:
          "Brak konfiguracji e-mail: ustaw RESEND_API_KEY i NOTIFICATIONS_FROM_EMAIL w Vercel (Settings → Environment Variables) i zrób redeploy.",
      };
    }

    const subs = await prisma.newsletterSubscriber.findMany({
      where: { confirmed: false, unsubscribedAt: null },
      select: { email: true, token: true },
    });
    if (subs.length === 0) {
      return { ok: true, message: "Nie ma żadnych niepotwierdzonych zapisów — wszyscy są potwierdzeni." };
    }

    const url = baseUrl();
    const { sent, failed, firstError } = await sendBatch(subs, (s) =>
      confirmationEmail({ email: s.email, token: s.token, baseUrl: url }),
    );

    revalidatePath("/admin/newsletter");

    if (sent === 0 && failed > 0) return { ok: false, error: `Nie udało się wysłać żadnej wiadomości. ${firstError}` };
    if (failed > 0) return { ok: true, message: `Wysłano ${sent} linków potwierdzających, nieudanych: ${failed}. ${firstError}` };
    return { ok: true, message: `Wysłano ${sent} linków potwierdzających.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Nieznany błąd serwera." };
  }
}
