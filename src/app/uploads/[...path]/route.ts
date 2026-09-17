import type { NextRequest } from "next/server";

import { readUpload } from "@/lib/storage";

/**
 * Serves files written by `saveUpload`. Filenames are random UUIDs that are
 * never reused, so responses can be cached forever.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/uploads/[...path]">) {
  const { path } = await ctx.params;
  const file = await readUpload(path);

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // PDFs open in the browser's viewer rather than forcing a download.
      "Content-Disposition": "inline",
    },
  });
}
