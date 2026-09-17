import { AdminPageHeader } from "@/components/admin/page-header";
import { EducationManager } from "@/components/admin/sections/education-manager";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function AdminEducationPage() {
  await requireAdmin();

  const education = await prisma.education.findMany({ orderBy: [{ order: "asc" }, { startYear: "desc" }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Education"
        description="Degrees and formal qualifications."
      />
      <EducationManager education={education} />
    </div>
  );
}
