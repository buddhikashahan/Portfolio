import Link from "next/link";

import { hrefWith, type SearchParams } from "@/lib/pagination";
import { cn } from "@/lib/utils";

type ChipOption = string | { value: string; label: string; count?: number };

/**
 * Filter tabs as plain links. Choosing one keeps the other active filters,
 * resets to page 1, and — being a link — works without JavaScript.
 */
export function FilterChips({
  path,
  params,
  param,
  options,
  allLabel = "All",
  allCount,
  label,
}: {
  path: string;
  params: SearchParams;
  param: string;
  options: ChipOption[];
  allLabel?: string;
  allCount?: number;
  label: string;
}) {
  const active = typeof params[param] === "string" ? params[param] : undefined;

  const items = [
    { value: undefined as string | undefined, label: allLabel, count: allCount },
    ...options.map((option) =>
      typeof option === "string" ? { value: option, label: option, count: undefined } : option,
    ),
  ];

  return (
    <nav aria-label={label} className="no-scrollbar -mx-1 overflow-x-auto px-1">
      <ul className="flex gap-1">
        {items.map((item) => {
          const selected = item.value === active;
          return (
            <li key={item.label}>
              <Link
                href={hrefWith(path, params, { [param]: item.value, page: undefined })}
                aria-current={selected ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                  selected
                    ? "bg-surface-raised font-medium text-ink"
                    : "text-ink-muted hover:bg-surface hover:text-ink",
                )}
              >
                {item.label}
                {item.count !== undefined ? (
                  <span className="font-mono text-xs text-ink-subtle tabular-nums">{item.count}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
