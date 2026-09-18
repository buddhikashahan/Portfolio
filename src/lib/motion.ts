import type { Transition, Variants } from "framer-motion";

/**
 * One motion vocabulary for the whole site. Components import these instead of
 * hand-writing transition objects, which keeps timing consistent and makes a
 * global tuning change a one-file edit.
 */

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const duration = {
  fast: 0.18,
  base: 0.35,
  slow: 0.55,
  page: 0.45,
} as const;

export const transitions = {
  base: { duration: duration.base, ease: easeOutExpo },
  slow: { duration: duration.slow, ease: easeOutExpo },
  spring: { type: "spring", stiffness: 260, damping: 26, mass: 0.9 },
  softSpring: { type: "spring", stiffness: 140, damping: 20 },
} satisfies Record<string, Transition>;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.slow },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
};

/** Parent wrapper that walks its children in one after another. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/**
 * `amount: 0.2` (20% of the element already on screen) reads fine on a tall
 * desktop viewport but on a short mobile one it means real content sits at
 * `opacity: 0` until you scroll well into it. Triggering off the first sliver
 * entering view, a little before it's actually on screen, fixes that without
 * giving up the entrance animation.
 */
export const viewportOnce = { once: true, amount: 0, margin: "0px 0px -80px 0px" } as const;
