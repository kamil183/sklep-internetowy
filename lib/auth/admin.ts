/**
 * Sesja panelu administracyjnego — bezpieczny token HMAC (bez stanu po stronie
 * serwera, gotowy pod Vercel/serverless).
 *
 * Token:   "<exp_ms>.<podpis_hmac_sha256>"
 * Sekret:  AUTH_SECRET (a w ostateczności ADMIN_PASSWORD — ustaw AUTH_SECRET!).
 * Wygaśnięcie: 8 godzin; po nim ponowne logowanie.
 *
 * Konto właścicielki: login to e-mail + hasło (zmienne ADMIN_EMAIL i
 * ADMIN_PASSWORD). Gdy ADMIN_EMAIL nie jest ustawiony, sprawdzane jest samo
 * hasło (zachowanie kompatybilne wstecz).
 */

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "zodara_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 h

function sessionSecret(): string | null {
  return process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? null;
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** E-mail logowania właścicielki (pusty = logowanie samym hasłem). */
export function adminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() ?? "";
}

/** Porównanie w czasie stałym (bez wycieku przez długość/timing). */
function safeEqual(input: string, expected: string): boolean {
  const digest = (value: string) =>
    createHmac("sha256", sessionSecret() ?? expected).update(value).digest();
  return timingSafeEqual(digest(input), digest(expected));
}

/** Porównanie hasła w czasie stałym (bez wycieku przez długość/timing). */
export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

/**
 * Weryfikacja danych logowania administratora.
 *
 * Gdy ADMIN_EMAIL jest ustawiony — wymagany jest zgodny e-mail (po trim)
 * ORAZ hasło. Gdy brak ADMIN_EMAIL — liczy się samo hasło.
 * Oba porównania są wykonywane niezależnie (stały czas), by nie ujawniać,
 * który z elementów był niepoprawny.
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedEmail = adminEmail();
  const emailOk =
    expectedEmail === "" || safeEqual(email.trim(), expectedEmail);
  const passwordOk = verifyAdminPassword(password);
  if (expectedEmail === "") return passwordOk;
  return emailOk && passwordOk;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret() ?? "").update(payload).digest("hex");
}

export function createAdminSessionToken(): string {
  const exp = String(Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000);
  return `${exp}.${sign(exp)}`;
}

export function isValidAdminSessionToken(token: string | null | undefined): boolean {
  if (!token || !sessionSecret()) return false;
  const [exp, signature, ...rest] = token.split(".");
  if (!exp || !signature || rest.length > 0 || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(sign(exp), "hex"),
    );
  } catch {
    return false;
  }
}

export async function is_admin_authenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Guard dla server components / server actions panelu. */
export async function requireAdmin(): Promise<void> {
  if (!(await is_admin_authenticated())) redirect("/admin/login");
}
