import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
  breadcrumb,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div>
        {breadcrumb ? (
          <Link
            href={breadcrumb.href}
            className="text-sm text-ink-muted transition hover:text-accent"
          >
            ← {breadcrumb.label}
          </Link>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel rounded-card p-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
