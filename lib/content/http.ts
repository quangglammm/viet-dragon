import { z } from "zod";
import { getLogger } from "@/lib/logger";
import type { EntityRef } from "./compose";
import type { Draft } from "./drafts";
import { Conflict, Invalid, NotFound, zodIssues, type Issue } from "./errors";
import { decodeEntityId, entityTypeFromUrl } from "./identity";
import { restoredVersionOf } from "./restore";
import { parseOptions } from "./schemas";
import type { DraftEntityType } from "@/lib/db/content/drafts";

// What every /api/admin/content/* handler shares: reading the URL, the body and the preconditions, and answering errors in the
// shape the rest of the admin API already uses (lib/dal.ts denials, the legacy routes) — `{ error: <message>, code }` — plus
// `issues` (422, per field) or `changes` (409, field-level diff). The domain services (drafts, publish, delete…) know nothing of HTTP.

const log = getLogger("content-api");

/** A document with every language of a long post is well under this; anything bigger is a mistake or an attack. */
export const MAX_BODY_BYTES = 2 * 1024 * 1024;

/** A refusal about the request itself (not about the content): bad JSON, too large, a missing precondition. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export type TypeContext = { params: Promise<{ type: string }> };
export type EntityContext = { params: Promise<{ type: string; id: string }> };
export type RevisionContext = { params: Promise<{ type: string; id: string; version: string }> };

// ───────────── the URL ─────────────

export async function typeFromParams(params: Promise<{ type: string }>): Promise<DraftEntityType> {
  const type = entityTypeFromUrl((await params).type);
  if (!type) throw new NotFound("Không có loại nội dung này.");
  return type;
}

export async function entityFromParams(params: Promise<{ type: string; id: string }>): Promise<EntityRef> {
  const { type: rawType, id: rawId } = await params;
  const type = entityTypeFromUrl(rawType);
  const id = type ? decodeEntityId(type, rawId) : null;
  if (!type || !id) throw new NotFound("Không tìm thấy nội dung.");
  return { type, id };
}

export function versionFromParam(raw: string): number {
  if (!/^[1-9]\d*$/.test(raw)) throw new NotFound("Không tìm thấy phiên bản.");
  return Number(raw);
}

// ───────────── preconditions ─────────────

function parseVersion(header: string): number {
  const match = /^\s*(?:W\/)?"?(\d+)"?\s*$/.exec(header);
  if (!match) throw new HttpError(400, "INVALID_IF_MATCH", "Tiêu đề If-Match phải là số phiên bản của bản nháp, ví dụ \"3\".");
  return Number(match[1]);
}

/** The `draftVersion` the editor loaded or previewed. Saving and publishing are refused without it (428). */
export function requireIfMatch(request: Request): number {
  const header = request.headers.get("if-match");
  if (header === null) {
    throw new HttpError(428, "PRECONDITION_REQUIRED", "Thiếu tiêu đề If-Match: hãy gửi phiên bản bản nháp bạn đang xem.");
  }
  return parseVersion(header);
}

export function optionalIfMatch(request: Request): number | undefined {
  const header = request.headers.get("if-match");
  return header === null ? undefined : parseVersion(header);
}

// ───────────── the body ─────────────

const tooLarge = () => new HttpError(413, "PAYLOAD_TOO_LARGE", "Nội dung gửi lên quá lớn (tối đa 2 MB).");

/** Reads at most MAX_BODY_BYTES: the declared length is checked first, and the stream is cut off if it lies or is missing. */
async function readTextCapped(request: Request): Promise<string> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw tooLarge();
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw tooLarge();
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** The JSON body, validated by `schema`. With `optional`, no body at all means `{}`. Never `request.json() as T`. */
export async function readJson<S extends z.ZodType>(request: Request, schema: S, { optional = false }: { optional?: boolean } = {}): Promise<z.output<S>> {
  const text = await readTextCapped(request);
  let value: unknown = {};
  if (text.trim() !== "") {
    try {
      value = JSON.parse(text);
    } catch {
      throw new HttpError(400, "INVALID_JSON", "Nội dung gửi lên không phải JSON hợp lệ.");
    }
  } else if (!optional) {
    throw new HttpError(400, "EMPTY_BODY", "Thiếu nội dung JSON.");
  }
  const parsed = schema.safeParse(value, parseOptions);
  if (!parsed.success) throw new Invalid(zodIssues(parsed.error));
  return parsed.data;
}

// ───────────── the answer ─────────────

export function json(body: unknown, { status = 200, etag }: { status?: number; etag?: number } = {}): Response {
  const headers = new Headers({ "cache-control": "no-store" });
  if (etag !== undefined) headers.set("etag", `"${etag}"`);
  return Response.json(body, { status, headers });
}

export const noContent = (): Response => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

const failure = (status: number, code: string, message: string, extra: Record<string, unknown> = {}): Response => json({ error: message, code, ...extra }, { status });

/** The one place a thrown error becomes a response. Anything unexpected is logged and answered without details. */
export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) return failure(error.status, error.code, error.message);
  if (error instanceof NotFound) return failure(404, error.code, error.message);
  if (error instanceof Invalid) return failure(422, error.code, error.message, { issues: error.issues });
  if (error instanceof Conflict) return failure(409, error.code, error.message, error.changes.length > 0 ? { changes: error.changes } : {});
  log.error({ err: error }, "unhandled error in a content route");
  return failure(500, "INTERNAL", "Lỗi hệ thống. Vui lòng thử lại.");
}

/** Runs a handler body and turns what it throws into the standard error response. */
export async function handle(action: () => Promise<Response>): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    return errorResponse(error);
  }
}

/** A draft as the editor receives it, with the advice on what is still missing. */
export function draftBody(draft: Draft, issues: readonly Issue[]) {
  return {
    draft: {
      ref: draft.ref,
      baseVersion: draft.baseVersion,
      draftVersion: draft.draftVersion,
      snapshot: draft.snapshot,
      restoredFrom: restoredVersionOf(draft.note),
      createdBy: draft.createdBy,
      updatedBy: draft.updatedBy,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    },
    issues,
  };
}
