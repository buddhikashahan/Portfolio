"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, LogOut, X } from "lucide-react";

import { DynamicIcon } from "@/components/ui/icon";
import { logout } from "@/lib/actions/auth";
import { adminNav } from "@/lib/site-config";
import { cn } from "@/lib/utils";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    // `/admin` is only active on an exact match, otherwise every child
    // route would light it up alongside their own entry.
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto p-3">
      {adminNav.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
              active
                ? "bg-accent/10 text-accent"
                : "text-ink-muted hover:bg-surface hover:text-ink",
            )}
          >
            {active ? (
              <motion.span
                layoutId="admin-nav-active"
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            ) : null}
            <DynamicIcon name={item.icon} className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="space-y-1 border-t border-hairline p-3">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition hover:bg-surface hover:text-ink"
      >
        <ExternalLink className="size-4 shrink-0" aria-hidden />
        View live site
      </Link>
      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Sign out
        </button>
      </form>
    </div>
  );
}

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop: a permanent rail. */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-hairline bg-surface/40 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-hairline px-5">
          <span className="inline-grid size-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent text-sm font-black text-slate-950">
            B
          </span>
          <span className="font-extrabold tracking-tight text-ink">Dashboard</span>
        </div>
        <NavList />
        <SidebarFooter />
      </aside>

      {/* Mobile: a drawer over a dimmed backdrop. */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-hairline bg-canvas lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
                <span className="font-extrabold tracking-tight text-ink">Dashboard</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close navigation"
                  className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              <NavList onNavigate={onClose} />
              <SidebarFooter />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
