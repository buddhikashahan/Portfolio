import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/** Page-width container. Every section uses this so gutters stay identical. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/*
 * Vertical rhythm is chosen through props rather than by passing padding
 * classes. Overriding `py-16 sm:py-20` with a plain `pt-14` looks like it works,
 * but the responsive `sm:py-20` still wins at every width above 640px — which
 * silently put 80px wherever a page asked for 0.
 */
const TOP = {
  default: "pt-16 sm:pt-20",
  /** First block under the site header, or content following a cover image. */
  tight: "pt-10 sm:pt-14",
} as const;

const BOTTOM = {
  default: "pb-16 sm:pb-20",
  /** Last block before the footer. */
  last: "pb-20 sm:pb-28",
  /** Flush, for a page header that runs straight into a cover image. */
  none: "pb-0",
} as const;

export function Section({
  id,
  children,
  className,
  top = "default",
  bottom = "default",
  bordered = false,
}: {
  id?: string;
  children: ReactNode;
  /** Non-spacing classes only; use `top` / `bottom` for padding. */
  className?: string;
  top?: keyof typeof TOP;
  bottom?: keyof typeof BOTTOM;
  /** Draws a hairline above the section, the default rhythm between blocks. */
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        TOP[top],
        BOTTOM[bottom],
        bordered && "border-t border-hairline",
        className,
      )}
    >
      {children}
    </section>
  );
}

/**
 * Section heading. Use `as="h1"` for the page title — each page needs exactly
 * one, and the eyebrow alone does not give search engines or screen readers a
 * document title.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Reveal
      as="header"
      className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}
    >
      {eyebrow ? (
        <p className="font-mono text-xs tracking-[0.16em] text-ink-subtle uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={cn(
          "mt-3 font-semibold tracking-tight text-ink",
          Heading === "h1" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
        )}
      >
        {title}
      </Heading>
      {description ? <p className="mt-3 leading-relaxed text-ink-muted">{description}</p> : null}
    </Reveal>
  );
}

/** Header row with a heading on the left and an action on the right. */
export function SectionBar({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      {action ? <Reveal delay={0.08}>{action}</Reveal> : null}
    </div>
  );
}
