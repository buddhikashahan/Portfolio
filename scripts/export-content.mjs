// One-off: read the real content out of the SQLite database (prisma/dev.db)
// before switching providers, so it can be imported into Postgres. Reads the
// file directly with better-sqlite3 rather than through Prisma, since the
// generated client is now wired for Postgres. Not part of the app; run once.
import Database from "better-sqlite3";
import { writeFileSync } from "node:fs";

const db = new Database("prisma/dev.db", { readonly: true });

const data = {
  profile: db.prepare("SELECT * FROM Profile").all(),
  services: db.prepare("SELECT * FROM Service").all(),
  skillCategories: db.prepare("SELECT * FROM SkillCategory").all(),
  skills: db.prepare("SELECT * FROM Skill").all(),
  projects: db.prepare("SELECT * FROM Project").all(),
  posts: db.prepare("SELECT * FROM Post").all(),
  experiences: db.prepare("SELECT * FROM Experience").all(),
  education: db.prepare("SELECT * FROM Education").all(),
  certificates: db.prepare("SELECT * FROM Certificate").all(),
  testimonials: db.prepare("SELECT * FROM Testimonial").all(),
};

// Booleans are stored as 0/1 in SQLite; normalise to real booleans for Postgres.
const boolColumns = {
  services: ["published"],
  projects: ["featured", "published"],
  posts: ["published", "featured"],
  experiences: ["current"],
  testimonials: ["published"],
};
for (const [key, columns] of Object.entries(boolColumns)) {
  for (const row of data[key]) {
    for (const col of columns) row[col] = Boolean(row[col]);
  }
}
for (const row of data.profile) row.available = Boolean(row.available);

writeFileSync("prisma/content-export.json", JSON.stringify(data, null, 2));

for (const [key, rows] of Object.entries(data)) {
  console.log(`- ${key}: ${rows.length}`);
}
console.log("\nWrote prisma/content-export.json");

db.close();
