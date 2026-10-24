import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// React's cache() memoises per server request; outside one it would pin the first result for the whole run.
vi.mock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), cache: <T>(fn: T) => fn }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }));

import { revalidateTag } from "next/cache";
import * as diffRoute from "@/app/api/admin/content/[type]/[id]/draft/diff/route";
import * as rebaseRoute from "@/app/api/admin/content/[type]/[id]/draft/rebase/route";
import * as draftRoute from "@/app/api/admin/content/[type]/[id]/draft/route";
import * as publishRoute from "@/app/api/admin/content/[type]/[id]/publish/route";
import * as releaseRoute from "@/app/api/admin/content/[type]/[id]/release-alias/route";
import * as restoreRoute from "@/app/api/admin/content/[type]/[id]/restore/route";
import * as revisionRoute from "@/app/api/admin/content/[type]/[id]/revisions/[version]/route";
import * as revisionsRoute from "@/app/api/admin/content/[type]/[id]/revisions/route";
import * as entityRoute from "@/app/api/admin/content/[type]/[id]/route";
import * as usedByRoute from "@/app/api/admin/content/[type]/[id]/used-by/route";
import * as listRoute from "@/app/api/admin/content/[type]/route";
import { getPool } from "@/lib/db";
import { MAX_BODY_BYTES, type EntityContext, type RevisionContext, type TypeContext } from "@/lib/content/http";
import { auditRows, createUser, login, ORIGIN, uniqueEmail } from "@/tests/helpers/auth";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";

// The content API end to end: real route handlers, real sessions, a seeded database. The domain rules are tested next to the
// services; this suite proves what only the HTTP layer can: who may call what, the preconditions, the error shapes, the
// effects after a commit (cache tags, audit rows).

let seeded: SeededDatabase;
let editor: { cookie: string; email: string };
let admin: { cookie: string; email: string };

beforeAll(async () => {
  seeded = await createSeededDatabase("content-api");
  // The app's own connection (getDb) must point at the seeded database: nothing has called it yet, so this is early enough.
  process.env.DATABASE_URL = seeded.scratch.url;
  for (const role of ["editor", "admin"] as const) {
    const email = uniqueEmail(role);
    await createUser(email, role);
    const user = { cookie: await login(email), email };
    if (role === "editor") editor = user;
    else admin = user;
  }
}, 180_000);

afterAll(async () => {
  await getPool().end();
  await seeded.close();
});

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
});

// ───────────── plumbing ─────────────

type CallInit = { cookie?: string; body?: unknown; raw?: string; headers?: Record<string, string>; origin?: string | null; contentType?: string | null };

async function call<C>(handler: (request: Request, context: C) => Promise<Response>, context: C, method: string, init: CallInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("cookie", init.cookie);
  if (init.origin !== null) headers.set("origin", init.origin ?? ORIGIN);
  const body = init.raw ?? (init.body === undefined ? undefined : JSON.stringify(init.body));
  if (method !== "GET" && init.contentType !== null) headers.set("content-type", init.contentType ?? "application/json");
  return handler(new Request(`${ORIGIN}/api/admin/content/x`, { method, headers, body }), context);
}

const typeCtx = (type: string): TypeContext => ({ params: Promise.resolve({ type }) });
const entityCtx = (type: string, id: string): EntityContext => ({ params: Promise.resolve({ type, id }) });
const revisionCtx = (type: string, id: string, version: string): RevisionContext => ({ params: Promise.resolve({ type, id, version }) });

type ErrorBody = { error: string; code: string; issues?: { path: string; message: string }[]; changes?: { path: string }[] };
type DraftResponse = { draft: { ref: { type: string; id: string }; baseVersion: number | null; draftVersion: number; snapshot: Record<string, unknown>; restoredFrom: number | null }; issues: { path: string; message: string }[] };
const read = async <T>(response: Response) => (await response.json()) as T;
const errorOf = async (response: Response) => read<ErrorBody>(response);
const etagOf = (response: Response) => Number(response.headers.get("etag")?.replaceAll('"', ""));

const productUid = (key: string) => seeded.outcome.products.get(key)!.uid;
const ifMatch = (version: number) => ({ "if-match": `"${version}"` });
const rows = async <T extends object>(sql: string, params: unknown[] = []): Promise<T[]> => (await getPool().query(sql, params)).rows as T[];

/** Opens the draft of a live product and returns it with its ETag. */
async function openDraft(type: string, id: string, cookie = editor.cookie) {
  const response = await call(draftRoute.POST, entityCtx(type, id), "POST", { cookie });
  expect(response.status).toBe(200);
  return { ...(await read<DraftResponse>(response)), etag: etagOf(response) };
}

// ───────────── who may call what ─────────────

const UID = "11111111-1111-4111-8111-111111111111";
const OTHER_BODY = { snapshot: {} };

// [name, mutating, how to call it]
const ROUTES: Array<[string, boolean, (init: CallInit) => Promise<Response>]> = [
  ["list GET", false, (i) => call(listRoute.GET, typeCtx("product"), "GET", i)],
  ["list POST", true, (i) => call(listRoute.POST, typeCtx("material"), "POST", { body: { key: "x", ...OTHER_BODY }, ...i })],
  ["entity GET", false, (i) => call(entityRoute.GET, entityCtx("product", UID), "GET", i)],
  ["entity DELETE", true, (i) => call(entityRoute.DELETE, entityCtx("product", UID), "DELETE", i)],
  ["draft GET", false, (i) => call(draftRoute.GET, entityCtx("product", UID), "GET", i)],
  ["draft POST", true, (i) => call(draftRoute.POST, entityCtx("product", UID), "POST", i)],
  ["draft PUT", true, (i) => call(draftRoute.PUT, entityCtx("product", UID), "PUT", { body: OTHER_BODY, headers: ifMatch(1), ...i })],
  ["draft DELETE", true, (i) => call(draftRoute.DELETE, entityCtx("product", UID), "DELETE", i)],
  ["diff GET", false, (i) => call(diffRoute.GET, entityCtx("product", UID), "GET", i)],
  ["rebase POST", true, (i) => call(rebaseRoute.POST, entityCtx("product", UID), "POST", i)],
  ["publish POST", true, (i) => call(publishRoute.POST, entityCtx("product", UID), "POST", { headers: ifMatch(1), ...i })],
  ["revisions GET", false, (i) => call(revisionsRoute.GET, entityCtx("product", UID), "GET", i)],
  ["revision GET", false, (i) => call(revisionRoute.GET, revisionCtx("product", UID, "1"), "GET", i)],
  ["restore POST", true, (i) => call(restoreRoute.POST, entityCtx("product", UID), "POST", { body: { version: 1 }, ...i })],
  ["used-by GET", false, (i) => call(usedByRoute.GET, entityCtx("material", "giay-loai-c"), "GET", i)],
  ["release-alias POST", true, (i) => call(releaseRoute.POST, entityCtx("product", UID), "POST", { body: { locale: "en", slug: "x" }, ...i })],
];

describe("authentication", () => {
  it.each(ROUTES)("%s answers 401 without a session", async (_name, _mutating, send) => {
    const response = await send({});
    expect(response.status).toBe(401);
    expect((await errorOf(response)).code).toBe("UNAUTHENTICATED");
  });

  it.each(ROUTES.filter(([, mutating]) => mutating))("%s refuses a request from another origin", async (_name, _mutating, send) => {
    const response = await send({ cookie: editor.cookie, origin: "https://evil.example" });
    expect(response.status).toBe(403);
    expect((await errorOf(response)).code).toBe("CROSS_ORIGIN");
  });

  it.each(ROUTES.filter(([, mutating]) => mutating))("%s refuses a body that is not JSON", async (_name, _mutating, send) => {
    // An admin: every permission passes, so what is left to refuse is the body type.
    const response = await send({ cookie: admin.cookie, contentType: "text/plain" });
    expect(response.status).toBe(415);
  });

  it.each(ROUTES)("%s refuses a user who still has to change the temporary password", async (_name, _mutating, send) => {
    const email = uniqueEmail("temp");
    await createUser(email, "editor", { mustChangePassword: true });
    const response = await send({ cookie: await login(email) });
    expect(response.status).toBe(403);
    expect((await errorOf(response)).code).toBe("PASSWORD_CHANGE_REQUIRED");
  });
});

describe("authorization", () => {
  it("an editor may edit and publish but NOT delete; an admin may", async () => {
    const [{ uid }] = await rows<{ uid: string }>(`select uid from showcase_item limit 1`);
    const denied = await call(entityRoute.DELETE, entityCtx("showcase-item", uid), "DELETE", { cookie: editor.cookie });
    expect(denied.status).toBe(403);
    expect((await errorOf(denied)).code).toBe("FORBIDDEN");
    expect(await rows(`select 1 from showcase_item where uid = $1`, [uid])).toHaveLength(1);

    const allowed = await call(entityRoute.DELETE, entityCtx("showcase-item", uid), "DELETE", { cookie: admin.cookie });
    expect(allowed.status).toBe(200);
    expect(await rows(`select 1 from showcase_item where uid = $1`, [uid])).toHaveLength(0);
  });
});

// ───────────── reading ─────────────

describe("reading", () => {
  it("lists an entity type with labels, versions and draft state", async () => {
    const response = await call(listRoute.GET, typeCtx("product"), "GET", { cookie: editor.cookie });
    expect(response.status).toBe(200);
    const { items } = await read<{ items: { ref: { id: string }; label: string; version: number; draft: unknown }[] }>(response);
    expect(items).toHaveLength(seeded.outcome.products.size);
    expect(items.every((item) => item.label && item.version >= 1 && item.draft === null)).toBe(true);
  });

  it("returns the live document with its version as the ETag", async () => {
    const uid = productUid("marketing/vouchers");
    const response = await call(entityRoute.GET, entityCtx("product", uid), "GET", { cookie: editor.cookie });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await read<{ version: number; document: { uid: string }; draft: unknown }>(response);
    expect(body.document.uid).toBe(uid);
    expect(etagOf(response)).toBe(body.version);
    expect(body.draft).toBeNull();
  });

  it("answers 404 for a type or id that does not exist, in the standard error shape", async () => {
    const cases = [
      call(listRoute.GET, typeCtx("products"), "GET", { cookie: editor.cookie }),
      call(entityRoute.GET, entityCtx("product", "to-roi"), "GET", { cookie: editor.cookie }),
      call(entityRoute.GET, entityCtx("product", "99999999-9999-4999-8999-999999999999"), "GET", { cookie: editor.cookie }),
      call(revisionRoute.GET, revisionCtx("product", productUid("marketing/vouchers"), "9999"), "GET", { cookie: editor.cookie }),
      call(revisionRoute.GET, revisionCtx("product", productUid("marketing/vouchers"), "abc"), "GET", { cookie: editor.cookie }),
      call(draftRoute.GET, entityCtx("product", productUid("marketing/vouchers")), "GET", { cookie: editor.cookie }),
    ];
    for (const response of await Promise.all(cases)) {
      expect(response.status).toBe(404);
      expect((await errorOf(response)).code).toBe("NOT_FOUND");
    }
  });
});

// ───────────── the editing cycle ─────────────

describe("saving a draft", () => {
  const uid = () => productUid("marketing/ve-tickets");
  let draft: Awaited<ReturnType<typeof openDraft>>;

  it("opens a draft that starts from the live version, and resumes it on the second call", async () => {
    draft = await openDraft("product", uid());
    expect(draft.draft.baseVersion).toBeGreaterThanOrEqual(1);
    expect(draft.etag).toBe(draft.draft.draftVersion);
    expect(draft.issues).toEqual([]);
    const again = await openDraft("product", uid(), admin.cookie);
    expect(again.draft.draftVersion).toBe(draft.draft.draftVersion);
  });

  it("needs If-Match (428), a version number (400), and the current version (409)", async () => {
    const snapshot = { ...draft.draft.snapshot };
    const missing = await call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, body: { snapshot } });
    expect(missing.status).toBe(428);
    expect((await errorOf(missing)).code).toBe("PRECONDITION_REQUIRED");

    const malformed = await call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, body: { snapshot }, headers: { "if-match": "abc" } });
    expect(malformed.status).toBe(400);

    const stale = await call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, body: { snapshot }, headers: ifMatch(draft.etag + 5) });
    expect(stale.status).toBe(409);
    expect((await errorOf(stale)).code).toBe("DRAFT_CHANGED");
  });

  it("refuses a body that is too large (413), not JSON (400), unknown fields (422) or another entity's document (422)", async () => {
    const send = (init: CallInit) => call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, headers: ifMatch(draft.etag), ...init });
    const big = await send({ raw: JSON.stringify({ snapshot: { ...draft.draft.snapshot, pad: "x".repeat(MAX_BODY_BYTES) } }) });
    expect(big.status).toBe(413);
    expect((await errorOf(big)).code).toBe("PAYLOAD_TOO_LARGE");
    expect((await send({ raw: "{not json" })).status).toBe(400);
    expect((await send({ body: { snapshot: draft.draft.snapshot, extra: 1 } })).status).toBe(422);
    const foreign = await send({ body: { snapshot: { ...draft.draft.snapshot, uid: productUid("marketing/vouchers") } } });
    expect(foreign.status).toBe(422);
    expect((await errorOf(foreign)).issues?.[0].path).toBe("uid");
  });

  it("saves, returns the new ETag and advice, and shows the change as a diff", async () => {
    const snapshot = structuredClone(draft.draft.snapshot) as { i18n: { vi: { title: string } } };
    snapshot.i18n.vi.title += " (bản nháp)";
    const saved = await call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, body: { snapshot }, headers: ifMatch(draft.etag) });
    expect(saved.status).toBe(200);
    expect(etagOf(saved)).toBe(draft.etag + 1);
    draft = { ...(await read<DraftResponse>(saved)), etag: etagOf(saved) };
    expect(draft.issues).toEqual([]);

    const diff = await call(diffRoute.GET, entityCtx("product", uid()), "GET", { cookie: editor.cookie });
    expect((await read<{ changes: { path: string; kind: string }[] }>(diff)).changes).toEqual([expect.objectContaining({ path: "i18n.vi.title", kind: "changed" })]);
  });

  it("gives advice on an incomplete draft instead of refusing to save it", async () => {
    const snapshot = structuredClone(draft.draft.snapshot) as { options: { material: string }[] };
    snapshot.options[0].material = "khong-co-chat-lieu";
    const saved = await call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, body: { snapshot }, headers: ifMatch(draft.etag) });
    expect(saved.status).toBe(200);
    const body = await read<DraftResponse>(saved);
    expect(body.issues).toContainEqual({ path: "options[0].material", message: "Không tìm thấy chất liệu «khong-co-chat-lieu»." });
    draft = { ...body, etag: etagOf(saved) };

    const read2 = await call(draftRoute.GET, entityCtx("product", uid()), "GET", { cookie: editor.cookie });
    expect((await read<DraftResponse>(read2)).issues).toHaveLength(1);
  });

  it("refuses to publish it: 422 naming the field, and the draft is kept", async () => {
    const refused = await call(publishRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie, headers: ifMatch(draft.etag) });
    expect(refused.status).toBe(422);
    const error = await errorOf(refused);
    expect(error.code).toBe("INVALID");
    expect(error.issues).toContainEqual({ path: "options[0].material", message: "Không tìm thấy chất liệu «khong-co-chat-lieu»." });
    expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled();
    expect((await call(draftRoute.GET, entityCtx("product", uid()), "GET", { cookie: editor.cookie })).status).toBe(200);
  });

  it("discards the draft (204), is audited, and then there is none (404)", async () => {
    const discarded = await call(draftRoute.DELETE, entityCtx("product", uid()), "DELETE", { cookie: editor.cookie, headers: ifMatch(draft.etag) });
    expect(discarded.status).toBe(204);
    expect(await auditRows({ action: "content.discarded", entityId: uid() })).toHaveLength(1);
    expect((await call(draftRoute.DELETE, entityCtx("product", uid()), "DELETE", { cookie: editor.cookie })).status).toBe(404);
  });
});

describe("publishing", () => {
  const key = "marketing/to-gap";
  const uid = () => productUid(key);

  it("needs If-Match and the version that was previewed", async () => {
    const draft = await openDraft("product", uid());
    const missing = await call(publishRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie });
    expect(missing.status).toBe(428);
    const stale = await call(publishRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie, headers: ifMatch(draft.etag + 1) });
    expect(stale.status).toBe(409);
    expect((await errorOf(stale)).code).toBe("DRAFT_CHANGED");
    await call(draftRoute.DELETE, entityCtx("product", uid()), "DELETE", { cookie: editor.cookie });
  });

  it("publishes, answers with the new version, invalidates the tags it touched and writes the audit row", async () => {
    const draft = await openDraft("product", uid());
    const snapshot = structuredClone(draft.draft.snapshot) as { i18n: { vi: { title: string } }; category: string };
    snapshot.i18n.vi.title += " ✓";
    const saved = await call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, body: { snapshot }, headers: ifMatch(draft.etag) });
    const savedEtag = etagOf(saved);

    const response = await call(publishRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie, headers: ifMatch(savedEtag), body: { comment: "đổi tên" } });
    expect(response.status).toBe(200);
    const body = await read<{ version: number; action: string }>(response);
    expect(body).toMatchObject({ version: draft.draft.baseVersion! + 1, action: "update" });
    expect(etagOf(response)).toBe(body.version);

    const tags = vi.mocked(revalidateTag).mock.calls.map(([tag, profile]) => [tag, profile]);
    expect(tags).toContainEqual(["content", { expire: 0 }]);
    expect(tags).toContainEqual([`content:product:${uid()}`, { expire: 0 }]);
    expect(tags).toContainEqual([`content:menu:${snapshot.category}`, { expire: 0 }]);

    const [audit] = await auditRows({ action: "content.published", entityId: uid() });
    expect(audit).toMatchObject({ actor_label: editor.email, entity_type: "product" });
    expect(audit.detail).toEqual({ version: body.version, action: "update" });
    const [revision] = await rows<{ comment: string }>(`select comment from content_revision where entity_uid = $1 order by version desc limit 1`, [uid()]);
    expect(revision.comment).toBe("đổi tên");
    expect((await call(draftRoute.GET, entityCtx("product", uid()), "GET", { cookie: editor.cookie })).status).toBe(404);
  });

  it("a stale draft is a 409 that shows what changed; rebase is the knowing overwrite", async () => {
    const draft = await openDraft("product", uid());
    const snapshot = structuredClone(draft.draft.snapshot) as { i18n: { en: { title: string } } };
    snapshot.i18n.en.title = "Edited in a draft";
    const saved = await call(draftRoute.PUT, entityCtx("product", uid()), "PUT", { cookie: editor.cookie, body: { snapshot }, headers: ifMatch(draft.etag) });
    await getPool().query(`update product set version = version + 1 where uid = $1`, [uid()]);

    const refused = await call(publishRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie, headers: ifMatch(etagOf(saved)) });
    expect(refused.status).toBe(409);
    const error = await errorOf(refused);
    expect(error.code).toBe("STALE_BASE");
    expect(error.changes?.map((c) => c.path)).toContain("i18n.en.title");
    expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled();

    const rebased = await call(rebaseRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie });
    expect(rebased.status).toBe(200);
    const published = await call(publishRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie, headers: ifMatch(etagOf(rebased)) });
    expect(published.status).toBe(200);
  });

  it("an admin publishing a restore is audited as a restore", async () => {
    const revisions = await call(revisionsRoute.GET, entityCtx("product", uid()), "GET", { cookie: editor.cookie });
    const { revisions: list } = await read<{ revisions: { version: number; action: string }[] }>(revisions);
    expect(list.length).toBeGreaterThanOrEqual(3);
    const first = list[list.length - 1];

    const one = await call(revisionRoute.GET, revisionCtx("product", uid(), String(first.version)), "GET", { cookie: editor.cookie });
    expect((await read<{ revision: { snapshot: { uid: string } } }>(one)).revision.snapshot.uid).toBe(uid());

    const bad = await call(restoreRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie, body: { version: 0 } });
    expect(bad.status).toBe(422);
    const restore = await call(restoreRoute.POST, entityCtx("product", uid()), "POST", { cookie: editor.cookie, body: { version: first.version } });
    expect(restore.status).toBe(201);
    expect((await read<DraftResponse>(restore)).draft.restoredFrom).toBe(first.version);

    const published = await call(publishRoute.POST, entityCtx("product", uid()), "POST", { cookie: admin.cookie, headers: ifMatch(etagOf(restore)) });
    expect((await read<{ action: string }>(published)).action).toBe("restore");
    expect(await auditRows({ action: "content.restored", entityId: uid() })).toHaveLength(1);
    expect(await auditRows({ action: "content.published", entityId: uid(), actorLabel: admin.email })).toHaveLength(0);
  });
});

// ───────────── library records ─────────────

describe("a new record, its use, and its deletion", () => {
  const material = { key: "vat-lieu-api", snapshot: { icon: null, i18n: { vi: { name: "Vật liệu API" }, en: { name: "API stock" } } } };

  it("is created as a draft (201), refused when the key exists (409), published, and counted by 'used by'", async () => {
    const created = await call(listRoute.POST, typeCtx("material"), "POST", { cookie: editor.cookie, body: material });
    expect(created.status).toBe(201);
    const draft = await read<DraftResponse>(created);
    expect(draft.draft.baseVersion).toBeNull();
    expect(draft.issues).toEqual([]);

    const clash = await call(listRoute.POST, typeCtx("material"), "POST", { cookie: editor.cookie, body: { key: "giay-loai-c", snapshot: {} } });
    expect(clash.status).toBe(409);
    expect((await errorOf(clash)).code).toBe("ALREADY_EXISTS");
    const notAKey = await call(listRoute.POST, typeCtx("material"), "POST", { cookie: editor.cookie, body: { key: "Not A Key", snapshot: {} } });
    expect(notAKey.status).toBe(422);

    const published = await call(publishRoute.POST, entityCtx("material", "vat-lieu-api"), "POST", { cookie: editor.cookie, headers: ifMatch(etagOf(created)) });
    expect(await read(published)).toMatchObject({ version: 1, action: "create" });
    const tags = vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag);
    expect(tags).toEqual(expect.arrayContaining(["content:material:vat-lieu-api", "content:product"]));

    const usedBy = await call(usedByRoute.GET, entityCtx("material", "vat-lieu-api"), "GET", { cookie: editor.cookie });
    expect(await read(usedBy)).toEqual({ live: 0, drafts: 0 });
    const notApplicable = await call(usedByRoute.GET, entityCtx("product", productUid("marketing/vouchers")), "GET", { cookie: editor.cookie });
    expect(notApplicable.status).toBe(404);
  });

  it("an admin deletes it (and it is audited); a record in use answers 409 IN_USE", async () => {
    const deleted = await call(entityRoute.DELETE, entityCtx("material", "vat-lieu-api"), "DELETE", { cookie: admin.cookie, body: { comment: "dọn" } });
    expect(deleted.status).toBe(200);
    const [audit] = await auditRows({ action: "content.deleted", entityId: "vat-lieu-api" });
    expect(audit).toMatchObject({ actor_label: admin.email, entity_type: "material" });
    expect((await call(entityRoute.GET, entityCtx("material", "vat-lieu-api"), "GET", { cookie: editor.cookie })).status).toBe(404);
    expect((await call(entityRoute.DELETE, entityCtx("material", "vat-lieu-api"), "DELETE", { cookie: admin.cookie })).status).toBe(404);

    const [{ slug }] = await rows<{ slug: string }>(`select m.slug from material m join option o on o.material_id = m.id limit 1`);
    const inUse = await call(entityRoute.DELETE, entityCtx("material", slug), "DELETE", { cookie: admin.cookie });
    expect(inUse.status).toBe(409);
    expect((await errorOf(inUse)).code).toBe("IN_USE");
  });
});

describe("releasing an old URL", () => {
  it("lets go of one language's alias, audits it, and refuses a canonical URL and non-products", async () => {
    const uid = productUid("office/danh-thiep");
    const live = await read<{ document: { slugs: { en: { slug: string; aliases: { category: string; slug: string }[] } } } }>(await call(entityRoute.GET, entityCtx("product", uid), "GET", { cookie: editor.cookie }));
    const alias = live.document.slugs.en.aliases[0];

    const released = await call(releaseRoute.POST, entityCtx("product", uid), "POST", { cookie: editor.cookie, body: { locale: "en", category: alias.category, slug: alias.slug } });
    expect(released.status).toBe(200);
    expect(vi.mocked(revalidateTag).mock.calls.map(([tag]) => tag)).toContain(`content:product:${uid}`);
    const [audit] = await auditRows({ action: "content.alias_released", entityId: uid });
    expect(audit.detail).toMatchObject({ locale: "en", slug: alias.slug });

    const canonical = await call(releaseRoute.POST, entityCtx("product", uid), "POST", { cookie: editor.cookie, body: { locale: "en", category: "office", slug: live.document.slugs.en.slug } });
    expect(canonical.status).toBe(422);
    const notProduct = await call(releaseRoute.POST, entityCtx("material", "giay-loai-c"), "POST", { cookie: editor.cookie, body: { locale: "en", slug: "x" } });
    expect(notProduct.status).toBe(404);
    const badBody = await call(releaseRoute.POST, entityCtx("product", uid), "POST", { cookie: editor.cookie, body: { locale: "xx", slug: "x" } });
    expect(badBody.status).toBe(422);
  });
});
