import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";

import { Markdown } from "@/components/site/markdown";
import { PostCard } from "@/components/site/post-card";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/ui/section";
import { CoverImage } from "@/components/ui/cover-image";
import { getPostBySlug, getPublishedPostSlugs, getRelatedPosts } from "@/lib/queries";
import { jsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl, formatDate, parseTags, readingTime, truncate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getPublishedPostSlugs();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: truncate(post.excerpt, 160),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: truncate(post.excerpt, 160),
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [siteConfig.name],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const tags = parseTags(post.tags);
  const related = await getRelatedPosts(post.slug, 2);

  // Structured data so the post can surface as a rich result in search.
  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
    image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${siteConfig.url}/blog` },
      { "@type": "ListItem", position: 2, name: post.title, item: `${siteConfig.url}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(postJsonLd)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />

      <Section top="tight" bottom="none">
        <Container className="max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-ink-muted transition hover:text-accent"
          >
            <ArrowLeft className="size-4" />
            All posts
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Badge key={tag} tone="accent">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-balance text-ink sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-subtle">
            {post.publishedAt ? (
              <time dateTime={post.publishedAt.toISOString()}>
                {formatDate(post.publishedAt, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            ) : null}
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {readingTime(post.content)} min read
            </span>
          </div>
        </Container>
      </Section>

      {post.coverImage ? (
        <Container className="mt-10 max-w-4xl">
          <div className="relative aspect-video overflow-hidden rounded-panel border border-hairline bg-surface-sunken">
            <CoverImage
              src={post.coverImage}
              alt={`${post.title} cover`}
              sizes="(max-width: 1024px) 100vw, 56rem"
              priority
            />
          </div>
        </Container>
      ) : null}

      <Section top="tight" bottom={related.length > 0 ? "default" : "last"}>
        <Container className="max-w-3xl">
          <p className="border-l-2 border-accent pl-4 text-lg text-ink">
            {post.excerpt}
          </p>
          <div className="mt-10">
            <Markdown content={post.content} />
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section bottom="last">
          <Container className="max-w-4xl">
            <h2 className="text-xl font-bold text-ink">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
