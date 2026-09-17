"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/auth/dal";
import { postSchema } from "@/lib/validations";
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

const CHECKBOXES = ["published", "featured"];

function revalidatePosts(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

/**
 * Publishing without an explicit date should stamp "now", and un-publishing
 * should not silently lose the date the author chose.
 */
function withPublishDate<T extends { published: boolean; publishedAt: Date | null }>(
  data: T,
): T {
  if (data.published && !data.publishedAt) {
    return { ...data, publishedAt: new Date() };
  }
  return data;
}

export async function createPost(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const parsed = postSchema.safeParse(
    withCheckboxDefaults(formDataToObject(formData), CHECKBOXES),
  );

  if (!parsed.success) return validationFailed(parsed.error);

  try {
    await prisma.post.create({ data: withPublishDate(parsed.data) });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "That slug is already taken.",
        errors: { slug: "A post with this slug already exists." },
      };
    }
    console.error("createPost failed", error);
    return failure("Could not create the post.");
  }

  revalidatePosts(parsed.data.slug);
  redirect("/admin/blog");
}

export async function updatePost(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return failure("Missing post id.");

  const parsed = postSchema.safeParse(
    withCheckboxDefaults(formDataToObject(formData), CHECKBOXES),
  );

  if (!parsed.success) return validationFailed(parsed.error);

  const previous = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, coverImage: true },
  });

  try {
    await prisma.post.update({ where: { id }, data: withPublishDate(parsed.data) });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "That slug is already taken.",
        errors: { slug: "A post with this slug already exists." },
      };
    }
    console.error("updatePost failed", error);
    return failure("Could not save the post.");
  }

  revalidatePosts(parsed.data.slug);
  if (previous && previous.slug !== parsed.data.slug) {
    revalidatePath(`/blog/${previous.slug}`);
  }

  // Only after the row is saved, so a failed save never loses the old image.
  await replaceUpload(previous?.coverImage, parsed.data.coverImage);

  return success("Post saved.");
}

export async function deletePost(formData: FormData) {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const post = await prisma.post.delete({ where: { id } });
  await deleteUpload(post.coverImage);
  revalidatePosts(post.slug);
}

export async function togglePostPublished(formData: FormData) {
  await assertAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { published: true, publishedAt: true, slug: true },
  });
  if (!post) return;

  const nextPublished = !post.published;

  await prisma.post.update({
    where: { id },
    data: {
      published: nextPublished,
      publishedAt: nextPublished && !post.publishedAt ? new Date() : post.publishedAt,
    },
  });

  revalidatePosts(post.slug);
}
