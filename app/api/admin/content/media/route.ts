import { z } from "zod";
import { recordAudit, requestMeta, type AuditAction } from "@/lib/auth/audit";
import { requireApiUser, type SessionUser } from "@/lib/dal";
import { getDb } from "@/lib/db";
import { getMediaEnv } from "@/lib/env";
import { Invalid, zodIssues } from "@/lib/content/errors";
import { handle, json, noContent, readJson } from "@/lib/content/http";
import { listMedia, listMediaFolders, MAX_MEDIA_PAGE_SIZE } from "@/lib/content/media-library";
import { parseOptions } from "@/lib/content/schemas";
import { consumeLimit, tooManyRequests } from "@/lib/rate-limit";
import { readUploadedFile } from "@/lib/media/request";
import { deleteUpload, uploadImage } from "@/lib/media/service";

const MEGABYTE = 1024 * 1024;
/** 30 pictures in ten minutes is a busy editor; more is a script, or somebody else holding the account. */
const UPLOAD_THROTTLE = { purpose: "upload-user", windowSeconds: 10 * 60, max: 30 } as const;

const query = z.strictObject({
  q: z.string().trim().max(100).optional(),
  kind: z.enum(["image", "video"]).optional(),
  source: z.enum(["static", "upload"]).optional(),
  order: z.enum(["name", "newest"]).optional(),
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

/** The files an image field can point at, with the folders to filter by and the largest upload the server takes (so the UI can refuse a big file before sending it). */
export async function GET(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  return handle(async () => {
    const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams), parseOptions);
    if (!parsed.success) throw new Invalid(zodIssues(parsed.error));
    const [page, folders] = await Promise.all([listMedia(getDb(), parsed.data), listMediaFolders(getDb())]);
    return json({ ...page, folders, maxUploadBytes: getMediaEnv().MEDIA_MAX_IMAGE_MB * MEGABYTE });
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
    // Counted before the body is read: a refused request costs nothing but this one query.
    const throttle = await consumeLimit(getDb(), { ...UPLOAD_THROTTLE, subject: auth.user.id });
    if (!throttle.allowed) return tooManyRequests(throttle, "Bạn tải ảnh lên quá nhanh. Vui lòng đợi ít phút rồi tiếp tục.");

    const { MEDIA_MAX_IMAGE_MB, MEDIA_MAX_TOTAL_MB } = getMediaEnv();
    const file = await readUploadedFile(request, MEDIA_MAX_IMAGE_MB * MEGABYTE);
    const result = await uploadImage(getDb(), { bytes: file.bytes, name: file.name, author: auth.user.id, quotaBytes: MEDIA_MAX_TOTAL_MB * MEGABYTE });
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
