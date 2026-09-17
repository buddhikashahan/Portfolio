"use client";

import { useState } from "react";

import { Field, Input } from "@/components/ui/field";
import { slugify } from "@/lib/utils";

/**
 * Title + slug pair. For a new record the slug follows the title as you type,
 * until you edit the slug yourself. For an existing record it never changes on
 * its own — silently rewriting a published URL would break inbound links.
 */
export function TitleSlugFields({
  defaultTitle = "",
  defaultSlug = "",
  basePath,
  titleError,
  slugError,
  titlePlaceholder,
}: {
  defaultTitle?: string;
  defaultSlug?: string;
  /** Public URL prefix shown in the hint, e.g. "/projects". */
  basePath: string;
  titleError?: string;
  slugError?: string;
  titlePlaceholder?: string;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultSlug));

  return (
    <>
      <Field label="Title" htmlFor="title" required error={titleError}>
        <Input
          id="title"
          name="title"
          required
          value={title}
          placeholder={titlePlaceholder}
          invalid={Boolean(titleError)}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
        />
      </Field>

      <Field
        label="URL slug"
        htmlFor="slug"
        required
        hint={`${basePath}/${slug || "your-slug"}`}
        error={slugError}
      >
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          className="font-mono text-xs"
          invalid={Boolean(slugError)}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value) || event.target.value.toLowerCase());
          }}
        />
      </Field>
    </>
  );
}
