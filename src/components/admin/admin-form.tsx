"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, Loader2, Save, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFormAction } from "@/hooks/use-form-action";
import type { FormState } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

export function SubmitButton({
  pending,
  label = "Save changes",
  pendingLabel = "Saving…",
  size = "md",
}: {
  pending: boolean;
  label?: string;
  pendingLabel?: string;
  size?: "sm" | "md";
}) {
  return (
    <Button type="submit" size={size} disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        <>
          <Save className="size-4" aria-hidden />
          {label}
        </>
      )}
    </Button>
  );
}

export function FormMessage({
  state,
  compact = false,
}: {
  state: FormState;
  compact?: boolean;
}) {
  if (state.status === "idle" || !state.message) return null;

  const success = state.status === "success";
  const Icon = success ? CheckCircle2 : TriangleAlert;

  return (
    <p
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 text-sm",
        compact ? "" : "rounded-lg border p-3",
        success
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
        compact && "bg-transparent",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      {state.message}
    </p>
  );
}

/** Groups related fields under a heading inside a form panel. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="panel rounded-card p-5 sm:p-6">
      <h2 className="font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

type AdminFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: (state: FormState) => ReactNode;
  submitLabel?: string;
  cancelHref?: string;
};

/**
 * The shared shell for full-page dashboard editors.
 *
 * The save bar is sticky to the bottom of the viewport, so on a long editor the
 * Save button and the result of the last save are always visible — nobody has
 * to scroll to the end of a case study to find out whether it saved.
 */
export function AdminForm({ action, children, submitLabel, cancelHref }: AdminFormProps) {
  const { state, formAction, pending, onSubmit } = useFormAction(action);

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-6">
      {children(state)}

      <div className="panel-blur sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-card px-4 py-3 shadow-popover">
        <div className="min-w-0 flex-1" aria-live="polite">
          {state.status === "idle" ? (
            <p className="text-sm text-ink-subtle">Changes go live when you save.</p>
          ) : (
            <FormMessage state={state} compact />
          )}
        </div>

        <div className="flex items-center gap-2">
          {cancelHref ? (
            <Link
              href={cancelHref}
              className="rounded-lg px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
            >
              Cancel
            </Link>
          ) : null}
          <SubmitButton pending={pending} label={submitLabel} />
        </div>
      </div>
    </form>
  );
}
