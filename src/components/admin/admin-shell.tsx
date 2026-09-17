"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Owns the mobile drawer state, which is the only reason this shell is a
 * Client Component — the pages it wraps stay on the server.
 */
export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-canvas">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-hairline bg-[var(--glass)] px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            className="inline-grid size-9 place-items-center rounded-lg border border-hairline text-ink-muted lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2.5">
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-medium text-ink">{user.name}</span>
                <span className="block text-xs text-ink-subtle">{user.email}</span>
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold text-slate-950">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
