import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/post-form";
import { ButtonLink } from "@/components/ui/button";
import { updatePost } from "@/lib/actions/posts";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma";

export default async function EditPostPage(props: PageProps<"/admin/blog/[id]">) {
  await requireAdmin();

  const { id } = await props.params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={post.title}
        description={post.published ? "This post is live." : "This post is a draft."}
        breadcrumb={{ href: "/admin/blog", label: "Blog" }}
        action={
          post.published ? (
            <ButtonLink
              href={`/blog/${post.slug}`}
              target="_blank"
              variant="outline"
              size="sm"
            >
              <ExternalLink className="size-4" />
              View
            </ButtonLink>
          ) : null
        }
      />
      <PostForm action={updatePost} post={post} />
    </div>
  );
}
