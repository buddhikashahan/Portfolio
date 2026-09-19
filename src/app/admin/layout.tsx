import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s - Dashboard" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Authoritative guard. `proxy.ts` only checks that a cookie exists.
  const user = await requireAdmin();

  return (
    <AdminShell user={{ name: user.name, email: user.email }}>{children}</AdminShell>
  );
}
