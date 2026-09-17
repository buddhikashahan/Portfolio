import Link from "next/link";

import { BackgroundFX } from "@/components/layout/background-fx";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center px-5 text-center">
      <BackgroundFX />
      <div>
        <p className="font-mono text-7xl font-black text-ink">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink">This page does not exist</h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-muted">
          The link may be out of date, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <Link
            href="/projects"
            className="rounded-xl border border-hairline bg-surface px-5 py-2.5 text-sm text-ink transition hover:border-accent/40"
          >
            Browse projects
          </Link>
        </div>
      </div>
    </div>
  );
}
