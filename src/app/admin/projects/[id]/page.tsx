import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { ButtonLink } from "@/components/ui/button";
import { updateProject } from "@/lib/actions/projects";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function EditProjectPage(props: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();

  const { id } = await props.params;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={project.title}
        description="Edits go live as soon as you save."
        breadcrumb={{ href: "/admin/projects", label: "Projects" }}
        action={
          <ButtonLink
            href={`/projects/${project.slug}`}
            target="_blank"
            variant="outline"
            size="sm"
          >
            <ExternalLink className="size-4" />
            View
          </ButtonLink>
        }
      />
      <ProjectForm action={updateProject} project={project} />
    </div>
  );
}
