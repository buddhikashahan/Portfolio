-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Post" ("content", "coverImage", "createdAt", "excerpt", "featured", "id", "published", "publishedAt", "slug", "tags", "title", "updatedAt") SELECT "content", "coverImage", "createdAt", "excerpt", "featured", "id", "published", "publishedAt", "slug", "tags", "title", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_published_publishedAt_idx" ON "Post"("published", "publishedAt");
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "fullName" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "taglines" TEXT NOT NULL DEFAULT '[]',
    "avatarUrl" TEXT,
    "resumeUrl" TEXT,
    "email" TEXT NOT NULL,
    "location" TEXT,
    "timezone" TEXT,
    "languages" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "whatsappUrl" TEXT,
    "twitterUrl" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "projectsCount" INTEGER NOT NULL DEFAULT 0,
    "clientsCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Profile" ("available", "avatarUrl", "bio", "clientsCount", "email", "fullName", "githubUrl", "headline", "id", "languages", "linkedinUrl", "location", "projectsCount", "resumeUrl", "tagline", "taglines", "twitterUrl", "updatedAt", "whatsappUrl", "yearsExperience") SELECT "available", "avatarUrl", "bio", "clientsCount", "email", "fullName", "githubUrl", "headline", "id", "languages", "linkedinUrl", "location", "projectsCount", "resumeUrl", "tagline", "taglines", "twitterUrl", "updatedAt", "whatsappUrl", "yearsExperience" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Web',
    "tags" TEXT NOT NULL DEFAULT '',
    "repoUrl" TEXT,
    "liveUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("category", "content", "coverImage", "createdAt", "date", "featured", "id", "liveUrl", "order", "published", "repoUrl", "slug", "summary", "tags", "title", "updatedAt") SELECT "category", "content", "coverImage", "createdAt", "date", "featured", "id", "liveUrl", "order", "published", "repoUrl", "slug", "summary", "tags", "title", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_published_date_idx" ON "Project"("published", "date");
CREATE INDEX "Project_category_idx" ON "Project"("category");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

