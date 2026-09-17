"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/motion";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
};

/** Wrap a list; each `<StaggerItem>` child enters in sequence. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={staggerContainer(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variants = fadeInUp,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
