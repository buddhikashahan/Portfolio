"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type TypewriterProps = {
  phrases: string[];
  className?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  /** Beat between deleting one phrase and typing the next. */
  switchMs?: number;
};

/**
 * Cycles through `phrases`, typing and deleting one character at a time.
 * Every state change happens inside a timer callback, so a single scheduled
 * tick drives the whole cycle. Falls back to static text under reduced motion.
 */
export function Typewriter({
  phrases,
  className,
  typeMs = 70,
  deleteMs = 35,
  holdMs = 1600,
  switchMs = 220,
}: TypewriterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || phrases.length === 0) return;

    const current = phrases[index % phrases.length];

    // Finished typing: pause on the full phrase, then start deleting.
    if (!deleting && text === current) {
      const timer = setTimeout(() => setDeleting(true), holdMs);
      return () => clearTimeout(timer);
    }

    // Finished deleting: advance to the next phrase.
    if (deleting && text === "") {
      const timer = setTimeout(() => {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
      }, switchMs);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(
      () => {
        setText((prev) =>
          deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1),
        );
      },
      deleting ? deleteMs : typeMs,
    );

    return () => clearTimeout(timer);
  }, [
    text,
    deleting,
    index,
    phrases,
    typeMs,
    deleteMs,
    holdMs,
    switchMs,
    prefersReducedMotion,
  ]);

  if (prefersReducedMotion || phrases.length === 0) {
    return <span className={className}>{phrases[0] ?? ""}</span>;
  }

  return (
    <span className={cn("typed-caret", className)} aria-live="polite">
      {text}
    </span>
  );
}
