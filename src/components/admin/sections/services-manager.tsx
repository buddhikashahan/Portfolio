"use client";

import { AddPanel, EditableCard } from "@/components/admin/collection-editor";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { DynamicIcon, iconNames } from "@/components/ui/icon";
import { createService, deleteService, updateService } from "@/lib/actions/content";
import type { FormState } from "@/lib/actions/types";
import type { Service } from "@/types/content";

/** Each option previews its own glyph, so the picker is browsable by eye. */
const iconOptions = iconNames.map((name) => ({
  value: name,
  label: name,
  icon: <DynamicIcon name={name} className="size-4" />,
}));

function fields(state: FormState, service?: Service) {
  const key = service?.id ?? "new";

  return (
    <>
      <Field label="Title" htmlFor={`title-${key}`} required error={state.errors?.title}>
        <Input
          id={`title-${key}`}
          name="title"
          required
          defaultValue={service?.title}
          placeholder="Web Development"
          invalid={Boolean(state.errors?.title)}
        />
      </Field>

      <Field
        label="Description"
        htmlFor={`description-${key}`}
        required
        error={state.errors?.description}
      >
        <Textarea
          id={`description-${key}`}
          name="description"
          rows={3}
          required
          defaultValue={service?.description}
          placeholder="What this service covers and what the client gets."
          invalid={Boolean(state.errors?.description)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Icon" htmlFor={`icon-${key}`}>
          <Select
            id={`icon-${key}`}
            name="icon"
            defaultValue={service?.icon ?? "Code"}
            options={iconOptions}
          />
        </Field>

        <Field label="Sort order" htmlFor={`order-${key}`} hint="Lower appears first.">
          <Input
            id={`order-${key}`}
            name="order"
            type="number"
            defaultValue={service?.order ?? 0}
          />
        </Field>
      </div>

      <Checkbox
        name="published"
        label="Published"
        description="Shown on the home and about pages."
        defaultChecked={service?.published ?? true}
      />
    </>
  );
}

export function ServicesManager({ services }: { services: Service[] }) {
  return (
    <div className="space-y-4">
      <AddPanel
        action={createService}
        label="Add a service"
        fields={(state) => fields(state)}
      />

      {services.map((service) => (
        <EditableCard
          key={service.id}
          id={service.id}
          title={
            <span className="inline-flex items-center gap-2">
              <DynamicIcon name={service.icon} className="size-4 text-ink-muted" />
              {service.title}
            </span>
          }
          subtitle={service.description}
          badges={
            service.published ? (
              <Badge tone="success">Live</Badge>
            ) : (
              <Badge tone="warning">Hidden</Badge>
            )
          }
          updateAction={updateService}
          deleteAction={deleteService}
          fields={(state) => fields(state, service)}
        />
      ))}
    </div>
  );
}
