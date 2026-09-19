/**
 * Creates (or updates) an admin account. This is intentionally the ONLY way
 * to create an AdminUser row — there is no public sign-up endpoint in the
 * app, so a customer can never grant themselves admin access.
 *
 * Run from a trusted machine with access to your production DATABASE_URL:
 *
 *   npm run create-admin -- --email=agata@example.com --password="hasło123!" --name="Agata"
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function getArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg?.split("=").slice(1).join("=");
}

async function main() {
  const email = getArg("email");
  const password = getArg("password");
  const name = getArg("name") ?? "Właścicielka sklepu";

  if (!email || !password) {
    console.error('Użycie: npm run create-admin -- --email=you@example.com --password="silne-haslo" --name="Twoje imię"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Hasło musi mieć co najmniej 8 znaków.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name },
    create: { email: email.toLowerCase(), passwordHash, name, role: "OWNER" },
  });

  console.log(`✓ Konto administratora gotowe: ${admin.email} (rola: ${admin.role})`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
