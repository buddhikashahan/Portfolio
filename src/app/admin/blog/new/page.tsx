import { AdminPageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/post-form";
import { createPost } from "@/lib/actions/posts";
import { requireAdmin } from "@/lib/auth/dal";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New post"
        description="Saved posts stay unpublished until you tick Published."
        breadcrumb={{ href: "/admin/blog", label: "Blog" }}
      />
      <PostForm action={createPost} />
    </div>
  );
}
