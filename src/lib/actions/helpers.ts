import "server-only";

import type { z } from "zod";

import type { FormState } from "@/lib/actions/types";

/**
 * Flatten a Zod error into the `{ field: message }` shape the admin forms
 * render, keeping only the first message per field so the UI stays quiet.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export function validationFailed(error: z.ZodError, message = "Please fix the highlighted fields."): FormState {
  return { status: "error", message, errors: toFieldErrors(error) };
}

export function failure(message: string): FormState {
  return { status: "error", message };
}

export function success(message: string): FormState {
  return { status: "success", message };
}

/** Turn FormData into the plain object Zod expects, collapsing single values. */
export function formDataToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;

    if (key in result) {
      const existing = result[key];
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Unchecked checkboxes are simply absent from FormData, so Zod would see
 * `undefined` rather than `false`. Normalise them before parsing.
 */
export function withCheckboxDefaults(
  data: Record<string, unknown>,
  fields: string[],
): Record<string, unknown> {
  const next = { ...data };
  for (const field of fields) {
    next[field] = field in next ? next[field] : false;
  }
  return next;
}

/** Map Prisma unique-constraint failures onto the field that collided. */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
