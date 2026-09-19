"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}

export async function createDiscountCode(formData: FormData) {
  "use server";
  await requireAdmin();

  const code = (formData.get("code") as string).toUpperCase().trim();
  const type = formData.get("type") as "PERCENT" | "FIXED_AMOUNT";
  const rawValue = parseFloat(formData.get("value") as string);
  const value = type === "PERCENT" ? Math.round(rawValue) : Math.round(rawValue * 100);
  const startsAt = formData.get("startsAt") ? new Date(formData.get("startsAt") as string) : null;
  const endsAt = formData.get("endsAt") ? new Date(formData.get("endsAt") as string) : null;
  const maxUses = formData.get("maxUses") ? parseInt(formData.get("maxUses") as string, 10) : null;
  const minOrder = formData.get("minOrder") ? Math.round(parseFloat(formData.get("minOrder") as string) * 100) : null;

  await prisma.discountCode.create({
    data: { code, type, value, startsAt, endsAt, maxUses, minOrderCents: minOrder },
  });

  revalidatePath("/admin/discounts");
}

export async function toggleDiscountActive(discountId: string, isActive: boolean) {
  "use server";
  await requireAdmin();
  await prisma.discountCode.update({ where: { id: discountId }, data: { isActive } });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscountCode(discountId: string) {
  "use server";
  await requireAdmin();
  await prisma.discountCode.delete({ where: { id: discountId } });
  revalidatePath("/admin/discounts");
}
