import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

/**
 * Authoritative auth check. `proxy.ts` only does an optimistic cookie check to
 * keep redirects cheap, so every admin page, layout, and Server Action must
 * call one of these — Server Actions are reachable by direct POST.
 */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
});

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * For Server Actions that return a result object instead of redirecting, so the
 * client can render an error rather than a blank navigation.
 */
export async function assertAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
