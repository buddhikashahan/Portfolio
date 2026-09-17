"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Returns a function that rewrites one query param and navigates. Any filter
 * change resets `page`, since page 3 of the old result set is meaningless for
 * the new one.
 */
function useSetParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");

    const qs = next.toString();
    startTransition(() => {
      // replace, not push: typing a search should not add a history entry per keystroke.
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return { setParam, pending, current: (key: string) => searchParams.get(key) ?? "" };
}

export function SearchInput({
  param = "q",
  placeholder = "Search…",
  className,
}: {
  param?: string;
  placeholder?: string;
  className?: string;
}) {
  const { setParam, pending, current } = useSetParam();
  const [value, setValue] = useState(current(param));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function update(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    // Debounced so the server renders once per pause, not once per keystroke.
    timer.current = setTimeout(() => setParam(param, next.trim() || undefined), 300);
  }

  return (
    <div className={cn("relative", className)}>
      {pending ? (
        <Loader2
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-ink-subtle"
          aria-hidden
        />
      ) : (
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden
        />
      )}
      <input
        type="search"
        value={value}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-hairline bg-surface py-2.5 pr-9 pl-9 text-sm text-ink transition outline-none placeholder:text-ink-subtle focus:border-accent/60 focus:ring-2 focus:ring-accent/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => update("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-ink-subtle hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function ParamSelect({
  param,
  options,
  defaultValue,
  label,
  className,
}: {
  param: string;
  options: SelectOption[];
  /** Value that means "no filter"; it is removed from the URL when chosen. */
  defaultValue: string;
  label: string;
  className?: string;
}) {
  const { setParam, current } = useSetParam();

  return (
    <Select
      value={current(param) || defaultValue}
      onChange={(next) => setParam(param, next === defaultValue ? undefined : next)}
      options={options}
      aria-label={label}
      className={className}
    />
  );
}
