"use client";

import { AddPanel, EditableCard } from "@/components/admin/collection-editor";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import {
  createExperience,
  deleteExperience,
  updateExperience,
} from "@/lib/actions/content";
import { formatDateRange, parseTags, toDateInputValue } from "@/lib/utils";
import type { FormState } from "@/lib/actions/types";
import type { Experience } from "@/types/content";

function fields(state: FormState, experience?: Experience) {
  const key = experience?.id ?? "new";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Role" htmlFor={`role-${key}`} required error={state.errors?.role}>
          <Input
            id={`role-${key}`}
            name="role"
            required
            defaultValue={experience?.role}
            placeholder="Full-Stack Web Developer"
            invalid={Boolean(state.errors?.role)}
          />
        </Field>

        <Field
          label="Company"
          htmlFor={`company-${key}`}
          required
          error={state.errors?.company}
        >
          <Input
            id={`company-${key}`}
            name="company"
            required
            defaultValue={experience?.company}
            placeholder="Jinasena Training Foundation"
            invalid={Boolean(state.errors?.company)}
          />
        </Field>
      </div>

      <Field label="Location" htmlFor={`location-${key}`}>
        <Input
          id={`location-${key}`}
          name="location"
          defaultValue={experience?.location ?? ""}
          placeholder="Colombo, Sri Lanka"
        />
      </Field>

      <Field
        label="Description"
        htmlFor={`description-${key}`}
        required
        hint="What you owned and what changed because of it."
        error={state.errors?.description}
      >
        <Textarea
          id={`description-${key}`}
          name="description"
          rows={4}
          required
          defaultValue={experience?.description}
          invalid={Boolean(state.errors?.description)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Start date"
          htmlFor={`startDate-${key}`}
          required
          error={state.errors?.startDate}
        >
          <Input
            id={`startDate-${key}`}
            name="startDate"
            type="date"
            required
            defaultValue={toDateInputValue(experience?.startDate ?? new Date())}
            invalid={Boolean(state.errors?.startDate)}
          />
        </Field>

        <Field
          label="End date"
          htmlFor={`endDate-${key}`}
          hint="Leave blank if this is your current role."
        >
          <Input
            id={`endDate-${key}`}
            name="endDate"
            type="date"
            defaultValue={toDateInputValue(experience?.endDate)}
          />
        </Field>
      </div>

      <Field label="Tags" htmlFor={`tags-${key}`} hint="Comma separated.">
        <Input
          id={`tags-${key}`}
          name="tags"
          defaultValue={experience?.tags}
          placeholder="Python, Django, React, PostgreSQL"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Checkbox
          name="current"
          label="Current role"
          description="Shows as Present on the resume."
          defaultChecked={experience?.current ?? false}
        />
        <Field label="Sort order" htmlFor={`order-${key}`}>
          <Input
            id={`order-${key}`}
            name="order"
            type="number"
            defaultValue={experience?.order ?? 0}
          />
        </Field>
      </div>
    </>
  );
}

export function ExperienceManager({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="space-y-4">
      <AddPanel
        action={createExperience}
        label="Add a role"
        fields={(state) => fields(state)}
      />

      {experiences.map((experience) => (
        <EditableCard
          key={experience.id}
          id={experience.id}
          title={experience.role}
          subtitle={`${experience.company}${
            experience.location ? ` · ${experience.location}` : ""
          }`}
          meta={
            <div className="flex flex-wrap gap-1.5">
              {parseTags(experience.tags)
                .slice(0, 5)
                .map((tag) => (
                  <Badge key={tag} tone="muted">
                    {tag}
                  </Badge>
                ))}
            </div>
          }
          badges={
            <Badge tone={experience.current ? "success" : "neutral"}>
              {formatDateRange(
                experience.startDate,
                experience.endDate,
                experience.current,
              )}
            </Badge>
          }
          updateAction={updateExperience}
          deleteAction={deleteExperience}
          fields={(state) => fields(state, experience)}
        />
      ))}
    </div>
  );
}
