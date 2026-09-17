import { AdminPageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { createProject } from "@/lib/actions/projects";
import { requireAdmin } from "@/lib/auth/dal";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New project"
        description="Write the case study now or save a draft and come back to it."
        breadcrumb={{ href: "/admin/projects", label: "Projects" }}
      />
      <ProjectForm action={createProject} />
    </div>
  );
}
