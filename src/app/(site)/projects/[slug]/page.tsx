import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { GithubIcon } from "@/components/ui/brand-icons";

import { Markdown } from "@/components/site/markdown";
import { ProjectCard } from "@/components/site/project-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/section";
import { CoverImage } from "@/components/ui/cover-image";
import { getProjectBySlug, getPublishedProjectSlugs, getRelatedProjects } from "@/lib/queries";
import { jsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl, formatDate, pageTitle, parseRepos, parseTags, truncate } from "@/lib/utils";

export async function generateStaticParams() {
  const projects = await getPublishedProjectSlugs();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Project not found" };

  return {
    title: pageTitle(project.title),
    description: truncate(project.summary, 160),
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.title,
      description: truncate(project.summary, 160),
      type: "article",
      publishedTime: project.date.toISOString(),
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

export default async function ProjectDetailPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const tags = parseTags(project.tags);
  const repos = parseRepos(project.repos);
  const liveLinks = parseRepos(project.liveUrls);
  const related = await getRelatedProjects(project.slug, project.category);

  // Structured data so the case study can surface as a rich result in search.
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    dateCreated: project.date.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    creator: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    image: project.coverImage ? [absoluteUrl(project.coverImage)] : undefined,
    keywords: tags.length > 0 ? tags.join(", ") : undefined,
    url: `${siteConfig.url}/projects/${project.slug}`,
    mainEntityOfPage: `${siteConfig.url}/projects/${project.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Projects", item: `${siteConfig.url}/projects` },
      { "@type": "ListItem", position: 2, name: project.title, item: `${siteConfig.url}/projects/${project.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(projectJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />

      <Section top="tight" bottom="none">
        <Container className="max-w-4xl">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-accent"
          >
            <ArrowLeft className="size-4" />
            All projects
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Badge tone="accent">{project.category}</Badge>
            <span className="text-xs text-ink-subtle">
              {formatDate(project.date)}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-ink-muted">{project.summary}</p>

          {(liveLinks.length > 0 || repos.length > 0) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {liveLinks.map((link) => (
                <ButtonLink key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                  <ExternalLink className="size-4" />
                </ButtonLink>
              ))}
              {repos.map((repo) => (
                <ButtonLink
                  key={repo.url}
                  href={repo.url}
                  variant="outline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon className="size-4" />
                  {repo.label}
                </ButtonLink>
              ))}
            </div>
          )}
        </Container>
      </Section>

      {project.coverImage ? (
        <Container className="mt-10 max-w-5xl">
          <div className="relative aspect-video overflow-hidden rounded-panel border border-hairline bg-surface-sunken">
            <CoverImage
              src={project.coverImage}
              alt={`${project.title} cover`}
              sizes="(max-width: 1024px) 100vw, 64rem"
              priority
            />
          </div>
        </Container>
      ) : null}

      <Section top="tight" bottom={related.length > 0 ? "default" : "last"}>
        <Container className="max-w-4xl">
          {tags.length > 0 ? (
            <div className="mb-10 flex flex-wrap gap-2 border-b border-hairline pb-8">
              {tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          ) : null}

          {project.content.trim() ? (
            <Markdown content={project.content} />
          ) : (
            <p className="text-ink-muted">
              A full write-up for this project is on the way.
            </p>
          )}
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section bottom="last">
          <Container>
            <h2 className="text-xl font-bold text-ink">More work</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
