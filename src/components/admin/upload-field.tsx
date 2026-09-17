"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { FileText, ImageUp, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";

import { uploadFile } from "@/lib/actions/uploads";
import { cn } from "@/lib/utils";

type UploadFieldProps = {
  /** Form field that receives the stored URL. */
  name: string;
  defaultValue?: string | null;
  kind?: "image" | "document";
  /** Preview frame shape for images. */
  aspect?: "video" | "square" | "portrait";
  id?: string;
  hint?: string;
};

const ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/avif",
  document: "application/pdf",
};

const ASPECT = {
  video: "aspect-video",
  square: "aspect-square max-w-40",
  portrait: "aspect-4/5 max-w-48",
};

/**
 * Upload-on-select file field. The file is sent the moment it is chosen and the
 * returned URL is mirrored into a hidden input, so the surrounding form submits
 * a plain string exactly as it did when URLs were typed by hand.
 *
 * Replacing or removing a file here only changes the form value; the previous
 * file is deleted server-side when the record is saved, so cancelling the edit
 * never destroys an image that is still in use.
 */
export function UploadField({
  name,
  defaultValue,
  kind = "image",
  aspect = "video",
  id,
  hint,
}: UploadFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const fileInput = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();

  function upload(file: File | undefined) {
    if (!file) return;
    setError(null);

    const body = new FormData();
    body.set("file", file);
    body.set("kind", kind);

    startTransition(async () => {
      const result = await uploadFile(body);
      if (result.ok) {
        setUrl(result.url);
      } else {
        setError(result.error);
      }
    });
  }

  const openPicker = () => fileInput.current?.click();

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <input
        ref={fileInput}
        id={inputId}
        type="file"
        accept={ACCEPT[kind]}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          upload(event.target.files?.[0]);
          // Reset so picking the same file again still fires onChange.
          event.target.value = "";
        }}
      />

      {url ? (
        <div className="flex flex-wrap items-start gap-4">
          {kind === "image" ? (
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-lg border border-hairline bg-surface-sunken",
                ASPECT[aspect],
              )}
            >
              <Image src={url} alt="" fill sizes="24rem" className="object-cover" />
              {pending ? (
                <div className="absolute inset-0 grid place-items-center bg-canvas/70">
                  <Loader2 className="size-5 animate-spin text-ink-muted" />
                </div>
              ) : null}
            </div>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-lg border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors hover:border-hairline-strong"
            >
              <FileText className="size-4 text-ink-subtle" aria-hidden />
              {url.split("/").pop()}
            </a>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={openPicker}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink disabled:opacity-50"
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Replace
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs text-ink-muted transition-colors hover:border-red-500/40 hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={pending}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            upload(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
            dragging
              ? "border-accent bg-accent/5"
              : "border-hairline-strong bg-surface hover:border-accent/50 hover:bg-surface-raised",
          )}
        >
          {pending ? (
            <Loader2 className="size-6 animate-spin text-ink-muted" aria-hidden />
          ) : kind === "image" ? (
            <ImageUp className="size-6 text-ink-subtle" aria-hidden />
          ) : (
            <UploadCloud className="size-6 text-ink-subtle" aria-hidden />
          )}
          <span className="text-sm font-medium text-ink">
            {pending ? "Uploading…" : "Click to upload or drag and drop"}
          </span>
          <span className="text-xs text-ink-subtle">
            {kind === "image" ? "JPG, PNG, WebP, GIF or AVIF · up to 5 MB" : "PDF · up to 8 MB"}
          </span>
        </button>
      )}

      <p aria-live="polite" className="text-xs">
        {error ? (
          <span className="text-red-500">{error}</span>
        ) : hint ? (
          <span className="text-ink-subtle">{hint}</span>
        ) : null}
      </p>
    </div>
  );
}
