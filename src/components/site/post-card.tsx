import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CoverImage } from "@/components/ui/cover-image";
import { formatDate, parseTags, readingTime } from "@/lib/utils";
import type { Post } from "@/types/content";

export function PostCard({ post }: { post: Post }) {
  const tags = parseTags(post.tags).slice(0, 2);

  return (
    <article className="group panel relative flex h-full flex-col overflow-hidden rounded-card transition-colors duration-200 hover:border-hairline-strong">
      {post.coverImage ? (
        <div className="relative aspect-16/10 overflow-hidden border-b border-hairline bg-surface-sunken">
          <CoverImage
            src={post.coverImage}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            hoverZoom
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 font-mono text-xs text-ink-subtle">
          {post.publishedAt ? (
            <time dateTime={post.publishedAt.toISOString()}>
              {formatDate(post.publishedAt)}
            </time>
          ) : null}
          <span aria-hidden>/</span>
          <span>{readingTime(post.content)} min read</span>
        </div>

        <h3 className="mt-3 flex items-start justify-between gap-3 font-medium text-ink">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
          <ArrowUpRight className="size-4 shrink-0 text-ink-subtle transition-colors group-hover:text-accent" />
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {post.excerpt}
        </p>

        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          {tags.map((tag) => (
            <span key={tag} className="font-mono text-xs text-ink-subtle">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
