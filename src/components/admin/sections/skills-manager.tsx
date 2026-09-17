"use client";

import { AddPanel, EditableCard } from "@/components/admin/collection-editor";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { DynamicIcon, iconNames } from "@/components/ui/icon";
import { TechIcon, techSlugs } from "@/components/ui/tech-icon";
import {
  createSkill,
  createSkillCategory,
  deleteSkill,
  deleteSkillCategory,
  updateSkill,
  updateSkillCategory,
} from "@/lib/actions/content";
import type { FormState } from "@/lib/actions/types";
import type { Skill, SkillCategoryWithSkills } from "@/types/content";

const categoryIconOptions = iconNames.map((name) => ({
  value: name,
  label: name,
  icon: <DynamicIcon name={name} className="size-4" />,
}));

/** Brand marks, previewed in colour so the right logo is easy to spot. */
const brandOptions = [
  { value: "", label: "No logo (monogram tile)" },
  ...techSlugs.map((slug) => ({
    value: slug,
    label: slug,
    icon: <TechIcon slug={slug} className="size-4" colored />,
  })),
];

function categoryFields(state: FormState, category?: SkillCategoryWithSkills) {
  const key = category?.id ?? "new-category";

  return (
    <>
      <Field label="Name" htmlFor={`name-${key}`} required error={state.errors?.name}>
        <Input
          id={`name-${key}`}
          name="name"
          required
          defaultValue={category?.name}
          placeholder="Frontend"
          invalid={Boolean(state.errors?.name)}
        />
      </Field>

      <Field label="Description" htmlFor={`description-${key}`}>
        <Textarea
          id={`description-${key}`}
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
          placeholder="Interfaces that stay fast and accessible as they grow."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Icon" htmlFor={`icon-${key}`}>
          <Select
            id={`icon-${key}`}
            name="icon"
            defaultValue={category?.icon ?? "Layers"}
            options={categoryIconOptions}
          />
        </Field>

        <Field label="Sort order" htmlFor={`order-${key}`}>
          <Input
            id={`order-${key}`}
            name="order"
            type="number"
            defaultValue={category?.order ?? 0}
          />
        </Field>
      </div>
    </>
  );
}

function skillFields(state: FormState, categoryId: string, skill?: Skill) {
  const key = skill?.id ?? `new-skill-${categoryId}`;

  return (
    <>
      <input type="hidden" name="categoryId" value={categoryId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Skill"
          htmlFor={`skill-name-${key}`}
          required
          error={state.errors?.name}
        >
          <Input
            id={`skill-name-${key}`}
            name="name"
            required
            defaultValue={skill?.name}
            placeholder="React"
            invalid={Boolean(state.errors?.name)}
          />
        </Field>

        <Field
          label="Brand logo"
          htmlFor={`skill-icon-${key}`}
          hint="Simple Icons slug. Leave empty for a lettered tile."
        >
          <Select
            id={`skill-icon-${key}`}
            name="icon"
            defaultValue={skill?.icon ?? ""}
            placeholder="No logo"
            options={brandOptions}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Note"
          htmlFor={`skill-note-${key}`}
          hint="Optional, e.g. “5 years” or “App Router”."
        >
          <Input
            id={`skill-note-${key}`}
            name="note"
            defaultValue={skill?.note ?? ""}
            placeholder="5 years"
          />
        </Field>

        <Field label="Sort order" htmlFor={`skill-order-${key}`}>
          <Input
            id={`skill-order-${key}`}
            name="order"
            type="number"
            defaultValue={skill?.order ?? 0}
          />
        </Field>
      </div>
    </>
  );
}

export function SkillsManager({
  categories,
}: {
  categories: SkillCategoryWithSkills[];
}) {
  return (
    <div className="space-y-6">
      <AddPanel
        action={createSkillCategory}
        label="Add a skill category"
        fields={(state) => categoryFields(state)}
      />

      {categories.map((category) => (
        <section key={category.id} className="space-y-3">
          <EditableCard
            id={category.id}
            title={
              <span className="inline-flex items-center gap-2">
                <DynamicIcon name={category.icon} className="size-4 text-ink-muted" />
                {category.name}
              </span>
            }
            subtitle={category.description ?? undefined}
            badges={
              <Badge tone="muted">
                {category.skills.length}{" "}
                {category.skills.length === 1 ? "skill" : "skills"}
              </Badge>
            }
            updateAction={updateSkillCategory}
            deleteAction={deleteSkillCategory}
            fields={(state) => categoryFields(state, category)}
          />

          <div className="space-y-3 sm:ml-6">
            {category.skills.map((skill) => (
              <EditableCard
                key={skill.id}
                id={skill.id}
                title={
                  <span className="inline-flex items-center gap-2">
                    <TechIcon slug={skill.icon} className="size-4" colored />
                    {skill.name}
                  </span>
                }
                badges={skill.note ? <Badge tone="muted">{skill.note}</Badge> : null}
                updateAction={updateSkill}
                deleteAction={deleteSkill}
                fields={(state) => skillFields(state, category.id, skill)}
              />
            ))}

            <AddPanel
              action={createSkill}
              label={`Add a skill to ${category.name}`}
              fields={(state) => skillFields(state, category.id)}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
