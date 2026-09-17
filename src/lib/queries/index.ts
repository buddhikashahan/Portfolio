import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, paginate } from "@/lib/pagination";

/**
 * Read-side data access for the public site. Each function is wrapped in
 * React `cache` so a value fetched by the page and by `generateMetadata`
 * costs a single query per request.
 */

export const getProfile = cache(async () => {
  return prisma.profile.findUnique({ where: { id: "singleton" } });
});

export const getServices = cache(async () => {
  return prisma.service.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
});

export const getSkillCategories = cache(async () => {
  return prisma.skillCategory.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      skills: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });
});

export type ProjectSort = "new" | "old" | "az" | "za";

const PROJECT_ORDER: Record<ProjectSort, Prisma.ProjectOrderByWithRelationInput[]> = {
  new: [{ date: "desc" }],
  old: [{ date: "asc" }],
  az: [{ title: "asc" }],
  za: [{ title: "desc" }],
};

/**
 * One page of published projects. Filtering happens in the database so the
 * page count stays correct however large the catalogue grows.
 */
// Not wrapped in `cache`: it keys on argument identity, so a fresh options
// object per call would never hit it, and this runs once per request anyway.
export async function getProjectsPage(options: {
  category?: string;
  q?: string;
  sort?: string;
  page?: string;
}) {
  const sort: ProjectSort =
    options.sort && options.sort in PROJECT_ORDER ? (options.sort as ProjectSort) : "new";

  const where: Prisma.ProjectWhereInput = {
    published: true,
    ...(options.category ? { category: options.category } : {}),
    ...(options.q
      ? {
          OR: [
            { title: { contains: options.q, mode: "insensitive" as const } },
            { summary: { contains: options.q, mode: "insensitive" as const } },
            { tags: { contains: options.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const total = await prisma.project.count({ where });
  const info = paginate(total, options.page, PAGE_SIZE.projects);

  const items = await prisma.project.findMany({
    where,
    orderBy: PROJECT_ORDER[sort],
    skip: info.skip,
    take: info.take,
  });

  return { items, info, sort };
}

export const getRelatedProjects = cache(async (slug: string, category: string, take = 3) => {
  // Same category first, then fill with the most recent work.
  const sameCategory = await prisma.project.findMany({
    where: { published: true, category, slug: { not: slug } },
    orderBy: { date: "desc" },
    take,
  });

  if (sameCategory.length >= take) return sameCategory;

  const filler = await prisma.project.findMany({
    where: {
      published: true,
      slug: { not: slug },
      id: { notIn: sameCategory.map((project) => project.id) },
    },
    orderBy: { date: "desc" },
    take: take - sameCategory.length,
  });

  return [...sameCategory, ...filler];
});

export const getFeaturedProjects = cache(async (take = 3) => {
  const featured = await prisma.project.findMany({
    where: { published: true, featured: true },
    orderBy: [{ order: "asc" }, { date: "desc" }],
    take,
  });

  if (featured.length >= take) return featured;

  // Top up with the most recent published work so the home page never looks
  // empty just because nothing has been flagged as featured yet.
  const filler = await prisma.project.findMany({
    where: { published: true, id: { notIn: featured.map((p) => p.id) } },
    orderBy: [{ date: "desc" }],
    take: take - featured.length,
  });

  return [...featured, ...filler];
});

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({ where: { slug, published: true } });
});

export const getPublishedProjectSlugs = cache(async () => {
  return prisma.project.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
});

/**
 * Tags are stored as "A, B, C". Four patterns match one tag exactly — as the
 * only tag, first, last, or in the middle — so filtering by "React" does not
 * also match "React Native".
 */
function tagWhere(tag: string): Prisma.PostWhereInput {
  return {
    OR: [
      { tags: tag },
      { tags: { startsWith: `${tag},` } },
      { tags: { endsWith: `, ${tag}` } },
      { tags: { contains: `, ${tag},` } },
    ],
  };
}

/**
 * One page of published posts. On the unfiltered first page the newest
 * featured post is returned separately (to render as a hero card) and excluded
 * from the grid, so it never appears twice.
 */
export async function getPostsPage(options: { tag?: string; q?: string; page?: string }) {
  const filtered = Boolean(options.tag || options.q);

  // Excluded from the grid on every page (so pagination stays consistent) but
  // rendered only on page 1.
  const featured = filtered
    ? null
    : await prisma.post.findFirst({
        where: { published: true, featured: true },
        orderBy: { publishedAt: "desc" },
      });

  const where: Prisma.PostWhereInput = {
    published: true,
    ...(featured ? { id: { not: featured.id } } : {}),
    AND: [
      ...(options.tag ? [tagWhere(options.tag)] : []),
      ...(options.q
        ? [
            {
              OR: [
                { title: { contains: options.q, mode: "insensitive" as const } },
                { excerpt: { contains: options.q, mode: "insensitive" as const } },
                { tags: { contains: options.q, mode: "insensitive" as const } },
              ],
            },
          ]
        : []),
    ],
  };

  const total = await prisma.post.count({ where });
  const info = paginate(total, options.page, PAGE_SIZE.posts);

  const items = await prisma.post.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    skip: info.skip,
    take: info.take,
  });

  return { items, info, featured: info.page === 1 ? featured : null };
}

export const getRecentPosts = cache(async (take = 3) => {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
  });
});

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({ where: { slug, published: true } });
});

export const getPublishedPostSlugs = cache(async () => {
  return prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
});

export const getRelatedPosts = cache(async (slug: string, take = 2) => {
  return prisma.post.findMany({
    where: { published: true, slug: { not: slug } },
    orderBy: [{ publishedAt: "desc" }],
    take,
  });
});

export const getExperiences = cache(async () => {
  return prisma.experience.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });
});

export const getEducation = cache(async () => {
  return prisma.education.findMany({
    orderBy: [{ order: "asc" }, { startYear: "desc" }],
  });
});

export const getCertificates = cache(async () => {
  return prisma.certificate.findMany({
    orderBy: [{ order: "asc" }, { year: "desc" }],
  });
});

export const getTestimonials = cache(async () => {
  return prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
});

/** Distinct tag list across published posts, for the blog filter chips. */
export const getPostTags = cache(async () => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { tags: true },
  });

  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags.split(",")) {
      const trimmed = tag.trim();
      if (trimmed) tags.add(trimmed);
    }
  }

  return [...tags].sort((a, b) => a.localeCompare(b));
});

export const getProjectCategories = cache(async () => {
  const rows = await prisma.project.findMany({
    where: { published: true },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return rows.map((row) => row.category);
});
