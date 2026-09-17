"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { mainNav, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  // Storing the route the drawer was opened on, rather than a plain boolean,
  // closes it on navigation for free — no effect needed to reset it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const open = openedOn === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-hairline bg-[var(--glass)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8"
      >
        <Link href="/" className="inline-flex items-center">
          <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
            {siteConfig.shortName}
            <span className="text-accent">.dev</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive(item.href)
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
                {isActive(item.href) ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/contact" size="sm" className="hidden sm:inline-flex">
            Hire me
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpenedOn(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="inline-grid size-9 place-items-center rounded-lg border border-hairline bg-surface text-ink md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-hairline bg-[var(--glass)] backdrop-blur-xl md:hidden"
          >
            <ul className="mx-auto max-w-7xl space-y-1 px-5 py-4 sm:px-6">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-sm transition",
                      isActive(item.href)
                        ? "bg-accent/10 text-accent"
                        : "text-ink-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <ButtonLink href="/contact" className="w-full">
                  Hire me
                </ButtonLink>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
