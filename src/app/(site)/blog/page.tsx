import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { PostCard } from "@/components/site/post-card";
import { CoverImage } from "@/components/ui/cover-image";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { SearchInput } from "@/components/ui/url-controls";
import { getPostTags, getPostsPage } from "@/lib/queries";
import { param } from "@/lib/pagination";
import { formatDate, readingTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on full-stack architecture, interface design, and lessons from shipping real products.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage(props: PageProps<"/blog">) {
  const params = await props.searchParams;
  const tag = param(params, "tag");
  const q = param(params, "q");

  const [{ items, info, featured }, tags] = await Promise.all([
    getPostsPage({ tag, q, page: param(params, "page") }),
    getPostTags(),
  ]);

  const filtered = Boolean(tag || q);
  const nothingPublished = !filtered && !featured && info.total === 0;

  return (
    <Section top="tight" bottom="last">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow="Writing"
          title="Blog"
          description="Things I have learned building software, written down so I remember them."
        />

        {nothingPublished ? (
          <div className="panel mt-10 rounded-card p-12 text-center">
            <p className="font-medium text-ink">No posts published yet.</p>
            <p className="mt-1 text-sm text-ink-muted">Check back soon.</p>
          </div>
        ) : (
          <>
            {featured ? (
              <Reveal className="mt-10">
                <article className="group panel relative grid overflow-hidden rounded-panel transition-colors hover:border-hairline-strong md:grid-cols-2">
                  {featured.coverImage ? (
                    <div className="relative aspect-16/10 overflow-hidden bg-surface-sunken md:aspect-auto">
                      <CoverImage
                        src={featured.coverImage}
                        alt={`${featured.title} cover`}
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        hoverZoom
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-col justify-center p-6 sm:p-10">
                    <p className="font-mono text-xs tracking-wide text-accent uppercase">Featured</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                      <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0">
                        {featured.title}
                      </Link>
                    </h2>
                    <p className="mt-3 leading-relaxed text-ink-muted">{featured.excerpt}</p>
                    <p className="mt-6 flex items-center gap-3 font-mono text-xs text-ink-subtle">
                      {featured.publishedAt ? <span>{formatDate(featured.publishedAt)}</span> : null}
                      <span aria-hidden>/</span>
                      <span>{readingTime(featured.content)} min read</span>
                      <ArrowUpRight className="ml-auto size-4 transition-colors group-hover:text-accent" />
                    </p>
                  </div>
                </article>
              </Reveal>
            ) : null}

            <div className="mt-10 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-center lg:justify-between">
              <FilterChips
                path="/blog"
                params={params}
                param="tag"
                options={tags}
                allLabel="All topics"
                label="Filter by topic"
              />
              <SearchInput placeholder="Search posts…" className="lg:w-64" />
            </div>

            {items.length > 0 ? (
              <Stagger
                key={`${tag}-${q}-${info.page}`}
                className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                stagger={0.05}
              >
                {items.map((post) => (
                  <StaggerItem key={post.id} className="h-full">
                    <PostCard post={post} />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="panel mt-8 rounded-card p-12 text-center">
                <p className="font-medium text-ink">
                  {filtered ? "Nothing matches that search." : "No other posts yet."}
                </p>
                {filtered ? (
                  <Link
                    href="/blog"
                    className="mt-3 inline-block text-sm text-accent underline underline-offset-4"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>
            )}

            <Pagination info={info} path="/blog" params={params} label="posts" className="mt-10" />
          </>
        )}
      </Container>
    </Section>
  );
}
