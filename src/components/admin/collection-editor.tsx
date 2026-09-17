"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, X } from "lucide-react";

import { FormMessage, SubmitButton } from "@/components/admin/admin-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { useFormAction } from "@/hooks/use-form-action";
import type { FormState } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

type FieldsRenderer = (state: FormState) => ReactNode;

/**
 * Collapsible "add new" panel. Most collection pages are lists of short
 * records, so a full create route would be more navigation than the task
 * deserves — this keeps creation on the same screen as the list.
 */
export function AddPanel({
  action,
  label,
  fields,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  label: string;
  fields: FieldsRenderer;
}) {
  const [open, setOpen] = useState(false);
  const { state, formAction, pending, onSubmit } = useFormAction(action);
  const [seenState, setSeenState] = useState(state);

  // Collapse once the server confirms the record was created. Adjusting state
  // during render (rather than in an effect) avoids a second paint with the
  // panel still open — React re-runs this component before committing.
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setOpen(false);
  }

  return (
    <div className="panel rounded-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="flex items-center gap-2.5 font-medium text-ink">
          <span className="inline-grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
            <Plus className="size-4" aria-hidden />
          </span>
          {label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-ink-subtle transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <form
              action={formAction}
              onSubmit={onSubmit}
              className="space-y-5 border-t border-hairline p-5"
            >
              {fields(state)}
              <FormMessage state={state} />
              <div className="flex items-center gap-3">
                <SubmitButton pending={pending} label="Add" pendingLabel="Adding…" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-hairline px-5 py-2.5 text-sm text-ink-muted transition hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * A list row that flips between a read-only summary and an inline edit form.
 * Keeping both states on one screen means reordering or fixing a typo never
 * costs a page load.
 */
export function EditableCard({
  id,
  title,
  subtitle,
  meta,
  badges,
  updateAction,
  deleteAction,
  fields,
}: {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  updateAction: (state: FormState, formData: FormData) => Promise<FormState>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  fields: FieldsRenderer;
}) {
  const [editing, setEditing] = useState(false);
  const { state, formAction, pending, onSubmit } = useFormAction(updateAction);
  const [seenState, setSeenState] = useState(state);

  // Same render-phase adjustment as AddPanel: close the editor as soon as the
  // save succeeds, without an extra committed frame.
  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "success") setEditing(false);
  }

  return (
    <div className="panel rounded-card">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-ink">{title}</h3>
            {badges}
          </div>
          {subtitle ? (
            <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
          ) : null}
          {meta ? <div className="mt-2">{meta}</div> : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditing((prev) => !prev)}
            className="rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted transition hover:border-accent/40 hover:text-accent"
          >
            {editing ? (
              <span className="inline-flex items-center gap-1.5">
                <X className="size-3.5" aria-hidden />
                Close
              </span>
            ) : (
              "Edit"
            )}
          </button>
          <DeleteButton action={deleteAction} id={id} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {editing ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <form
              action={formAction}
              onSubmit={onSubmit}
              className="space-y-5 border-t border-hairline p-5"
            >
              <input type="hidden" name="id" value={id} />
              {fields(state)}
              <FormMessage state={state} />
              <SubmitButton pending={pending} />
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
