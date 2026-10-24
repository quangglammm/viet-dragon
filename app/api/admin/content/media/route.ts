import { z } from "zod";
import { requireApiUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { Invalid, zodIssues } from "@/lib/content/errors";
import { handle, json } from "@/lib/content/http";
import { listMedia, listMediaFolders, MAX_MEDIA_PAGE_SIZE } from "@/lib/content/media-library";
import { parseOptions } from "@/lib/content/schemas";

const query = z.strictObject({
  q: z.string().trim().max(100).optional(),
  kind: z.enum(["image", "video"]).optional(),
  folder: z
    .string()
    .max(100)
    .regex(/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/, "Thư mục không hợp lệ.")
    .refine((folder) => folder.split("/").every((part) => part !== "." && part !== ".."), "Thư mục không hợp lệ.")
    .optional(),
  limit: z.coerce.number().int().min(1).max(MAX_MEDIA_PAGE_SIZE).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/** The files an image field can point at, with the folders to filter by. Read-only: uploading arrives with Phase 5. */
export async function GET(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams), parseOptions);
    if (!parsed.success) throw new Invalid(zodIssues(parsed.error));
    const [page, folders] = await Promise.all([listMedia(getDb(), parsed.data), listMediaFolders(getDb())]);
    return json({ ...page, folders });
  });
}
