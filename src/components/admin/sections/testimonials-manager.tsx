"use client";

import { AddPanel, EditableCard } from "@/components/admin/collection-editor";
import { UploadField } from "@/components/admin/upload-field";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import {
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from "@/lib/actions/content";
import { truncate } from "@/lib/utils";
import type { FormState } from "@/lib/actions/types";
import type { Testimonial } from "@/types/content";

function fields(state: FormState, testimonial?: Testimonial) {
  const key = testimonial?.id ?? "new";

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Name" htmlFor={`name-${key}`} required error={state.errors?.name}>
          <Input
            id={`name-${key}`}
            name="name"
            required
            defaultValue={testimonial?.name}
            placeholder="A. Fernando"
            invalid={Boolean(state.errors?.name)}
          />
        </Field>

        <Field label="Role" htmlFor={`role-${key}`}>
          <Input
            id={`role-${key}`}
            name="role"
            defaultValue={testimonial?.role ?? ""}
            placeholder="Product Lead"
          />
        </Field>

        <Field label="Company" htmlFor={`company-${key}`}>
          <Input
            id={`company-${key}`}
            name="company"
            defaultValue={testimonial?.company ?? ""}
            placeholder="Acme"
          />
        </Field>
      </div>

      <Field
        label="Quote"
        htmlFor={`quote-${key}`}
        required
        hint="Their words, not yours. Keep it to two or three sentences."
        error={state.errors?.quote}
      >
        <Textarea
          id={`quote-${key}`}
          name="quote"
          rows={4}
          required
          defaultValue={testimonial?.quote}
          invalid={Boolean(state.errors?.quote)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
        <Field label="Photo" htmlFor={`avatarUrl-${key}`} error={state.errors?.avatarUrl}>
          <UploadField
            id={`avatarUrl-${key}`}
            name="avatarUrl"
            aspect="square"
            defaultValue={testimonial?.avatarUrl}
          />
        </Field>

        <Field label="Rating" htmlFor={`rating-${key}`}>
          <Select
            id={`rating-${key}`}
            name="rating"
            defaultValue={String(testimonial?.rating ?? 5)}
            options={[5, 4, 3, 2, 1].map((value) => ({
              value: String(value),
              label: `${value} star${value === 1 ? "" : "s"}`,
            }))}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Checkbox
          name="published"
          label="Published"
          description="Shown in the home page slider."
          defaultChecked={testimonial?.published ?? true}
        />
        <Field label="Sort order" htmlFor={`order-${key}`}>
          <Input
            id={`order-${key}`}
            name="order"
            type="number"
            defaultValue={testimonial?.order ?? 0}
          />
        </Field>
      </div>
    </>
  );
}

export function TestimonialsManager({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return (
    <div className="space-y-4">
      <AddPanel
        action={createTestimonial}
        label="Add a testimonial"
        fields={(state) => fields(state)}
      />

      {testimonials.map((testimonial) => (
        <EditableCard
          key={testimonial.id}
          id={testimonial.id}
          title={testimonial.name}
          subtitle={truncate(testimonial.quote, 120)}
          badges={
            <>
              <Badge tone="accent">{testimonial.rating}★</Badge>
              {testimonial.published ? (
                <Badge tone="success">Live</Badge>
              ) : (
                <Badge tone="warning">Hidden</Badge>
              )}
            </>
          }
          updateAction={updateTestimonial}
          deleteAction={deleteTestimonial}
          fields={(state) => fields(state, testimonial)}
        />
      ))}
    </div>
  );
}
