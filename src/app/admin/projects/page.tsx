import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Eye, EyeOff, ImageOff, Pencil, Plus } from "lucide-react";

import { DeleteButton } from "@/components/admin/delete-button";
import { AdminPageHeader, EmptyState } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/url-controls";
import type { Prisma } from "@/generated/prisma/client";
import { deleteProject, toggleProjectPublished } from "@/lib/actions/projects";
import { requireAdmin } from "@/lib/auth/dal";
import { PAGE_SIZE, paginate, param } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminProjectsPage(props: PageProps<"/admin/projects">) {
  await requireAdmin();

  const params = await props.searchParams;
  const q = param(params, "q");
  const status = param(params, "status");

  const search: Prisma.ProjectWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { slug: { contains: q, mode: "insensitive" as const } },
          { tags: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where: Prisma.ProjectWhereInput = {
    ...search,
    ...(status === "published" ? { published: true } : {}),
    ...(status === "draft" ? { published: false } : {}),
    ...(status === "featured" ? { featured: true } : {}),
  };

  // Counts for the tabs honour the search, so the numbers match what you'd see.
  const [total, published, drafts, featured, matching] = await Promise.all([
    prisma.project.count({ where: search }),
    prisma.project.count({ where: { ...search, published: true } }),
    prisma.project.count({ where: { ...search, published: false } }),
    prisma.project.count({ where: { ...search, featured: true } }),
    prisma.project.count({ where }),
  ]);

  const info = paginate(matching, param(params, "page"), PAGE_SIZE.admin);
  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    skip: info.skip,
    take: info.take,
  });

  const hasAny = total > 0 || Boolean(q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Projects"
        description="Case studies shown on the home page and the projects index."
        action={
          <ButtonLink href="/admin/projects/new" size="sm">
            <Plus className="size-4" />
            New project
          </ButtonLink>
        }
      />

      {!hasAny ? (
        <EmptyState
          title="No projects yet"
          description="Add your first case study and it appears on the site as soon as you publish it."
          action={
            <ButtonLink href="/admin/projects/new" size="sm">
              <Plus className="size-4" />
              New project
            </ButtonLink>
          }
        />
      ) : (
        <div className="panel overflow-hidden rounded-card">
          <div className="flex flex-col gap-3 border-b border-hairline p-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterChips
              path="/admin/projects"
              params={params}
              param="status"
              label="Filter by status"
              allCount={total}
              options={[
                { value: "published", label: "Published", count: published },
                { value: "draft", label: "Drafts", count: drafts },
                { value: "featured", label: "Featured", count: featured },
              ]}
            />
            <SearchInput placeholder="Search projects…" className="sm:w-64" />
          </div>

          {projects.length === 0 ? (
            <p className="p-10 text-center text-sm text-ink-muted">No projects match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-184 text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs text-ink-subtle">
                    <th scope="col" className="px-4 py-3 font-medium">Project</th>
                    <th scope="col" className="px-4 py-3 font-medium">Category</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--hairline)">
                  {projects.map((project) => (
                    <tr key={project.id} className="transition-colors hover:bg-surface">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-hairline bg-surface-sunken">
                            {project.coverImage ? (
                              <Image src={project.coverImage} alt="" fill sizes="4rem" className="object-cover" />
                            ) : (
                              <ImageOff className="absolute inset-0 m-auto size-4 text-ink-subtle" aria-hidden />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/projects/${project.id}`}
                              className="block truncate font-medium text-ink transition-colors hover:text-accent"
                            >
                              {project.title}
                            </Link>
                            <p className="truncate font-mono text-xs text-ink-subtle">/{project.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{project.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {project.published ? (
                            <Badge tone="success">Published</Badge>
                          ) : (
                            <Badge tone="warning">Draft</Badge>
                          )}
                          {project.featured ? <Badge tone="accent">Featured</Badge> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                        {formatDate(project.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {project.published ? (
                            <a
                              href={`/projects/${project.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`View ${project.title} on the site`}
                              title="View on site"
                              className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition-colors hover:border-hairline-strong hover:text-ink"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : null}
                          <form action={toggleProjectPublished}>
                            <input type="hidden" name="id" value={project.id} />
                            <button
                              type="submit"
                              aria-label={project.published ? `Unpublish ${project.title}` : `Publish ${project.title}`}
                              title={project.published ? "Unpublish" : "Publish"}
                              className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition-colors hover:border-hairline-strong hover:text-ink"
                            >
                              {project.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            </button>
                          </form>
                          <Link
                            href={`/admin/projects/${project.id}`}
                            aria-label={`Edit ${project.title}`}
                            title="Edit"
                            className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition-colors hover:border-hairline-strong hover:text-ink"
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <DeleteButton action={deleteProject} id={project.id} label={`Delete ${project.title}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            info={info}
            path="/admin/projects"
            params={params}
            label="projects"
            className="px-4 py-4"
          />
        </div>
      )}
    </div>
  );
}
