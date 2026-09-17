"use client";

import { useSyncExternalStore } from "react";

// The store never changes, so the subscribe callback is a no-op.
const noop = () => () => {};

/**
 * True only after hydration. `useSyncExternalStore` is the right tool here
 * rather than a `useState` + `useEffect` flag: it gives React a distinct
 * server snapshot instead of updating state from an effect on every mount.
 */
export function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
