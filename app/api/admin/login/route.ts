import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  isAdminPasswordConfigured,
  verifyAdminCredentials,
} from "@/lib/auth/admin";

/** POST /api/admin/login — uwierzytelnianie konta właścicielki (e-mail + hasło). */
export async function POST(req: Request) {
  if (!isAdminPasswordConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Brak zmiennej ADMIN_PASSWORD w środowisku — ustaw hasło panelu (Vercel → Settings → Environment Variables).",
      },
      { status: 503 },
    );
  }

  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Nieprawidłowe żądanie." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!password || !verifyAdminCredentials(email, password)) {
    return NextResponse.json(
      { ok: false, error: "Nieprawidłowy e-mail lub hasło." },
      { status: 401 },
    );
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
