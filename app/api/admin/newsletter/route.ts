import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Eksport CSV subskrybentów (dla zewnętrznego narzędzia do wysyłki, np. MailerLite).
// Zabezpieczone sesją admina; bez niej 401. W eksport idzie dowód zgody.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const all = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const esc = (v: string | number | boolean | null | undefined | Date) =>
    `"${String(v ?? "").replace(/"/g, '""')}"`;

  const header = "email,consent_at,confirmed,confirmed_at,unsubscribed_at,consent_ip,consent_text,source";
  const body = all.map((s) =>
    [
      s.email,
      s.consentAt.toISOString(),
      s.confirmed ? "yes" : "no",
      s.confirmedAt ? s.confirmedAt.toISOString() : "",
      s.unsubscribedAt ? s.unsubscribedAt.toISOString() : "",
      s.consentIp ?? "",
      s.consentText,
      s.source,
    ]
      .map(esc)
      .join(","),
  );

  return new NextResponse("\uFEFF" + [header, ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-zgody-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
