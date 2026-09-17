"use client";

import { AddPanel, EditableCard } from "@/components/admin/collection-editor";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/field";
import {
  createEducation,
  deleteEducation,
  updateEducation,
} from "@/lib/actions/content";
import type { FormState } from "@/lib/actions/types";
import type { Education } from "@/types/content";

function fields(state: FormState, education?: Education) {
  const key = education?.id ?? "new";

  return (
    <>
      <Field
        label="Qualification"
        htmlFor={`degree-${key}`}
        required
        error={state.errors?.degree}
      >
        <Input
          id={`degree-${key}`}
          name="degree"
          required
          defaultValue={education?.degree}
          placeholder="BSc (Hons) in Information Technology"
          invalid={Boolean(state.errors?.degree)}
        />
      </Field>

      <Field
        label="Institution"
        htmlFor={`institution-${key}`}
        required
        error={state.errors?.institution}
      >
        <Input
          id={`institution-${key}`}
          name="institution"
          required
          defaultValue={education?.institution}
          placeholder="SLIIT"
          invalid={Boolean(state.errors?.institution)}
        />
      </Field>

      <Field label="Description" htmlFor={`description-${key}`}>
        <Textarea
          id={`description-${key}`}
          name="description"
          rows={3}
          defaultValue={education?.description ?? ""}
          placeholder="Notable coursework, research focus, honours."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Start year"
          htmlFor={`startYear-${key}`}
          required
          error={state.errors?.startYear}
        >
          <Input
            id={`startYear-${key}`}
            name="startYear"
            required
            defaultValue={education?.startYear}
            placeholder="2019"
            invalid={Boolean(state.errors?.startYear)}
          />
        </Field>

        <Field label="End year" htmlFor={`endYear-${key}`} hint="Blank if ongoing.">
          <Input
            id={`endYear-${key}`}
            name="endYear"
            defaultValue={education?.endYear ?? ""}
            placeholder="2023"
          />
        </Field>

        <Field label="Sort order" htmlFor={`order-${key}`}>
          <Input
            id={`order-${key}`}
            name="order"
            type="number"
            defaultValue={education?.order ?? 0}
          />
        </Field>
      </div>
    </>
  );
}

export function EducationManager({ education }: { education: Education[] }) {
  return (
    <div className="space-y-4">
      <AddPanel
        action={createEducation}
        label="Add a qualification"
        fields={(state) => fields(state)}
      />

      {education.map((item) => (
        <EditableCard
          key={item.id}
          id={item.id}
          title={item.degree}
          subtitle={item.institution}
          badges={
            <Badge tone="neutral">
              {item.startYear} — {item.endYear ?? "Present"}
            </Badge>
          }
          updateAction={updateEducation}
          deleteAction={deleteEducation}
          fields={(state) => fields(state, item)}
        />
      ))}
    </div>
  );
}
