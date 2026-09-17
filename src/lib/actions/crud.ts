import "server-only";

import { revalidatePath } from "next/cache";
import type { output, ZodType } from "zod";

import { assertAdmin } from "@/lib/auth/dal";
import {
  failure,
  formDataToObject,
  isUniqueConstraintError,
  success,
  validationFailed,
  withCheckboxDefaults,
} from "@/lib/actions/helpers";
import type { FormState } from "@/lib/actions/types";
import { deleteUpload, replaceUpload } from "@/lib/storage";

/**
 * The slice of a Prisma model delegate these helpers touch. Prisma's real
 * delegate types are generic over select/include, so callers pass theirs
 * through `asWriteDelegate` — the shapes line up at runtime, and every call
 * site still validates its payload with a Zod schema first.
 */
export type WriteDelegate<TData> = {
  findUnique(args: { where: { id: string } }): Promise<Record<string, unknown> | null>;
  create(args: { data: TData }): Promise<{ id: string }>;
  update(args: { where: { id: string }; data: TData }): Promise<{ id: string }>;
  delete(args: { where: { id: string } }): Promise<Record<string, unknown>>;
};

export function asWriteDelegate<TData>(delegate: unknown): WriteDelegate<TData> {
  return delegate as WriteDelegate<TData>;
}

export type CrudConfig<TSchema extends ZodType> = {
  schema: TSchema;
  delegate: WriteDelegate<output<TSchema>>;
  /** Checkbox field names, which are absent from FormData when unchecked. */
  checkboxes?: string[];
  /** Paths to purge after any write. */
  paths: string[];
  /** Human label used in the success and failure messages. */
  label: string;
  /** Field to blame when a unique constraint trips. */
  uniqueField?: string;
  /** URL fields holding uploaded files, cleaned up when replaced or deleted. */
  uploadFields?: string[];
};

/** The upload URL stored in `field`, if the record has one. */
function uploadUrl(record: Record<string, unknown> | null, field: string) {
  const value = record?.[field];
  return typeof value === "string" ? value : null;
}

function revalidateAll(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function createEntityAction<TSchema extends ZodType>(config: CrudConfig<TSchema>) {
  return async function create(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    await assertAdmin();

    const parsed = config.schema.safeParse(
      withCheckboxDefaults(formDataToObject(formData), config.checkboxes ?? []),
    );

    if (!parsed.success) return validationFailed(parsed.error);

    try {
      await config.delegate.create({ data: parsed.data });
    } catch (error) {
      if (isUniqueConstraintError(error) && config.uniqueField) {
        return {
          status: "error",
          message: "That value is already in use.",
          errors: { [config.uniqueField]: "This value must be unique." },
        };
      }
      console.error(`create ${config.label} failed`, error);
      return failure(`Could not create the ${config.label}.`);
    }

    revalidateAll(config.paths);
    return success(`${config.label} created.`);
  };
}

export function updateEntityAction<TSchema extends ZodType>(config: CrudConfig<TSchema>) {
  return async function update(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    await assertAdmin();

    const id = formData.get("id");
    if (typeof id !== "string" || !id) return failure("Missing record id.");

    const parsed = config.schema.safeParse(
      withCheckboxDefaults(formDataToObject(formData), config.checkboxes ?? []),
    );

    if (!parsed.success) return validationFailed(parsed.error);

    const previous = config.uploadFields?.length
      ? await config.delegate.findUnique({ where: { id } })
      : null;

    try {
      await config.delegate.update({ where: { id }, data: parsed.data });
    } catch (error) {
      if (isUniqueConstraintError(error) && config.uniqueField) {
        return {
          status: "error",
          message: "That value is already in use.",
          errors: { [config.uniqueField]: "This value must be unique." },
        };
      }
      console.error(`update ${config.label} failed`, error);
      return failure(`Could not save the ${config.label}.`);
    }

    const next = parsed.data as Record<string, unknown>;
    for (const field of config.uploadFields ?? []) {
      await replaceUpload(uploadUrl(previous, field), uploadUrl(next, field));
    }

    revalidateAll(config.paths);
    return success(`${config.label} saved.`);
  };
}

export function deleteEntityAction<TSchema extends ZodType>(config: CrudConfig<TSchema>) {
  return async function remove(formData: FormData): Promise<void> {
    await assertAdmin();

    const id = formData.get("id");
    if (typeof id !== "string" || !id) return;

    const removed = await config.delegate.delete({ where: { id } });
    for (const field of config.uploadFields ?? []) {
      await deleteUpload(uploadUrl(removed, field));
    }
    revalidateAll(config.paths);
  };
}
