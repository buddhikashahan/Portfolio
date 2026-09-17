import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Comma-separated DB column <-> string[] at the edges of the data layer. */
export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}


export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export type RepoLink = { label: string; url: string };

function isRepoLink(value: unknown): value is RepoLink {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as RepoLink).label === "string" &&
    typeof (value as RepoLink).url === "string"
  );
}

/** `Project.repos` JSON column <-> a typed list, at the edges of the data layer. */
export function parseRepos(value: string | null | undefined): RepoLink[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isRepoLink) : [];
  } catch {
    return [];
  }
}

export function formatDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
) {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(value);
}

export function formatDateRange(start: Date, end: Date | null, current: boolean) {
  const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" };
  const from = formatDate(start, opts);
  const to = current ? "Present" : end ? formatDate(end, opts) : "Present";
  return `${from} — ${to}`;
}

/** Rough reading time, matching the ~200 wpm convention used by most blogs. */
export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function truncate(text: string, length = 160) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

/** Input value helper: <input type="date"> wants `yyyy-mm-dd`. */
export function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return value.toISOString().slice(0, 10);
}

