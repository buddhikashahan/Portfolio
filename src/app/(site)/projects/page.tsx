import type { Metadata } from "next";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/components/motion";
import { ProjectCard } from "@/components/site/project-card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { ParamSelect, SearchInput } from "@/components/ui/url-controls";
import { getProjectCategories, getProjectsPage } from "@/lib/queries";
import { jsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site-config";
import { hrefWith, param } from "@/lib/pagination";

export async function generateMetadata(
  props: PageProps<"/projects">,
): Promise<Metadata> {
  const params = await props.searchParams;
  const category = param(params, "category");
  const q = param(params, "q");
  const page = param(params, "page");
  const pageNum = page ? Number.parseInt(page, 10) : 1;

  const base = category ? `${category} Projects` : "Portfolio Projects";
  const title = pageNum > 1 ? `${base} - Page ${pageNum}` : base;

  const baseDescription = category
    ? `${category} projects: case studies covering the problem, the approach and the outcome.`
    : "Web, mobile, data and AI projects: case studies covering the problem, the approach and the outcome.";
  const description = pageNum > 1 ? `${baseDescription} Page ${pageNum}.` : baseDescription;

  // A search query produces too many thin, near-duplicate variants to be
  // worth indexing on its own, so those consolidate to the base listing.
  // Category and pagination are real, distinct content and get their own
  // self-referencing canonical.
  const canonical = q ? "/projects" : hrefWith("/projects", {}, { category, page }) || "/projects";

  return { title, description, alternates: { canonical } };
}

const sortOptions = [
  { value: "new", label: "Newest first" },
  { value: "old", label: "Oldest first" },
  { value: "az", label: "Title A–Z" },
  { value: "za", label: "Title Z–A" },
];

export default async function ProjectsPage(props: PageProps<"/projects">) {
  const params = await props.searchParams;
  const category = param(params, "category");
  const q = param(params, "q");

  const [{ items, info }, categories] = await Promise.all([
    getProjectsPage({ category, q, sort: param(params, "sort"), page: param(params, "page") }),
    getProjectCategories(),
  ]);

  const filtered = Boolean(category || q);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category ? `${category} Projects` : "Projects",
    url: `${siteConfig.url}/projects`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((project, index) => ({
        "@type": "ListItem",
        position: info.skip + index + 1,
        url: `${siteConfig.url}/projects/${project.slug}`,
        name: project.title,
      })),
    },
  };

  return (
    <Section top="tight" bottom="last">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(collectionJsonLd)}
      />
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Selected work"
          title={category ? `${category} Projects` : "Projects"}
          description="Each one written up as a short case study: what the problem was, what I built, and what changed as a result."
        />

        <div className="mt-10 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-center lg:justify-between">
          <FilterChips
            path="/projects"
            params={params}
            param="category"
            options={categories}
            label="Filter by category"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput placeholder="Search projects…" className="sm:w-60" />
            <ParamSelect
              param="sort"
              defaultValue="new"
              options={sortOptions}
              label="Sort projects"
              className="sm:w-44"
            />
          </div>
        </div>

        {items.length > 0 ? (
          // Keyed on the result set so a new filter replays the entrance.
          <Stagger
            key={`${category}-${q}-${info.page}`}
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.05}
          >
            {items.map((project) => (
              <StaggerItem key={project.id} className="h-full">
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="panel mt-8 rounded-card p-12 text-center">
            <p className="font-medium text-ink">
              {filtered ? "No projects match those filters." : "No projects published yet."}
            </p>
            {filtered ? (
              <Link
                href="/projects"
                className="mt-3 inline-block text-sm text-accent underline underline-offset-4"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        )}

        <Pagination info={info} path="/projects" params={params} label="projects" className="mt-10" />
      </Container>
    </Section>
  );
}
