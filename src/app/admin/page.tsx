import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  FolderGit2,
  Inbox,
  PenSquare,
  Quote,
  Sparkles,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";
import { formatDate, truncate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const user = await requireAdmin();

  const [
    projectCount,
    publishedProjects,
    postCount,
    publishedPosts,
    serviceCount,
    testimonialCount,
    experienceCount,
    certificateCount,
    unreadCount,
    recentMessages,
    recentProjects,
    draftPosts,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.service.count(),
    prisma.testimonial.count(),
    prisma.experience.count(),
    prisma.certificate.count(),
    prisma.message.count({ where: { read: false, archived: false } }),
    prisma.message.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.post.findMany({ where: { published: false }, take: 5 }),
  ]);

  const stats = [
    {
      label: "Projects",
      value: projectCount,
      detail: `${publishedProjects} published`,
      href: "/admin/projects",
      Icon: FolderGit2,
    },
    {
      label: "Blog posts",
      value: postCount,
      detail: `${publishedPosts} published`,
      href: "/admin/blog",
      Icon: PenSquare,
    },
    {
      label: "Unread messages",
      value: unreadCount,
      detail: "in the inbox",
      href: "/admin/messages",
      Icon: Inbox,
    },
    {
      label: "Testimonials",
      value: testimonialCount,
      detail: "on record",
      href: "/admin/testimonials",
      Icon: Quote,
    },
  ];

  const secondary = [
    { label: "Services", value: serviceCount, href: "/admin/services", Icon: Sparkles },
    { label: "Roles", value: experienceCount, href: "/admin/experience", Icon: Briefcase },
    {
      label: "Certificates",
      value: certificateCount,
      href: "/admin/certificates",
      Icon: Award,
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Everything on buddhika.dev at a glance. Changes publish to the live site as soon as you save."
        action={
          <ButtonLink href="/admin/projects/new" size="sm">
            New project
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, href, Icon }) => (
          <Link key={label} href={href} className="group">
            <Card interactive className="h-full">
              <div className="flex items-start justify-between">
                <span className="inline-grid size-10 place-items-center rounded-xl border border-hairline bg-surface text-accent">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <ArrowUpRight className="size-4 text-ink-subtle transition group-hover:text-accent" />
              </div>
              <p className="mt-4 text-3xl font-bold text-ink tabular-nums">{value}</p>
              <p className="mt-1 text-sm font-medium text-ink">{label}</p>
              <p className="text-xs text-ink-subtle">{detail}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {secondary.map(({ label, value, href, Icon }) => (
          <Link key={label} href={href}>
            <Card interactive className="flex items-center gap-4 p-4">
              <span className="inline-grid size-9 place-items-center rounded-lg border border-hairline bg-surface text-ink-muted">
                <Icon className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block text-lg font-semibold text-ink tabular-nums">
                  {value}
                </span>
                <span className="block text-xs text-ink-subtle">{label}</span>
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recent messages</h2>
            <Link
              href="/admin/messages"
              className="text-sm text-accent transition hover:underline"
            >
              View inbox
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="mt-5 text-sm text-ink-muted">No messages yet.</p>
          ) : (
            <ul className="mt-5 divide-y divide-[var(--hairline)]">
              {recentMessages.map((message) => (
                <li key={message.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {message.name}
                        {message.company ? (
                          <span className="font-normal text-ink-subtle">
                            {" "}
                            · {message.company}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                        {truncate(message.message, 70)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!message.read ? <Badge tone="accent">New</Badge> : null}
                      <span className="text-xs text-ink-subtle">
                        {formatDate(message.createdAt, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recently edited</h2>
            <Link
              href="/admin/projects"
              className="text-sm text-accent transition hover:underline"
            >
              All projects
            </Link>
          </div>

          <ul className="mt-5 divide-y divide-[var(--hairline)]">
            {recentProjects.map((project) => (
              <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {project.title}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      Updated {formatDate(project.updatedAt)}
                    </p>
                  </div>
                  {project.published ? (
                    <Badge tone="success">Live</Badge>
                  ) : (
                    <Badge tone="warning">Draft</Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {draftPosts.length > 0 ? (
            <div className="mt-5 border-t border-hairline pt-4">
              <p className="text-xs font-semibold tracking-wider text-ink-subtle uppercase">
                Unpublished drafts
              </p>
              <ul className="mt-3 space-y-2">
                {draftPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-sm text-ink-muted transition hover:text-accent"
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
