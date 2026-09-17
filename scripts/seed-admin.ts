// Run once, against the Postgres database, after `prisma migrate deploy`:
//   npx tsx scripts/seed-admin.ts
// Creates (or updates the name of) the dashboard admin account from
// ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME. Unlike `prisma/seed.ts`, it does
// not insert any sample content — production data comes from
// scripts/import-content.ts instead.
import "dotenv/config";

import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
