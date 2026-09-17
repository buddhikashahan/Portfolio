import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type CardProps = ComponentPropsWithoutRef<"div"> & {
  /** Adds the hover treatment used on cards that are themselves links. */
  interactive?: boolean;
};

export function Card({ className, interactive, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "panel rounded-card p-6",
        interactive &&
          "group transition-colors duration-200 hover:border-hairline-strong hover:bg-surface-raised",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
