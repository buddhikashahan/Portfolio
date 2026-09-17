"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

/**
 * Renders a neutral placeholder until hydrated — the resolved theme is not
 * known on the server, and rendering the wrong icon would hydrate-mismatch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"
      }
      className={cn(
        "inline-grid size-9 place-items-center rounded-lg border border-hairline bg-surface text-ink-muted transition hover:border-accent/40 hover:text-ink",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </button>
  );
}
