"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { fadeInUp, viewportOnce } from "@/lib/motion";

/**
 * Only the tags we actually reveal. Looking them up from a frozen map keeps the
 * component identity stable across renders — building one with `motion.create`
 * inside the render body would remount the subtree on every pass.
 */
const elements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  aside: motion.aside,
  header: motion.header,
  li: motion.li,
  span: motion.span,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const;

export type RevealTag = keyof typeof elements;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before this element starts, for hand-tuned sequences. */
  delay?: number;
  variants?: Variants;
  as?: RevealTag;
  once?: boolean;
};

/**
 * Scroll-triggered entrance. Reduced-motion is handled globally by the
 * `MotionConfig` in the providers, so this component has no media-query branch.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  variants = fadeInUp,
  as = "div",
  once = true,
}: RevealProps) {
  const Component = elements[as];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={once ? viewportOnce : { amount: 0, margin: "0px 0px -80px 0px" }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}
