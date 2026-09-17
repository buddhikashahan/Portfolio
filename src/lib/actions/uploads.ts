"use server";

import { getCurrentUser } from "@/lib/auth/dal";
import { saveUpload, UploadError } from "@/lib/storage";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Called directly by the dashboard's upload fields as soon as a file is picked,
 * so the parent form only ever submits a URL. That keeps every content action
 * JSON-sized and lets the editor preview the image before saving.
 */
export async function uploadFile(formData: FormData): Promise<UploadResult> {
  // Returned rather than thrown: the field calls this directly, and a session
  // that expired mid-edit should read as a message, not an unhandled error.
  if (!(await getCurrentUser())) {
    return { ok: false, error: "Your session has expired. Sign in again to upload." };
  }

  const file = formData.get("file");
  const kind = formData.get("kind") === "document" ? "document" : "image";

  if (!(file instanceof File)) {
    return { ok: false, error: "No file was received." };
  }

  try {
    return { ok: true, url: await saveUpload(file, kind) };
  } catch (error) {
    if (error instanceof UploadError) {
      return { ok: false, error: error.message };
    }
    console.error("Upload failed", error);
    return { ok: false, error: "The upload failed. Please try again." };
  }
}
