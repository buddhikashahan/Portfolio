-- Projects can now link multiple repositories, each with its own label (e.g.
-- a frontend repo, a backend repo and a published npm package for the same
-- project), instead of a single unlabelled GitHub URL. The category list was
-- also reorganised around how the work actually breaks down (Full-Stack,
-- Frontend, Backend, Mobile, Desktop, AI & Data, Tools for npm
-- packages/libraries), so existing rows are remapped onto the closest new
-- category rather than being left with a value no longer offered.
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
    "liveUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Project" (
  "id", "slug", "title", "summary", "content", "coverImage", "category", "tags",
  "repos", "liveUrl", "featured", "published", "order", "date", "createdAt", "updatedAt"
)
SELECT
  "id", "slug", "title", "summary", "content", "coverImage",
  CASE
    WHEN "category" = 'Web' THEN 'Full-Stack'
    WHEN "category" IN ('AI/ML', 'Data') THEN 'AI & Data'
    ELSE "category"
  END,
  "tags",
  CASE
    WHEN "repoUrl" IS NOT NULL AND trim("repoUrl") <> ''
      THEN '[{"label":"GitHub","url":"' || replace(replace("repoUrl", '\', '\'), '"', '\"') || '"}]'
    ELSE '[]'
  END,
  "liveUrl", "featured", "published", "order", "date", "createdAt", "updatedAt"
FROM "Project";

DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_published_date_idx" ON "Project"("published", "date");
CREATE INDEX "Project_category_idx" ON "Project"("category");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
