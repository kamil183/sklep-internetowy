import { readFileSync } from "fs";
import { createRequire } from "module";
const REPO = "/workspace/homes/8c0a6859c38a64e5e160f331/repo";
const req = createRequire(REPO + "/package.json");
for (const file of [".env.local", ".env"]) {
  const t = readFileSync(`${REPO}/${file}`, "utf8");
  for (const line of t.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
const { PrismaClient } = req("@prisma/client");
const prisma = new PrismaClient();
const cmd = process.argv[2];
async function main() {
  if (cmd === "get") {
    const s = await prisma.newsletterSubscriber.findUnique({ where: { email: "test.prodcheck@zodaraparfums.com" } });
    console.log(s ? `FOUND confirmed=${s.confirmed} TOKEN=${s.token}` : "BRAK");
  } else if (cmd === "cleanup") {
    const r = await prisma.newsletterSubscriber.deleteMany({ where: { email: "test.prodcheck@zodaraparfums.com" } });
    const all = await prisma.newsletterSubscriber.findMany({ select: { email: true, confirmed: true } });
    console.log("usuniętych:", r.count, "| pozostali:", JSON.stringify(all));
  }
}
main().catch(e => { console.error("ERROR:", e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
