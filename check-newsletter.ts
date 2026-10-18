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
  const all = await prisma.newsletterSubscriber.findMany({
    select: { email: true, confirmed: true, unsubscribedAt: true, source: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("łącznie:", all.length,
    "| potwierdzone:", all.filter(s => s.confirmed && !s.unsubscribedAt).length,
    "| niepotwierdzone:", all.filter(s => !s.confirmed).length,
    "| wypisane:", all.filter(s => s.unsubscribedAt).length);
  for (const s of all.slice(0, 10)) console.log(" ", s.email, s.confirmed ? "✔" : "—", s.unsubscribedAt ? "(wypisany)" : "", s.source, s.createdAt.toISOString().slice(0,10));
}
main().catch(e => { console.error("ERROR:", e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
