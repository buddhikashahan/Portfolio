"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}

/**
 * Two-step delete: the first click swaps the button for an inline confirm, so
 * a stray tap in a dense table cannot destroy a row. Progressive enhancement is
 * intentionally traded away here — deletion should never be a single click.
 */
export function DeleteButton({
  action,
  id,
  label = "Delete",
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={label}
        className={cn(
          "inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition hover:border-red-500/40 hover:text-red-400",
          className,
        )}
      >
        <Trash2 className="size-3.5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <ConfirmButton label="Confirm" />
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted transition hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}
