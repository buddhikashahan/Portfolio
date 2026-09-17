"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on the server-side stack in production.
    console.error("Route error", error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-muted">
          An unexpected error interrupted this page. Trying again usually clears it.
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-ink-subtle">
            Reference: {error.digest}
          </p>
        ) : null}
        <Button onClick={reset} className="mt-8">
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
