-- Projects can now list multiple live links (a production site, a staging
-- environment, a demo video), each with its own label, the same way multiple
-- repositories already work — so `liveUrl` becomes `liveUrls`, a JSON array of
-- `{ label, url }`. The contact form's "Budget" field is also removed, so
-- `Message.budget` is dropped.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Full-Stack',
    "tags" TEXT NOT NULL DEFAULT '',
    "repos" TEXT NOT NULL DEFAULT '[]',
    "liveUrls" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Project" (
  "id", "slug", "title", "summary", "content", "coverImage", "category", "tags",
  "repos", "liveUrls", "featured", "published", "order", "date", "createdAt", "updatedAt"
)
SELECT
  "id", "slug", "title", "summary", "content", "coverImage", "category", "tags", "repos",
  CASE
    WHEN "liveUrl" IS NOT NULL AND trim("liveUrl") <> ''
      THEN '[{"label":"Live site","url":"' || replace(replace("liveUrl", '\', '\'), '"', '\"') || '"}]'
    ELSE '[]'
  END,
  "featured", "published", "order", "date", "createdAt", "updatedAt"
FROM "Project";

DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_published_date_idx" ON "Project"("published", "date");
CREATE INDEX "Project_category_idx" ON "Project"("category");

CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "projectType" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_Message" (
  "id", "name", "email", "company", "projectType", "message", "read", "archived", "createdAt"
)
SELECT
  "id", "name", "email", "company", "projectType", "message", "read", "archived", "createdAt"
FROM "Message";

DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_archived_createdAt_idx" ON "Message"("archived", "createdAt");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
