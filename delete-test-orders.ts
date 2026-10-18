import { readFileSync } from "fs";
import { createRequire } from "module";
const REPO = "/workspace/homes/8c0a6859c38a64e5e160f331/repo";
const req = createRequire(REPO + "/package.json");
for (const file of [".env.local", ".env"]) {
  const envText = readFileSync(`${REPO}/${file}`, "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
const { PrismaClient } = req("@prisma/client");
const prisma = new PrismaClient();

// 3 zamówienia-test (nazwiska zawierające "Test"/"TEST"); NIE kasujemy AT-2026-579976 (kamil waliczek)
const IDS = [
  "cmvb5kbpi00028w2qb54wvpl6", // AT-2026-544871 TEST Symulacja
  "cmv82fydt000210llzw3tmdk3", // AT-2026-660281 Test Auto
  "cmv81lmn60002gx7cbgzs8ocp", // AT-2026-702219 Kamil Test Sklepu
];

async function main() {
  const orders = await prisma.order.findMany({
    where: { id: { in: IDS } },
    include: { customer: true, payment: true, items: true },
  });
  if (orders.length !== 3) {
    console.error("STOP: znaleziono", orders.length, "zamiast 3 — nie kasuję niczego.");
    process.exitCode = 1;
    return;
  }
  for (const o of orders) console.log("do usunięcia:", o.orderNumber, `${o.customer.firstName} ${o.customer.lastName}`, o.status, o.payment ? "+payment" : "");
  const r = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.deleteMany({ where: { orderId: { in: IDS } } });
    const it = await tx.orderItem.deleteMany({ where: { orderId: { in: IDS } } });
    const o = await tx.order.deleteMany({ where: { id: { in: IDS } } });
    return { payments: p.count, items: it.count, orders: o.count };
  });
  console.log("USUNIĘTO:", JSON.stringify(r));
  const left = await prisma.order.findMany({ select: { orderNumber: true, status: true } });
  console.log("pozostałe zamówienia:", JSON.stringify(left));
}
main().catch(e => { console.error("ERROR:", e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
