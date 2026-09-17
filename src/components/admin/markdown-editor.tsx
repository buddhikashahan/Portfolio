"use client";

import { useState } from "react";

import { Markdown } from "@/components/site/markdown";
import { Textarea } from "@/components/ui/field";
import { cn, readingTime } from "@/lib/utils";

/**
 * Markdown body with Write / Preview tabs. The preview uses the exact renderer
 * the public site uses, so what you see here is what gets published.
 */
export function MarkdownEditor({
  name,
  id,
  defaultValue = "",
  rows = 18,
  placeholder,
}: {
  name: string;
  id: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-sunken px-2">
        <div role="tablist" aria-label="Editor mode" className="flex">
          {(["write", "preview"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={tab === mode}
              onClick={() => setTab(mode)}
              className={cn(
                "-mb-px border-b-2 px-3 py-2.5 text-sm capitalize transition-colors",
                tab === mode
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-muted hover:text-ink",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
        <span className="pr-2 font-mono text-xs text-ink-subtle">
          {words} words · {readingTime(value)} min read
        </span>
      </div>

      {/* The textarea stays mounted (just hidden) so its value is always
          submitted, even if the form is saved from the Preview tab. */}
      <Textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        hidden={tab !== "write"}
        className="rounded-none border-0 font-mono text-[0.8rem] leading-relaxed focus:ring-0"
      />

      {tab === "preview" ? (
        <div className="min-h-64 bg-surface px-5 py-4">
          {value.trim() ? (
            <Markdown content={value} />
          ) : (
            <p className="text-sm text-ink-subtle">Nothing to preview yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
