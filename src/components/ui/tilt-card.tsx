"use client";

import { useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Pointer-reactive 3D tilt driven by CSS custom properties rather than React
 * state, so pointer movement never triggers a re-render.
 *
 * Deliberately CSS 3D rather than WebGL: a canvas renderer would add hundreds
 * of kilobytes and a loading state to a page whose job is to be read quickly.
 * Mouse-only and inert under reduced motion.
 */
export function TiltCard({
  children,
  className,
  max = 6,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [tilting, setTilting] = useState(false);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion || event.pointerType !== "mouse") return;

    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    element.style.setProperty("--tilt-y", `${(px - 0.5) * 2 * max}deg`);
    element.style.setProperty("--tilt-x", `${(0.5 - py) * 2 * max}deg`);
    element.style.setProperty("--glare-x", `${px * 100}%`);
    element.style.setProperty("--glare-y", `${py * 100}%`);
  }

  function reset() {
    const element = ref.current;
    if (!element) return;
    setTilting(false);
    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      ref={ref}
      data-tilting={tilting}
      className={cn("tilt-root", className)}
      onPointerEnter={(event) => {
        if (!prefersReducedMotion && event.pointerType === "mouse") setTilting(true);
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      <div className="tilt-surface relative size-full">
        {children}
        {glare ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
            style={{
              opacity: tilting ? 1 : 0,
              background:
                "radial-gradient(420px circle at var(--glare-x, 50%) var(--glare-y, 50%), color-mix(in oklab, var(--accent) 12%, transparent), transparent 60%)",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
