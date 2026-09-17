import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Native <select> is deliberately absent: see `@/components/ui/select`. */
const controlClasses =
  "w-full rounded-lg border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle transition outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/25 disabled:opacity-60";

/**
 * Wraps a control with its label, hint and validation message, wiring
 * `aria-describedby` / `aria-invalid` so errors are announced.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium text-ink"
      >
        {label}
        {required ? (
          <span className="text-red-400" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = ComponentPropsWithoutRef<"input"> & { invalid?: boolean };

export function Input({ className, invalid, id, ...props }: InputProps) {
  return (
    <input
      id={id}
      className={cn(controlClasses, invalid && "border-red-500/60", className)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      {...props}
    />
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean };

export function Textarea({ className, invalid, id, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      className={cn(controlClasses, "resize-y", invalid && "border-red-500/60", className)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      {...props}
    />
  );
}

export function Checkbox({
  label,
  description,
  className,
  ...props
}: ComponentPropsWithoutRef<"input"> & { label: string; description?: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-hairline bg-surface p-3 transition hover:border-accent/40",
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-ink-subtle">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
