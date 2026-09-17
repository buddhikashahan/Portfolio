import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "muted";

const tones: Record<BadgeTone, string> = {
  neutral: "border-hairline bg-surface text-ink-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  danger: "border-red-500/30 bg-red-500/10 text-red-500",
  muted: "border-transparent bg-surface text-ink-subtle",
};

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
