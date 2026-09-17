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
import { deletePost, togglePostPublished } from "@/lib/actions/posts";
import { requireAdmin } from "@/lib/auth/dal";
import { PAGE_SIZE, paginate, param } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { formatDate, readingTime } from "@/lib/utils";

export default async function AdminBlogPage(props: PageProps<"/admin/blog">) {
  await requireAdmin();

  const params = await props.searchParams;
  const q = param(params, "q");
  const status = param(params, "status");

  const search: Prisma.PostWhereInput = q
    ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }, { tags: { contains: q } }] }
    : {};

  const where: Prisma.PostWhereInput = {
    ...search,
    ...(status === "published" ? { published: true } : {}),
    ...(status === "draft" ? { published: false } : {}),
    ...(status === "featured" ? { featured: true } : {}),
  };

  // Counts for the tabs honour the search, so the numbers match what you'd see.
  const [total, published, drafts, featured, matching] = await Promise.all([
    prisma.post.count({ where: search }),
    prisma.post.count({ where: { ...search, published: true } }),
    prisma.post.count({ where: { ...search, published: false } }),
    prisma.post.count({ where: { ...search, featured: true } }),
    prisma.post.count({ where }),
  ]);

  const info = paginate(matching, param(params, "page"), PAGE_SIZE.admin);
  const posts = await prisma.post.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    skip: info.skip,
    take: info.take,
  });

  const hasAny = total > 0 || Boolean(q);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Drafts stay private until you publish them."
        action={
          <ButtonLink href="/admin/blog/new" size="sm">
            <Plus className="size-4" />
            New post
          </ButtonLink>
        }
      />

      {!hasAny ? (
        <EmptyState
          title="No posts yet"
          description="Write your first post. It stays a draft until you publish it."
          action={
            <ButtonLink href="/admin/blog/new" size="sm">
              <Plus className="size-4" />
              New post
            </ButtonLink>
          }
        />
      ) : (
        <div className="panel overflow-hidden rounded-card">
          <div className="flex flex-col gap-3 border-b border-hairline p-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterChips
              path="/admin/blog"
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
            <SearchInput placeholder="Search posts…" className="sm:w-64" />
          </div>

          {posts.length === 0 ? (
            <p className="p-10 text-center text-sm text-ink-muted">No posts match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-184 text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs text-ink-subtle">
                    <th scope="col" className="px-4 py-3 font-medium">Post</th>
                    <th scope="col" className="px-4 py-3 font-medium">Published</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="px-4 py-3 font-medium">Updated</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--hairline)">
                  {posts.map((post) => (
                    <tr key={post.id} className="transition-colors hover:bg-surface">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-hairline bg-surface-sunken">
                            {post.coverImage ? (
                              <Image src={post.coverImage} alt="" fill sizes="4rem" className="object-cover" />
                            ) : (
                              <ImageOff className="absolute inset-0 m-auto size-4 text-ink-subtle" aria-hidden />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/blog/${post.id}`}
                              className="block truncate font-medium text-ink transition-colors hover:text-accent"
                            >
                              {post.title}
                            </Link>
                            <p className="truncate font-mono text-xs text-ink-subtle">/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                        {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                        <span className="block font-mono text-xs text-ink-subtle">
                          {readingTime(post.content)} min read
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {post.published ? (
                            <Badge tone="success">Published</Badge>
                          ) : (
                            <Badge tone="warning">Draft</Badge>
                          )}
                          {post.featured ? <Badge tone="accent">Featured</Badge> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                        {formatDate(post.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.published ? (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`View ${post.title} on the site`}
                              title="View on site"
                              className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition-colors hover:border-hairline-strong hover:text-ink"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          ) : null}
                          <form action={togglePostPublished}>
                            <input type="hidden" name="id" value={post.id} />
                            <button
                              type="submit"
                              aria-label={post.published ? `Unpublish ${post.title}` : `Publish ${post.title}`}
                              title={post.published ? "Unpublish" : "Publish"}
                              className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition-colors hover:border-hairline-strong hover:text-ink"
                            >
                              {post.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            </button>
                          </form>
                          <Link
                            href={`/admin/blog/${post.id}`}
                            aria-label={`Edit ${post.title}`}
                            title="Edit"
                            className="inline-grid size-8 place-items-center rounded-lg border border-hairline text-ink-subtle transition-colors hover:border-hairline-strong hover:text-ink"
                          >
                            <Pencil className="size-3.5" />
                          </Link>
                          <DeleteButton action={deletePost} id={post.id} label={`Delete ${post.title}`} />
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
            path="/admin/blog"
            params={params}
            label="posts"
            className="px-4 py-4"
          />
        </div>
      )}
    </div>
  );
}
