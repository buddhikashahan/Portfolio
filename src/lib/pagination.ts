export const PAGE_SIZE = {
  projects: 9,
  posts: 9,
  admin: 10,
} as const;

export type SearchParams = Record<string, string | string[] | undefined>;

/** First value of a query param, trimmed; `undefined` when absent or blank. */
export function param(params: SearchParams, key: string): string | undefined {
  const raw = params[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value : undefined;
}

export type PageInfo = {
  page: number;
  pageCount: number;
  total: number;
  skip: number;
  take: number;
};

/**
 * Resolve the requested page against the real total. Out-of-range or garbage
 * values clamp to a valid page rather than rendering an empty list, so a stale
 * `?page=9` link after deleting content still lands somewhere useful.
 */
export function paginate(total: number, requested: string | undefined, size: number): PageInfo {
  const pageCount = Math.max(1, Math.ceil(total / size));
  const parsed = Number.parseInt(requested ?? "1", 10);
  const page = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), pageCount) : 1;

  return { page, pageCount, total, skip: (page - 1) * size, take: size };
}

/**
 * Build `path?query`, dropping empty values and `page=1` so canonical URLs stay
 * short and the first page never has two addresses.
 */
export function hrefWith(
  path: string,
  params: SearchParams,
  overrides: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single === undefined || single === "") continue;
    if (key === "page" && String(single) === "1") continue;
    query.set(key, String(single));
  }

  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Page numbers to render, with `null` marking a gap: 1 … 4 5 6 … 12.
 * Always shows the first, last, current and its immediate neighbours.
 */
export function pageWindow(page: number, pageCount: number): (number | null)[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);

  const result: (number | null)[] = [];
  for (const [index, p] of sorted.entries()) {
    if (index > 0 && p - sorted[index - 1] > 1) result.push(null);
    result.push(p);
  }
  return result;
}
