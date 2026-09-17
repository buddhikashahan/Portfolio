"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/field";
import { parseRepos } from "@/lib/utils";

type Row = { key: string; label: string; url: string };
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

let keySeed = 0;
function nextKey() {
  keySeed += 1;
  return `link-${keySeed}`;
}

function toRows(defaultValue: string | null | undefined): Row[] {
  return parseRepos(defaultValue).map((link) => ({ ...link, key: nextKey() }));
}

/**
 * Add, label and remove an arbitrary list of `{ label, url }` links — used for
 * both a project's repositories and its live deployments, since a project can
 * just as easily have a production site, a staging environment and a demo
 * video as it can a frontend repo, a backend repo and a published package.
 *
 * Local state stays the source of truth and is serialised into one hidden
 * JSON input on every change, so the surrounding form submits it like any
 * other field; the server re-validates that JSON independently. Storage shape
 * and validation are shared with the repos field (see `reposFromForm` in
 * `lib/validations`), so this reuses `parseRepos` to read either one back.
 */
export function LinkListField({
  name,
  defaultValue,
  error,
  icon: Icon,
  labelPlaceholder = "Label",
  urlPlaceholder = "https://…",
  emptyText = "None linked yet.",
  helpText,
}: {
  name: string;
  defaultValue?: string | null;
  error?: string;
  icon: IconComponent;
  labelPlaceholder?: string;
  urlPlaceholder?: string;
  emptyText?: string;
  helpText: string;
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(defaultValue));

  function update(key: string, patch: Partial<Omit<Row, "key">>) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function remove(key: string) {
    setRows((prev) => prev.filter((row) => row.key !== key));
  }

  function add() {
    setRows((prev) => [...prev, { key: nextKey(), label: "", url: "" }]);
  }

  const serialized = JSON.stringify(
    rows.map(({ label, url }) => ({ label: label.trim(), url: url.trim() })),
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={serialized} />

      {rows.length > 0 ? (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.key} className="flex items-start gap-2">
              <Icon className="mt-3 size-4 shrink-0 text-ink-subtle" aria-hidden />
              <Input
                value={row.label}
                onChange={(event) => update(row.key, { label: event.target.value })}
                placeholder={labelPlaceholder}
                aria-label="Link label"
                className="w-32 shrink-0 sm:w-40"
              />
              <Input
                value={row.url}
                onChange={(event) => update(row.key, { url: event.target.value })}
                placeholder={urlPlaceholder}
                aria-label="Link URL"
                className="min-w-0 flex-1 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => remove(row.key)}
                aria-label={`Remove ${row.label || "this link"}`}
                className="mt-1 inline-grid size-8 shrink-0 place-items-center rounded-lg text-ink-subtle transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-ink-subtle">{emptyText}</p>
      )}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-hairline-strong px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
      >
        <Plus className="size-3.5" />
        Add
      </button>

      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink-subtle">{helpText}</p>
      )}
    </div>
  );
}
