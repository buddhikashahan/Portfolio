import "server-only";

import { headers } from "next/headers";

/**
 * Fixed-window, in-memory rate limiting.
 *
 * Good enough to blunt form floods and password guessing on a single server
 * process. It resets on restart and is not shared between instances, so a
 * horizontally scaled or serverless deployment should back this with Redis
 * (e.g. Upstash) — the call sites would not need to change.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, { max, windowMs }: { max: number; windowMs: number }) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= max) {
    buckets.set(key, recent);
    const retryAfterMs = windowMs - (now - recent[0]);
    return { limited: true, retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60_000)) };
  }

  recent.push(now);
  buckets.set(key, recent);
  return { limited: false, retryAfterMinutes: 0 };
}

/** Clear a key, e.g. after a successful sign-in. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export async function clientIp() {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}
