import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

import { cn } from "@/lib/utils";

/**
 * Renders stored markdown. Raw HTML is deliberately not enabled — content comes
 * from the admin dashboard, and keeping HTML off removes a whole injection
 * surface for the sake of a feature nothing here needs.
 */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("prose-custom", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href, children, ...props }) => {
            const external = href?.startsWith("http");
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer noopener" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // GFM tables have no intrinsic max width, so a wide one (many
          // columns, long code snippets) would otherwise force the whole page
          // to scroll horizontally on mobile instead of just the table.
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
