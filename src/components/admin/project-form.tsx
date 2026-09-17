"use client";

import { Globe } from "lucide-react";

import { AdminForm, FormSection } from "@/components/admin/admin-form";
import { LinkListField } from "@/components/admin/link-list-field";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { TitleSlugFields } from "@/components/admin/title-slug-fields";
import { UploadField } from "@/components/admin/upload-field";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { projectCategories } from "@/lib/site-config";
import { toDateInputValue } from "@/lib/utils";
import type { FormState } from "@/lib/actions/types";
import type { Project } from "@/types/content";

export function ProjectForm({
  action,
  project,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  project?: Project;
}) {
  return (
    <AdminForm
      action={action}
      submitLabel={project ? "Save changes" : "Create project"}
      cancelHref="/admin/projects"
    >
      {(state) => (
        <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
          {project ? <input type="hidden" name="id" value={project.id} /> : null}

          {/* Main column: the content itself. */}
          <div className="min-w-0 space-y-6">
            <FormSection title="Details">
              <TitleSlugFields
                basePath="/projects"
                defaultTitle={project?.title}
                defaultSlug={project?.slug}
                titleError={state.errors?.title}
                slugError={state.errors?.slug}
                titlePlaceholder="Portfolio Redesign"
              />

              <Field
                label="Summary"
                htmlFor="summary"
                required
                hint="One or two sentences. Used on cards and as the search description."
                error={state.errors?.summary}
              >
                <Textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  required
                  maxLength={300}
                  defaultValue={project?.summary}
                  invalid={Boolean(state.errors?.summary)}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Repositories"
              description="Link as many repos as the project actually has, each with its own label."
            >
              <LinkListField
                name="repos"
                defaultValue={project?.repos}
                error={state.errors?.repos}
                icon={GithubIcon}
                labelPlaceholder="Label, e.g. Backend"
                urlPlaceholder="https://github.com/…"
                emptyText="No repositories linked yet."
                helpText="One row per repository — a frontend, a backend, an npm package, whatever the project actually has."
              />
            </FormSection>

            <FormSection
              title="Live links"
              description="A production site, a staging environment, a demo video — whatever is actually live."
            >
              <LinkListField
                name="liveUrls"
                defaultValue={project?.liveUrls}
                error={state.errors?.liveUrls}
                icon={Globe}
                labelPlaceholder="Label, e.g. Production"
                urlPlaceholder="https://example.com"
                emptyText="No live links yet."
                helpText="One row per link — the label is shown on the button, e.g. “Visit live site”."
              />
            </FormSection>

            <FormSection
              title="Case study"
              description="Markdown: headings, lists, links, tables and code blocks."
            >
              <MarkdownEditor
                id="content"
                name="content"
                defaultValue={project?.content}
                placeholder={"## The brief\n\nWhat the client needed, and why…"}
              />
            </FormSection>
          </div>

          {/* Sidebar: metadata, media and publishing. */}
          <div className="space-y-6">
            <FormSection title="Publishing">
              <Checkbox
                name="published"
                label="Published"
                description="Visible on the public site."
                defaultChecked={project?.published ?? true}
              />
              <Checkbox
                name="featured"
                label="Featured"
                description="Prioritised on the home page."
                defaultChecked={project?.featured ?? false}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" htmlFor="date" required error={state.errors?.date}>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={toDateInputValue(project?.date ?? new Date())}
                    invalid={Boolean(state.errors?.date)}
                  />
                </Field>
                <Field label="Sort order" htmlFor="order" hint="Lower first">
                  <Input id="order" name="order" type="number" defaultValue={project?.order ?? 0} />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Cover image">
              <UploadField
                name="coverImage"
                defaultValue={project?.coverImage}
                hint="16:10 at 1600px wide or larger looks sharpest."
              />
              {state.errors?.coverImage ? (
                <p className="text-xs text-red-500">{state.errors.coverImage}</p>
              ) : null}
            </FormSection>

            <FormSection title="Classification">
              <Field label="Category" htmlFor="category" required>
                <Select
                  id="category"
                  name="category"
                  defaultValue={project?.category ?? "Full-Stack"}
                  options={projectCategories.map((category) => ({
                    value: category,
                    label: category,
                  }))}
                />
              </Field>
              <Field label="Tags" htmlFor="tags" hint="Comma separated">
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={project?.tags}
                  placeholder="React, Tailwind, Accessibility"
                />
              </Field>
            </FormSection>
          </div>
        </div>
      )}
    </AdminForm>
  );
}
