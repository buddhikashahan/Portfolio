import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { GithubIcon } from "@/components/ui/brand-icons";
import { CoverImage } from "@/components/ui/cover-image";
import { formatDate, parseRepos, parseTags } from "@/lib/utils";
import type { Project } from "@/types/content";

export function ProjectCard({ project }: { project: Project }) {
  const tags = parseTags(project.tags).slice(0, 3);
  // The card is a quick preview, so cap the icon row — the full list is on
  // the project's own page.
  const repos = parseRepos(project.repos).slice(0, 3);

  return (
    <article className="group panel relative flex h-full flex-col overflow-hidden rounded-card transition-colors duration-200 hover:border-hairline-strong">
      <div className="relative aspect-16/10 overflow-hidden border-b border-hairline bg-surface-sunken">
        {project.coverImage ? (
          <CoverImage
            src={project.coverImage}
            alt={`${project.title} cover`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            hoverZoom
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs tracking-wide text-ink-subtle uppercase">
            {project.category}
          </span>
          <time
            dateTime={project.date.toISOString()}
            className="font-mono text-xs text-ink-subtle"
          >
            {formatDate(project.date, { year: "numeric", month: "short" })}
          </time>
        </div>

        <h3 className="mt-3 flex items-start justify-between gap-3 font-medium text-ink">
          {/* Stretched link: the whole card is the hit target, while the repo
              link below stays separately clickable via z-index. */}
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0"
          >
            {project.title}
          </Link>
          <ArrowUpRight className="size-4 shrink-0 text-ink-subtle transition-colors group-hover:text-accent" />
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {project.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-5">
          {tags.map((tag) => (
            <span key={tag} className="font-mono text-xs text-ink-subtle">
              {tag}
            </span>
          ))}
          {repos.length > 0 ? (
            <span className="relative z-10 ml-auto flex items-center gap-2.5">
              {repos.map((repo) => (
                <a
                  key={repo.url}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  title={repo.label}
                  aria-label={`${project.title} — ${repo.label}`}
                  className="text-ink-subtle transition-colors hover:text-ink"
                >
                  <GithubIcon className="size-4" />
                </a>
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
