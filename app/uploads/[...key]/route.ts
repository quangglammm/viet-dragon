import { getDb } from "@/lib/db";
import { parseUploadPath, UPLOAD_PREFIX } from "@/lib/media/formats";
import { readUploadRecord } from "@/lib/media/service";
import { readUpload } from "@/lib/media/store";
import { getLogger } from "@/lib/logger";

// Serves the files that were uploaded through the admin (lib/media). The site's own pictures are in `public/` and never come here; a file on the
// volume that has no row (or a row that is not an upload) is not served, so deleting the row is what takes a file off the site.
//
// The URL is the file's storage key, `uploads/<year>/<name>-<hash>.webp`. A key's bytes never change, so the answer may be cached for good.

const log = getLogger("media");

type Context = { params: Promise<{ key: string[] }> };

const notFound = (): Response => new Response("Not found", { status: 404, headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8" } });

/** `If-None-Match` is a list of (possibly weak) entity tags. */
const matches = (header: string | null, etag: string): boolean => header !== null && header.split(",").some((tag) => tag.trim().replace(/^W\//, "") === etag);

async function serve(request: Request, { params }: Context, headOnly: boolean): Promise<Response> {
  const key = parseUploadPath([UPLOAD_PREFIX, ...(await params).key]);
  if (!key) return notFound();
  const record = await readUploadRecord(getDb(), key);
  if (!record) return notFound();

  const etag = `"${record.sha256}"`;
  const headers = new Headers({
    "content-type": record.mime,
    etag,
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
    // An image has no use for anything else; if a file ever were something else, the browser would not run it.
    "content-security-policy": "default-src 'none'; sandbox",
    "content-disposition": "inline",
  });
  if (matches(request.headers.get("if-none-match"), etag)) return new Response(null, { status: 304, headers });

  const bytes = await readUpload(key);
  if (!bytes) {
    log.error({ key }, "an upload has a row but its file is missing from the volume");
    return notFound();
  }
  headers.set("content-length", String(bytes.length));
  return new Response(headOnly ? null : new Uint8Array(bytes), { status: 200, headers });
}

export const GET = (request: Request, context: Context) => serve(request, context, false);
export const HEAD = (request: Request, context: Context) => serve(request, context, true);
