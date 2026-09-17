"use client";

import { AddPanel, EditableCard } from "@/components/admin/collection-editor";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/field";
import {
  createCertificate,
  deleteCertificate,
  updateCertificate,
} from "@/lib/actions/content";
import type { FormState } from "@/lib/actions/types";
import type { Certificate } from "@/types/content";

function fields(state: FormState, certificate?: Certificate) {
  const key = certificate?.id ?? "new";

  return (
    <>
      <Field
        label="Title"
        htmlFor={`title-${key}`}
        required
        error={state.errors?.title}
      >
        <Input
          id={`title-${key}`}
          name="title"
          required
          defaultValue={certificate?.title}
          placeholder="Introduction to Python"
          invalid={Boolean(state.errors?.title)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Issuer"
          htmlFor={`issuer-${key}`}
          required
          error={state.errors?.issuer}
          className="sm:col-span-2"
        >
          <Input
            id={`issuer-${key}`}
            name="issuer"
            required
            defaultValue={certificate?.issuer}
            placeholder="Sololearn"
            invalid={Boolean(state.errors?.issuer)}
          />
        </Field>

        <Field label="Year" htmlFor={`year-${key}`} required error={state.errors?.year}>
          <Input
            id={`year-${key}`}
            name="year"
            required
            defaultValue={certificate?.year}
            placeholder="2024"
            invalid={Boolean(state.errors?.year)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label="Credential URL"
          htmlFor={`url-${key}`}
          error={state.errors?.url}
          className="sm:col-span-2"
        >
          <Input
            id={`url-${key}`}
            name="url"
            defaultValue={certificate?.url ?? ""}
            placeholder="https://…"
            invalid={Boolean(state.errors?.url)}
          />
        </Field>

        <Field label="Sort order" htmlFor={`order-${key}`}>
          <Input
            id={`order-${key}`}
            name="order"
            type="number"
            defaultValue={certificate?.order ?? 0}
          />
        </Field>
      </div>
    </>
  );
}

export function CertificatesManager({
  certificates,
}: {
  certificates: Certificate[];
}) {
  return (
    <div className="space-y-4">
      <AddPanel
        action={createCertificate}
        label="Add a certificate"
        fields={(state) => fields(state)}
      />

      {certificates.map((certificate) => (
        <EditableCard
          key={certificate.id}
          id={certificate.id}
          title={certificate.title}
          subtitle={certificate.issuer}
          badges={<Badge tone="neutral">{certificate.year}</Badge>}
          updateAction={updateCertificate}
          deleteAction={deleteCertificate}
          fields={(state) => fields(state, certificate)}
        />
      ))}
    </div>
  );
}
