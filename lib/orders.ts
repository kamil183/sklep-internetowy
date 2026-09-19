import { prisma } from "@/lib/prisma";

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `AT-${year}-${rand}`;
}

export async function findValidDiscountCode(code: string, subtotalCents: number) {
  const discount = await prisma.discountCode.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!discount || !discount.isActive) return { error: "Kod rabatowy nie istnieje lub jest nieaktywny." };

  const now = new Date();
  if (discount.startsAt && now < discount.startsAt) return { error: "Ten kod nie jest jeszcze aktywny." };
  if (discount.endsAt && now > discount.endsAt) return { error: "Ten kod rabatowy wygasł." };
  if (discount.minOrderCents && subtotalCents < discount.minOrderCents) {
    return { error: `Minimalna wartość zamówienia dla tego kodu to ${(discount.minOrderCents / 100).toFixed(2)} zł.` };
  }
  if (discount.maxUses !== null) {
    const usesCount = await prisma.discountUsage.count({ where: { discountCodeId: discount.id } });
    if (usesCount >= (discount.maxUses ?? 0)) return { error: "Limit użyć tego kodu został wyczerpany." };
  }

  const discountCents =
    discount.type === "PERCENT"
      ? Math.round((subtotalCents * discount.value) / 100)
      : Math.min(discount.value, subtotalCents);

  return { discount, discountCents };
}
