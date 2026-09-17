// Run once, against the Postgres database, after `prisma migrate deploy`:
//   npx tsx scripts/import-content.ts
// Loads prisma/content-export.json (the real content pulled from the old
// SQLite database) and upserts it. Safe to re-run — it syncs to the JSON
// rather than only inserting once. Does not touch User; run
// `npx tsx scripts/seed-admin.ts` separately for that.
import "dotenv/config";
import { readFileSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const data = JSON.parse(
  readFileSync(new URL("../prisma/content-export.json", import.meta.url), "utf-8"),
);

async function main() {
  if (data.profile[0]) {
    const { id, ...fields } = data.profile[0];
    await prisma.profile.upsert({ where: { id }, update: fields, create: { id, ...fields } });
    console.log("- Profile synced");
  }

  for (const { id, ...fields } of data.services) {
    await prisma.service.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(`- ${data.services.length} services synced`);

  for (const { id, ...fields } of data.skillCategories) {
    await prisma.skillCategory.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  for (const { id, ...fields } of data.skills) {
    await prisma.skill.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(
    `- ${data.skillCategories.length} skill categories, ${data.skills.length} skills synced`,
  );

  // Prisma accepts ISO date strings directly for DateTime fields, so the
  // exported createdAt/updatedAt/date/etc. strings pass through as-is.
  for (const { id, ...fields } of data.projects) {
    await prisma.project.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(`- ${data.projects.length} projects synced`);

  for (const { id, ...fields } of data.posts) {
    await prisma.post.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(`- ${data.posts.length} posts synced`);

  for (const { id, ...fields } of data.experiences) {
    await prisma.experience.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(`- ${data.experiences.length} experience entries synced`);

  for (const { id, ...fields } of data.education) {
    await prisma.education.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(`- ${data.education.length} education entries synced`);

  for (const { id, ...fields } of data.certificates) {
    await prisma.certificate.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(`- ${data.certificates.length} certificates synced`);

  for (const { id, ...fields } of data.testimonials) {
    await prisma.testimonial.upsert({ where: { id }, update: fields, create: { id, ...fields } });
  }
  console.log(`- ${data.testimonials.length} testimonials synced`);

  console.log("\nContent import complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
