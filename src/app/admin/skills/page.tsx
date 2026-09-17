import { AdminPageHeader } from "@/components/admin/page-header";
import { SkillsManager } from "@/components/admin/sections/skills-manager";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function AdminSkillsPage() {
  await requireAdmin();

  const categories = await prisma.skillCategory.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { skills: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Skills"
        description="Categories render as cards. Skills with a level show an animated meter; those without render as plain badges."
      />
      <SkillsManager categories={categories} />
    </div>
  );
}
