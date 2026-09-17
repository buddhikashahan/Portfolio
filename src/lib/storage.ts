import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Local-disk upload storage.
 *
 * Files live in `storage/uploads/` — deliberately outside `public/`, which is a
 * build-time asset folder rather than a place to write to at runtime — and are
 * served by `app/uploads/[...path]/route.ts`. Everything that knows where
 * uploads physically live is in this module, so moving to S3, R2 or Vercel Blob
 * means reimplementing these four functions and nothing else.
 */

export const UPLOAD_URL_PREFIX = "/uploads/";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

type UploadKind = "image" | "document";

type FileType = {
  ext: string;
  mime: string;
  /** Leading bytes that identify the format, checked against the file itself. */
  signature: (bytes: Uint8Array) => boolean;
};

const startsWith = (bytes: Uint8Array, prefix: number[], offset = 0) =>
  prefix.every((byte, index) => bytes[offset + index] === byte);

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

const FILE_TYPES: Record<UploadKind, FileType[]> = {
  image: [
    { ext: "jpg", mime: "image/jpeg", signature: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
    {
      ext: "png",
      mime: "image/png",
      signature: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    },
    { ext: "gif", mime: "image/gif", signature: (b) => startsWith(b, ascii("GIF8")) },
    {
      ext: "webp",
      mime: "image/webp",
      signature: (b) => startsWith(b, ascii("RIFF")) && startsWith(b, ascii("WEBP"), 8),
    },
    {
      ext: "avif",
      mime: "image/avif",
      signature: (b) => startsWith(b, ascii("ftypavif"), 4),
    },
  ],
  document: [
    { ext: "pdf", mime: "application/pdf", signature: (b) => startsWith(b, ascii("%PDF-")) },
  ],
};

export const UPLOAD_LIMITS: Record<UploadKind, number> = {
  image: 5 * 1024 * 1024,
  document: 8 * 1024 * 1024,
};

const MIME_BY_EXT = Object.fromEntries(
  Object.values(FILE_TYPES)
    .flat()
    .map((type) => [type.ext, type.mime]),
);

export class UploadError extends Error {}

/**
 * Validate and persist an uploaded file, returning its public URL.
 *
 * The type is decided by the file's own leading bytes, not by the extension or
 * the browser-supplied MIME type — both are attacker-controlled. SVG is
 * intentionally unsupported: it can carry script, and serving user SVG from the
 * site's own origin is an XSS vector.
 */
export async function saveUpload(file: File, kind: UploadKind): Promise<string> {
  if (file.size === 0) {
    throw new UploadError("The file is empty.");
  }

  if (file.size > UPLOAD_LIMITS[kind]) {
    const mb = Math.round(UPLOAD_LIMITS[kind] / 1024 / 1024);
    throw new UploadError(`Files must be ${mb} MB or smaller.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = FILE_TYPES[kind].find((candidate) => candidate.signature(bytes));

  if (!type) {
    const allowed = FILE_TYPES[kind].map((candidate) => candidate.ext.toUpperCase());
    throw new UploadError(`Unsupported file. Use ${allowed.join(", ")}.`);
  }

  // Random names are unguessable and never reused, which is what lets the
  // serving route mark responses immutable.
  const filename = `${randomUUID()}.${type.ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return `${UPLOAD_URL_PREFIX}${filename}`;
}

/** Map a request path onto a file inside the upload directory, or null. */
function resolveInsideUploads(relative: string) {
  const absolute = path.resolve(UPLOAD_DIR, relative);
  // Reject anything that escapes the directory (`../`, absolute paths, etc.).
  return absolute.startsWith(UPLOAD_DIR + path.sep) ? absolute : null;
}

export async function readUpload(segments: string[]) {
  const absolute = resolveInsideUploads(segments.join("/"));
  if (!absolute) return null;

  const ext = path.extname(absolute).slice(1).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return null;

  try {
    return { body: await readFile(absolute), mime };
  } catch {
    return null;
  }
}

/**
 * Remove a previously uploaded file. Only URLs this module issued are touched,
 * so seeded remote images and hand-entered paths are left alone.
 */
export async function deleteUpload(url: string | null | undefined) {
  if (!url?.startsWith(UPLOAD_URL_PREFIX)) return;

  const absolute = resolveInsideUploads(url.slice(UPLOAD_URL_PREFIX.length));
  if (!absolute) return;

  try {
    await unlink(absolute);
  } catch (error) {
    // Already gone is the outcome we wanted; anything else is worth logging.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to delete upload", url, error);
    }
  }
}

/** Delete the old file when a record's upload field has been replaced or cleared. */
export async function replaceUpload(previous: string | null | undefined, next: string | null) {
  if (previous && previous !== next) {
    await deleteUpload(previous);
  }
}
