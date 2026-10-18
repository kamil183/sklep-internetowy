import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin";

/** POST /api/admin/logout — czyszczenie cookie sesji panelu. */
export async function POST() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
