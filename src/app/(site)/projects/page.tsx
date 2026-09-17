import type { Metadata } from "next";
import Link from "next/link";

import { Stagger, StaggerItem } from "@/components/motion";
import { ProjectCard } from "@/components/site/project-card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { ParamSelect, SearchInput } from "@/components/ui/url-controls";
import { getProjectCategories, getProjectsPage } from "@/lib/queries";
import { param } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Web, mobile, data and AI projects — case studies covering the problem, the approach and the outcome.",
  alternates: { canonical: "/projects" },
};

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

  return (
    <Section top="tight" bottom="last">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Selected work"
          title="Projects"
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
