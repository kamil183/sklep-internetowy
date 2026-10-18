import { readFileSync } from "fs";
import { createRequire } from "module";

const REPO = "/workspace/homes/8c0a6859c38a64e5e160f331/repo";
const req = createRequire(REPO + "/package.json");

// wczytaj env: .env.local (produkcyjny Supabase) pierwszy, potem .env — bez drukowania wartości
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
    where: { customer: { email: "test.symulacja@zodaraparfums.com" } },
    include: { customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  console.log("znalezione zamowienia:", orders.length);
  for (const o of orders) {
    console.log({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.total,
      deliveryMethod: o.deliveryMethod,
      stripeSessionId: o.stripeSessionId ? o.stripeSessionId.slice(0, 24) + "..." : null,
      items: o.items.map(
        (i: { product: { name: string | null }; quantity: number; unitPrice: number }) =>
          `${i.product.name} x${i.quantity} ${i.unitPrice}`,
      ),
      createdAt: o.createdAt,
    });
  }
}

main()
  .catch((e) => { console.error("ERROR:", e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
