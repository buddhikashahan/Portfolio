import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { hrefWith, pageWindow, type PageInfo, type SearchParams } from "@/lib/pagination";
import { cn } from "@/lib/utils";

/**
 * Link-based pagination. Every page is a real URL, so it is crawlable,
 * shareable, works without JavaScript, and the back button behaves.
 * Existing filters in `params` are carried across pages.
 */
export function Pagination({
  info,
  path,
  params,
  /** Plural noun for the items, e.g. "projects"; singularised when total is 1. */
  label = "results",
  className,
}: {
  info: PageInfo;
  path: string;
  params: SearchParams;
  label?: string;
  className?: string;
}) {
  const { page, pageCount, total, skip, take } = info;

  if (total === 0) return null;

  const from = skip + 1;
  const to = Math.min(skip + take, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-4 border-t border-hairline pt-6 sm:flex-row",
        className,
      )}
    >
      <p className="font-mono text-xs text-ink-subtle">
        {from}–{to} of {total} {total === 1 ? label.replace(/s$/, "") : label}
      </p>

      {pageCount > 1 ? (
        <ul className="flex items-center gap-1">
          <li>
            <PageLink
              href={hrefWith(path, params, { page: page - 1 })}
              disabled={page === 1}
              label="Previous page"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </PageLink>
          </li>

          {pageWindow(page, pageCount).map((p, index) =>
            p === null ? (
              <li key={`gap-${index}`} aria-hidden className="px-1.5 text-sm text-ink-subtle">
                …
              </li>
            ) : (
              <li key={p}>
                <PageLink
                  href={hrefWith(path, params, { page: p })}
                  current={p === page}
                  label={`Page ${p}`}
                >
                  {p}
                </PageLink>
              </li>
            ),
          )}

          <li>
            <PageLink
              href={hrefWith(path, params, { page: page + 1 })}
              disabled={page === pageCount}
              label="Next page"
            >
              <ChevronRight className="size-4" aria-hidden />
            </PageLink>
          </li>
        </ul>
      ) : null}
    </nav>
  );
}

function PageLink({
  href,
  current = false,
  disabled = false,
  label,
  children,
}: {
  href: string;
  current?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const classes =
    "inline-grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm tabular-nums transition-colors";

  if (disabled) {
    return (
      <span aria-disabled className={cn(classes, "text-ink-subtle/50")}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      scroll
      className={cn(
        classes,
        current
          ? "bg-ink font-medium text-canvas"
          : "text-ink-muted hover:bg-surface-raised hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
