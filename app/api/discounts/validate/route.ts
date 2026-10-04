import { NextRequest, NextResponse } from "next/server";
import { findValidDiscountCode } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const { code, subtotalCents } = await req.json();
  if (!code || typeof subtotalCents !== "number") {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  const result = await findValidDiscountCode(code, subtotalCents);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ discountCents: result.discountCents });
}
