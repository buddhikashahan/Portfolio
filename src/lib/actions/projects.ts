"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/auth/dal";
import { projectSchema } from "@/lib/validations";
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

const CHECKBOXES = ["featured", "published"];

/** Every surface that renders project data, refreshed after a write. */
function revalidateProjects(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function createProject(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const parsed = projectSchema.safeParse(
    withCheckboxDefaults(formDataToObject(formData), CHECKBOXES),
  );

  if (!parsed.success) return validationFailed(parsed.error);

  try {
    await prisma.project.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "That slug is already taken.",
        errors: { slug: "A project with this slug already exists." },
      };
    }
    console.error("createProject failed", error);
    return failure("Could not create the project.");
  }

  revalidateProjects(parsed.data.slug);
  redirect("/admin/projects");
}

export async function updateProject(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return failure("Missing project id.");

  const parsed = projectSchema.safeParse(
    withCheckboxDefaults(formDataToObject(formData), CHECKBOXES),
  );

  if (!parsed.success) return validationFailed(parsed.error);

  const previous = await prisma.project.findUnique({
    where: { id },
    select: { slug: true, coverImage: true },
  });

  try {
    await prisma.project.update({ where: { id }, data: parsed.data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "That slug is already taken.",
        errors: { slug: "A project with this slug already exists." },
      };
    }
    console.error("updateProject failed", error);
    return failure("Could not save the project.");
  }

  // Renaming the slug orphans the old path, so purge both.
  revalidateProjects(parsed.data.slug);
  if (previous && previous.slug !== parsed.data.slug) {
    revalidatePath(`/projects/${previous.slug}`);
  }

  // Only after the row is saved, so a failed save never loses the old image.
  await replaceUpload(previous?.coverImage, parsed.data.coverImage);

  return success("Project saved.");
}

export async function deleteProject(formData: FormData) {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const project = await prisma.project.delete({ where: { id } });
  await deleteUpload(project.coverImage);
  revalidateProjects(project.slug);
}

/** Inline publish/unpublish from the list view. */
export async function toggleProjectPublished(formData: FormData) {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { published: true, slug: true },
  });
  if (!project) return;

  await prisma.project.update({
    where: { id },
    data: { published: !project.published },
  });

  revalidateProjects(project.slug);
}
