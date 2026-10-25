import { z } from "zod";
import { recordAudit, requestMeta, type AuditAction } from "@/lib/auth/audit";
import { requireApiUser, type SessionUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { getMediaEnv } from "@/lib/env";
import { Invalid, zodIssues } from "@/lib/content/errors";
import { handle, json, noContent, readJson } from "@/lib/content/http";
import { listMedia, listMediaFolders, MAX_MEDIA_PAGE_SIZE } from "@/lib/content/media-library";
import { parseOptions } from "@/lib/content/schemas";
import { readUploadedFile } from "@/lib/media/request";
import { deleteUpload, uploadImage } from "@/lib/media/service";

const MEGABYTE = 1024 * 1024;

const query = z.strictObject({
  q: z.string().trim().max(100).optional(),
  kind: z.enum(["image", "video"]).optional(),
  source: z.enum(["static", "upload"]).optional(),
  folder: z
    .string()
    .max(100)
    .regex(/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/, "Thư mục không hợp lệ.")
    .refine((folder) => folder.split("/").every((part) => part !== "." && part !== ".."), "Thư mục không hợp lệ.")
    .optional(),
  limit: z.coerce.number().int().min(1).max(MAX_MEDIA_PAGE_SIZE).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const deleteBody = z.strictObject({ key: z.string().min(1).max(300) });

async function auditMedia(request: Request, user: SessionUser, action: AuditAction, key: string, detail?: Record<string, unknown>): Promise<void> {
  await recordAudit({ actorId: user.id, actorLabel: user.email, action, entityType: "media", entityId: key, ...requestMeta(request.headers), detail });
}

/** The files an image field can point at, with the folders to filter by. */
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

/**
 * Adds one image to the library (multipart, a single `file` part). What is stored is not the file that was sent but a WebP made from its
 * pixels (lib/media/process.ts). `201 { item, existing: false }`, or `200 { item, existing: true }` when that same picture is already there.
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request, ["media", "upload"], { contentType: "multipart" });
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const file = await readUploadedFile(request, getMediaEnv().MEDIA_MAX_IMAGE_MB * MEGABYTE);
    const result = await uploadImage(getDb(), { bytes: file.bytes, name: file.name, author: auth.user.id });
    if (!result.existing) await auditMedia(request, auth.user, "media.uploaded", result.item.key, { bytes: result.item.bytes, width: result.item.width, height: result.item.height });
    return json(result, { status: result.existing ? 200 : 201 });
  });
}

/** Removes an upload from the library — admin only, and only while no document (live or draft) uses it. Body `{ key }`. */
export async function DELETE(request: Request) {
  const auth = await requireApiUser(request, ["media", "delete"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const { key } = await readJson(request, deleteBody);
    await deleteUpload(getDb(), key);
    await auditMedia(request, auth.user, "media.deleted", key);
    return noContent();
  });
}
