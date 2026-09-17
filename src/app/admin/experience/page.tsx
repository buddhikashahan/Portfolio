import { AdminPageHeader } from "@/components/admin/page-header";
import { ExperienceManager } from "@/components/admin/sections/experience-manager";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function AdminExperiencePage() {
  await requireAdmin();

  const experiences = await prisma.experience.findMany({ orderBy: [{ order: "asc" }, { startDate: "desc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Experience"
        description="Roles on your resume timeline."
      />
      <ExperienceManager experiences={experiences} />
    </div>
  );
}
