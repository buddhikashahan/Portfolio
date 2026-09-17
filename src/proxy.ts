import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Optimistic routing guard for the dashboard. It only checks that a session
 * cookie exists, so unauthenticated visitors never see the dashboard shell
 * flash; the authoritative check is `requireAdmin()` in the data-access layer.
 *
 * It deliberately does NOT bounce `/login` for signed-in users. Proxy can only
 * see that a cookie is present, not that it is valid, while `requireAdmin()`
 * redirects to `/login` when it is invalid — so a presence-based bounce turns
 * any expired or tampered cookie into an infinite `/login` ⇄ `/admin` loop that
 * locks the user out with no way to sign in again. That redirect belongs on the
 * login page, where the session can actually be verified.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/admin") && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
