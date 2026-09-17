import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { BackgroundFX } from "@/components/layout/background-fx";
import { getCurrentUser } from "@/lib/auth/dal";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/** Only same-origin relative paths, so `?next=` cannot become an open redirect. */
function safeNext(value: string | string[] | undefined) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/admin";
}

export default async function LoginPage(props: PageProps<"/login">) {
  // Verified here rather than in `proxy.ts`: proxy can only see that a cookie
  // exists, and bouncing on mere presence deadlocks anyone holding an expired
  // one. `getCurrentUser()` actually checks the signature and the user row.
  const user = await getCurrentUser();
  if (user) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const next = safeNext(searchParams.next);

  return (
    <div className="relative grid min-h-dvh place-items-center px-5 py-12">
      <BackgroundFX />

      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="size-4" />
          Back to site
        </Link>

        <div className="panel mt-6 rounded-panel p-7">
          <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
            {siteConfig.shortName}
            <span className="text-accent">.dev</span>
          </span>

          <h1 className="mt-6 text-xl font-semibold tracking-tight text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage projects, posts and everything else on the site.
          </p>

          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
