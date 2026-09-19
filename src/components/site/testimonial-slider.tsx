"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

const AUTOPLAY_MS = 7000;

export function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  // Direction drives which side the incoming slide enters from.
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  // Auto-advancing content is motion the user did not ask for; WCAG 2.2.2
  // expects it to be stoppable, and reduced-motion users should not get it at all.
  const prefersReducedMotion = useReducedMotion();

  const count = testimonials.length;

  const go = useCallback(
    (next: number, dir: number) => {
      if (count === 0) return;
      setDirection(dir);
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || prefersReducedMotion || count <= 1) return;
    const timer = setInterval(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, prefersReducedMotion, count, go]);

  if (count === 0) return null;

  const active = testimonials[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Quote className="mx-auto size-6 text-ink-subtle" aria-hidden />

      <div className="relative mt-6 min-h-52 sm:min-h-44">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={active.id}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <blockquote className="text-lg leading-relaxed text-balance text-ink">
              &ldquo;{active.quote}&rdquo;
            </blockquote>

            <figcaption className="mt-7 flex items-center justify-center gap-3">
              {active.avatarUrl ? (
                <Image
                  src={active.avatarUrl}
                  alt={`${active.name} photo`}
                  width={36}
                  height={36}
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-surface-raised text-sm font-medium text-ink">
                  {active.name.charAt(0)}
                </span>
              )}
              <span className="text-left">
                <span className="block text-sm font-medium text-ink">{active.name}</span>
                <span className="block text-xs text-ink-subtle">
                  {[active.role, active.company].filter(Boolean).join(" · ")}
                </span>
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(index - 1, -1)}
            aria-label="Previous testimonial"
            className="inline-grid size-8 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-surface hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>

          <div className="flex gap-1.5">
            {testimonials.map((testimonial, i) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => go(i, i > index ? 1 : -1)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === index ? "w-5 bg-accent" : "w-1 bg-hairline-strong",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1, 1)}
            aria-label="Next testimonial"
            className="inline-grid size-8 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-surface hover:text-ink"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
