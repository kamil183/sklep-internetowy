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
async function main() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("WSZYSTKICH ZAMOWIEN:", orders.length);
  for (const o of orders) {
    console.log({
      id: o.id,
      nr: o.orderNumber,
      status: o.status,
      pay: o.paymentStatus,
      customer: `${o.customer.firstName} ${o.customer.lastName} <${o.customer.email}>`,
      kwota: o.totalCents,
      pozycje: o.items.map(i => `${i.quantity}x${i.unitPrice}`).join(","),
      paymentRow: o.payment ? o.payment.id : null,
      created: o.createdAt.toISOString(),
    });
  }
}
main().catch(e => { console.error("ERROR:", e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
