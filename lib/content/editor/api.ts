import type { Change } from "../diff";
import type { DraftEntityType } from "../entity-types";
import type { Issue } from "../errors";
import { encodeEntityId, entityTypeToUrl } from "../identity";
import type { Json } from "./paths";

// The admin editors' client for /api/admin/content (contract: docs/admin-api.md). It never throws: a failure — including no
// connection at all — is an `ApiProblem` the editor can show. Dates arrive as ISO strings.

export interface Ref {
  type: DraftEntityType;
  id: string;
}

export interface ApiProblem {
  /** 0 = the request never got an answer. */
  status: number;
  code: string;
  message: string;
  issues?: Issue[];
  changes?: Change[];
}

export type ApiResult<T> = { ok: true; data: T; etag?: number } | { ok: false; problem: ApiProblem };

export type Document = { [key: string]: Json };

export interface DraftPayload {
  draft: {
    ref: Ref;
    baseVersion: number | null;
    draftVersion: number;
    snapshot: Document;
    restoredFrom: number | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
  };
  issues: Issue[];
}

export interface SummaryRow {
  ref: Ref;
  label: string | null;
  status: "published" | "archived" | null;
  version: number | null;
  updatedAt: string | null;
  group: string | null;
  draft: { draftVersion: number; baseVersion: number | null; updatedAt: string; updatedBy: string | null } | null;
}

export interface RevisionRow {
  version: number;
  action: "import" | "create" | "update" | "archive" | "restore" | "delete";
  comment: string | null;
  author: string | null;
  createdAt: string;
}

export interface MediaRow {
  key: string;
  source: "static" | "upload";
  kind: "image" | "video";
  mime: string;
  width: number | null;
  height: number | null;
  bytes: number;
  alt: string | null;
  createdAt: string;
}

export interface MediaQueryParams {
  q?: string;
  kind?: "image" | "video";
  folder?: string;
  offset?: number;
  limit?: number;
}

export interface PublishPayload {
  ref: Ref;
  version: number;
  action: RevisionRow["action"];
}

const NETWORK_PROBLEM: ApiProblem = { status: 0, code: "NETWORK", message: "Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại." };
const BASE = "/api/admin/content";
const PREVIEW_URL = "/api/admin/preview";

const entityUrl = (ref: Ref): string => `${BASE}/${entityTypeToUrl(ref.type)}/${encodeURIComponent(encodeEntityId(ref.type, ref.id))}`;

function etagOf(response: Response): number | undefined {
  const raw = response.headers.get("etag")?.replaceAll('"', "");
  return raw && /^\d+$/.test(raw) ? Number(raw) : undefined;
}

async function problemOf(response: Response): Promise<ApiProblem> {
  try {
    const body = (await response.json()) as { error?: unknown; code?: unknown; issues?: Issue[]; changes?: Change[] };
    return {
      status: response.status,
      code: typeof body.code === "string" ? body.code : "ERROR",
      message: typeof body.error === "string" ? body.error : "Có lỗi xảy ra. Vui lòng thử lại.",
      ...(body.issues ? { issues: body.issues } : {}),
      ...(body.changes ? { changes: body.changes } : {}),
    };
  } catch {
    return { status: response.status, code: "ERROR", message: "Có lỗi xảy ra. Vui lòng thử lại." };
  }
}

export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

export function createContentApi(fetcher: Fetcher = (input, init) => fetch(input, init)) {
  async function call<T>(method: string, url: string, { body, headers }: { body?: unknown; headers?: Record<string, string> } = {}): Promise<ApiResult<T>> {
    const init: RequestInit = { method, credentials: "same-origin", headers: { ...(method === "GET" ? {} : { "content-type": "application/json" }), ...headers } };
    if (body !== undefined) init.body = JSON.stringify(body);
    let response: Response;
    try {
      response = await fetcher(url, init);
    } catch {
      return { ok: false, problem: NETWORK_PROBLEM };
    }
    if (!response.ok) return { ok: false, problem: await problemOf(response) };
    if (response.status === 204) return { ok: true, data: undefined as T };
    try {
      return { ok: true, data: (await response.json()) as T, etag: etagOf(response) };
    } catch {
      return { ok: false, problem: { status: response.status, code: "BAD_RESPONSE", message: "Máy chủ trả về dữ liệu không đọc được." } };
    }
  }

  const ifMatch = (draftVersion: number) => ({ "if-match": `"${draftVersion}"` });
  const query = (params: Record<string, string | number | undefined>): string => {
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) if (value !== undefined && value !== "") search.set(name, String(value));
    const text = search.toString();
    return text ? `?${text}` : "";
  };

  return {
    list: (type: DraftEntityType) => call<{ items: SummaryRow[] }>("GET", `${BASE}/${entityTypeToUrl(type)}`),
    create: (type: DraftEntityType, input: { key?: string; snapshot: Document }) => call<DraftPayload>("POST", `${BASE}/${entityTypeToUrl(type)}`, { body: input }),
    live: (ref: Ref) => call<{ ref: Ref; version: number; document: Document }>("GET", entityUrl(ref)),
    getDraft: (ref: Ref) => call<DraftPayload>("GET", `${entityUrl(ref)}/draft`),
    openDraft: (ref: Ref) => call<DraftPayload>("POST", `${entityUrl(ref)}/draft`),
    saveDraft: (ref: Ref, snapshot: Document, draftVersion: number) => call<DraftPayload>("PUT", `${entityUrl(ref)}/draft`, { body: { snapshot }, headers: ifMatch(draftVersion) }),
    discardDraft: (ref: Ref, draftVersion?: number) => call<undefined>("DELETE", `${entityUrl(ref)}/draft`, { headers: draftVersion === undefined ? {} : ifMatch(draftVersion) }),
    diff: (ref: Ref) => call<{ changes: Change[] }>("GET", `${entityUrl(ref)}/draft/diff`),
    rebase: (ref: Ref) => call<DraftPayload>("POST", `${entityUrl(ref)}/draft/rebase`),
    publish: (ref: Ref, draftVersion: number, comment?: string) => call<PublishPayload>("POST", `${entityUrl(ref)}/publish`, { body: comment ? { comment } : {}, headers: ifMatch(draftVersion) }),
    revisions: (ref: Ref) => call<{ revisions: RevisionRow[] }>("GET", `${entityUrl(ref)}/revisions`),
    revision: (ref: Ref, version: number) => call<{ revision: RevisionRow & { snapshot: Document } }>("GET", `${entityUrl(ref)}/revisions/${version}`),
    restore: (ref: Ref, version: number) => call<DraftPayload>("POST", `${entityUrl(ref)}/restore`, { body: { version } }),
    usedBy: (ref: Ref) => call<{ live: number; drafts: number }>("GET", `${entityUrl(ref)}/used-by`),
    releaseAlias: (ref: Ref, body: { locale: string; slug: string; category?: string }) => call<{ ref: Ref; version: number }>("POST", `${entityUrl(ref)}/release-alias`, { body }),
    deleteEntity: (ref: Ref, comment?: string) => call<{ ref: Ref; version: number }>("DELETE", entityUrl(ref), { body: comment ? { comment } : {} }),
    /** Turns the preview on and answers the page that shows the draft, in `locale`. */
    previewDraft: (ref: Ref, locale: string) => call<{ url: string }>("POST", PREVIEW_URL, { body: { type: ref.type, id: ref.id, locale } }),
    media: (params: MediaQueryParams) => call<{ items: MediaRow[]; hasMore: boolean; folders: { folder: string; count: number }[] }>("GET", `${BASE}/media${query({ ...params })}`),
  };
}

export type ContentApi = ReturnType<typeof createContentApi>;
