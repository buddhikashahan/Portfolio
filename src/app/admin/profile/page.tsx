import { AdminPageHeader } from "@/components/admin/page-header";
import { PasswordForm } from "@/components/admin/password-form";
import { ProfileForm } from "@/components/admin/profile-form";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function AdminProfilePage() {
  const user = await requireAdmin();
  const profile = await prisma.profile.findUnique({ where: { id: "singleton" } });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Profile"
        description="The single source of truth for your name, bio, contact details and hero numbers."
      />

      <ProfileForm profile={profile} />

      <section className="panel rounded-card p-5 sm:p-6">
        <h2 className="font-semibold text-ink">Account security</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Signed in as {user.email}. Change the password you use for this dashboard.
        </p>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
