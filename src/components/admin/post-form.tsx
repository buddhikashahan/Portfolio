"use client";

import { AdminForm, FormSection } from "@/components/admin/admin-form";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { UploadField } from "@/components/admin/upload-field";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { toDateInputValue } from "@/lib/utils";
import type { FormState } from "@/lib/actions/types";
import type { Post } from "@/types/content";

export function PostForm({
  action,
  post,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  post?: Post;
}) {
  return (
    <AdminForm
      action={action}
      submitLabel={post ? "Save changes" : "Create post"}
      cancelHref="/admin/blog"
    >
      {(state) => (
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          {post ? <input type="hidden" name="id" value={post.id} /> : null}

          <div className="min-w-0 space-y-6">
            <FormSection title="Details">
              <TitleSlugFields
                basePath="/blog"
                defaultTitle={post?.title}
                defaultSlug={post?.slug}
                titleError={state.errors?.title}
                slugError={state.errors?.slug}
                titlePlaceholder="Animation that earns its place"
              />

              <Field
                label="Excerpt"
                htmlFor="excerpt"
                required
                hint="Shown on cards, as the post's standfirst, and as the search description."
                error={state.errors?.excerpt}
              >
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  required
                  maxLength={300}
                  defaultValue={post?.excerpt}
                  invalid={Boolean(state.errors?.excerpt)}
                />
              </Field>
            </FormSection>

            <FormSection title="Body" description="Markdown, rendered exactly as in Preview.">
              <MarkdownEditor
                id="content"
                name="content"
                rows={22}
                defaultValue={post?.content}
                placeholder={"Open with the point, not the preamble…\n\n## A heading\n\nMore detail."}
              />
            </FormSection>
          </div>

          <div className="space-y-6">
            <FormSection title="Publishing">
              <Checkbox
                name="published"
                label="Published"
                description="Drafts are only visible here."
                defaultChecked={post?.published ?? false}
              />
              <Checkbox
                name="featured"
                label="Featured"
                description="Pinned to the top of the blog."
                defaultChecked={post?.featured ?? false}
              />
              <Field
                label="Publish date"
                htmlFor="publishedAt"
                hint="Leave blank to use today when published."
                error={state.errors?.publishedAt}
              >
                <Input
                  id="publishedAt"
                  name="publishedAt"
                  type="date"
                  defaultValue={toDateInputValue(post?.publishedAt)}
                />
              </Field>
            </FormSection>

            <FormSection title="Cover image">
              <UploadField name="coverImage" defaultValue={post?.coverImage} />
              {state.errors?.coverImage ? (
                <p className="text-xs text-red-500">{state.errors.coverImage}</p>
              ) : null}
            </FormSection>

            <FormSection title="Topics">
              <Field label="Tags" htmlFor="tags" hint="Comma separated. Used for blog filters.">
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={post?.tags}
                  placeholder="Next.js, Architecture"
                />
              </Field>
            </FormSection>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
