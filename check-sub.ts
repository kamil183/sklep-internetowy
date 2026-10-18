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
async function main() {
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { email: "test.deploycheck@zodaraparfums.com" } });
  if (!sub) { console.log("BRAK"); process.exitCode = 1; return; }
  console.log("zapis OK:", sub.email, "| confirmed:", sub.confirmed, "| token:", sub.token.slice(0, 8) + "...");
  console.log("TOKEN=" + sub.token);
}
main().catch(e => { console.error("ERROR:", e.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
