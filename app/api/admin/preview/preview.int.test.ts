import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// React's cache() memoises per server request; outside one it would pin the first result for the whole run.
vi.mock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), cache: <T>(fn: T) => fn }));
vi.mock("next/headers", () => ({ headers: vi.fn(), draftMode: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn(), unstable_cache: <T>(fn: T) => fn }));

import { draftMode, headers } from "next/headers";
import { DELETE, POST } from "@/app/api/admin/preview/route";
import { composeEntity } from "@/lib/content/compose";
import { createDraft, openDraft, saveDraft } from "@/lib/content/drafts";
import { previewOverlay } from "@/lib/content/read/preview-session";
import { getDb, getPool } from "@/lib/db";
import { createUser, login, ORIGIN, uniqueEmail } from "@/tests/helpers/auth";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";

// The preview switch end to end: the route that turns Draft Mode on, and the gate every public request passes before it may see a draft.

let seeded: SeededDatabase;
let editor: { cookie: string };
const enable = vi.fn();
const disable = vi.fn();

beforeAll(async () => {
  seeded = await createSeededDatabase("preview-api");
  process.env.DATABASE_URL = seeded.scratch.url;
  const email = uniqueEmail("editor");
  await createUser(email, "editor");
  editor = { cookie: await login(email) };
}, 180_000);

afterAll(async () => {
  await getPool().end();
  await seeded.close();
});

beforeEach(async () => {
  enable.mockClear();
  disable.mockClear();
  vi.mocked(draftMode).mockResolvedValue({ isEnabled: false, enable, disable } as unknown as Awaited<ReturnType<typeof draftMode>>);
  await seeded.scratch.pool.query("delete from content_draft");
});

type CallInit = { cookie?: string; body?: unknown; origin?: string | null; contentType?: string | null };

function send(method: "POST" | "DELETE", init: CallInit = {}): Promise<Response> {
  const headersInit = new Headers();
  if (init.cookie) headersInit.set("cookie", init.cookie);
  if (init.origin !== null) headersInit.set("origin", init.origin ?? ORIGIN);
  if (init.contentType !== null) headersInit.set("content-type", init.contentType ?? "application/json");
  const request = new Request(`${ORIGIN}/api/admin/preview`, { method, headers: headersInit, body: init.body === undefined ? undefined : JSON.stringify(init.body) });
  return (method === "POST" ? POST : DELETE)(request);
}

type ErrorBody = { error: string; code: string; issues?: { path: string; message: string }[] };
const productUid = (key: string) => seeded.outcome.products.get(key)!.uid;

/** Opens the draft of a live entity and changes it the way the editor autosaves. */
async function editDraft(type: "product" | "fast_print_item" | "site_message", id: string, mutate: (document: Record<string, unknown>) => void) {
  const draft = await openDraft(getDb(), { type, id }, null);
  const snapshot = structuredClone(draft.snapshot);
  mutate(snapshot);
  await saveDraft(getDb(), { type, id }, { snapshot, expectDraftVersion: draft.draftVersion, author: null });
}

const firstProduct = () => seeded.outcome.products.entries().next().value!;

describe("POST /api/admin/preview", () => {
  it("answers 401 without a session and 403 from another origin, and never switches Draft Mode on", async () => {
    const body = { type: "product", id: productUid(firstProduct()[0]), locale: "vi" };
    expect((await send("POST", { body })).status).toBe(401);
    const cross = await send("POST", { cookie: editor.cookie, body, origin: "https://evil.example" });
    expect(cross.status).toBe(403);
    expect((await send("POST", { cookie: editor.cookie, body, contentType: "text/plain" })).status).toBe(415);
    expect(enable).not.toHaveBeenCalled();
  });

  it("refuses a body that is not exactly {type, id, locale}", async () => {
    for (const body of [{}, { type: "nope", id: "x", locale: "vi" }, { type: "product", id: "x", locale: "xx" }, { type: "product", id: "x", locale: "vi", extra: 1 }]) {
      const response = await send("POST", { cookie: editor.cookie, body });
      expect(response.status, JSON.stringify(body)).toBe(422);
    }
    expect(enable).not.toHaveBeenCalled();
  });

  it("answers 404 when there is no draft to preview", async () => {
    const response = await send("POST", { cookie: editor.cookie, body: { type: "product", id: productUid(firstProduct()[0]), locale: "vi" } });
    expect(response.status).toBe(404);
    expect(((await response.json()) as ErrorBody).code).toBe("NOT_FOUND");
    expect(enable).not.toHaveBeenCalled();
  });

  it("refuses a draft that cannot be shown, with the reasons the editor already sees", async () => {
    const uid = productUid(firstProduct()[0]);
    await editDraft("product", uid, (document) => {
      delete (document.i18n as Record<string, unknown>).vi;
    });
    const response = await send("POST", { cookie: editor.cookie, body: { type: "product", id: uid, locale: "vi" } });
    expect(response.status).toBe(422);
    const body = (await response.json()) as ErrorBody;
    expect(body.code).toBe("INVALID");
    expect(body.issues?.length).toBeGreaterThan(0);
    expect(enable).not.toHaveBeenCalled();
  });

  it("turns Draft Mode on and answers the draft's page in the chosen language, uncached", async () => {
    const uid = productUid(firstProduct()[0]);
    await editDraft("product", uid, (document) => {
      (document.i18n as Record<string, Record<string, unknown>>).vi.title = "Tên mới";
    });
    const vi = await send("POST", { cookie: editor.cookie, body: { type: "product", id: uid, locale: "vi" } });
    expect(vi.status).toBe(200);
    expect(vi.headers.get("cache-control")).toBe("no-store");
    const viUrl = ((await vi.json()) as { url: string }).url;
    expect(viUrl).toMatch(/^\/san-pham\/[a-z0-9-]+\/[a-z0-9-]+$/);
    const en = ((await (await send("POST", { cookie: editor.cookie, body: { type: "product", id: uid, locale: "en" } })).json()) as { url: string }).url;
    expect(en).toMatch(/^\/en\/products\/[a-z0-9-]+\/[a-z0-9-]+$/);
    expect(enable).toHaveBeenCalledTimes(2);
  });

  it("lands each kind of entity on the page that draws it", async () => {
    const fastPrintUid = (await seeded.scratch.pool.query<{ uid: string }>("select uid::text as uid from fast_print_item order by position limit 1")).rows[0].uid;
    await editDraft("fast_print_item", fastPrintUid, (document) => {
      document.fromPrice = 123_000;
    });
    await editDraft("site_message", "siteMeta", (document) => {
      const data = document.data as Record<string, Record<string, unknown>>;
      data.vi = { ...data.vi, title: "Tên thử" };
    });
    const urlOf = async (type: string, id: string, locale: string) => ((await (await send("POST", { cookie: editor.cookie, body: { type, id, locale } })).json()) as { url: string }).url;
    expect(await urlOf("fast_print_item", fastPrintUid, "vi")).toBe("/san-pham/in-nhanh");
    expect(await urlOf("fast_print_item", fastPrintUid, "ja")).toBe("/ja/products/fast-print");
    expect(await urlOf("site_message", "siteMeta", "vi")).toBe("/");
    expect(await urlOf("site_message", "siteMeta", "ko")).toBe("/ko");
  });

  it("gives a product that was never published the address its draft names", async () => {
    const original = (await composeEntity(getDb(), "product", productUid(firstProduct()[0])))!.document;
    const ids = new Map<string, string>();
    const copy = JSON.parse(JSON.stringify(original).replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, (id) => ids.get(id) ?? ids.set(id, randomUUID()).get(id)!));
    for (const locale of ["vi", "en", "zh", "ja", "ko"]) copy.slugs[locale] = { slug: `chi-xem-truoc-${locale}`, aliases: [] };
    const created = await createDraft(getDb(), "product", { snapshot: copy }, null);
    const response = await send("POST", { cookie: editor.cookie, body: { type: "product", id: created.ref.id, locale: "vi" } });
    expect(response.status).toBe(200);
    expect(((await response.json()) as { url: string }).url).toMatch(/\/san-pham\/[a-z0-9-]+\/chi-xem-truoc-vi$/);
  });
});

describe("DELETE /api/admin/preview", () => {
  it("answers 401 without a session", async () => {
    expect((await send("DELETE")).status).toBe(401);
    expect(disable).not.toHaveBeenCalled();
  });

  it("turns Draft Mode off", async () => {
    const response = await send("DELETE", { cookie: editor.cookie });
    expect(response.status).toBe(204);
    expect(disable).toHaveBeenCalledTimes(1);
  });
});

describe("the gate every public request passes", () => {
  const asRequestFrom = (cookie: string | null) => vi.mocked(headers).mockResolvedValue(new Headers(cookie ? { cookie } : {}) as unknown as Awaited<ReturnType<typeof headers>>);
  const draftModeIs = (isEnabled: boolean) => vi.mocked(draftMode).mockResolvedValue({ isEnabled, enable, disable } as unknown as Awaited<ReturnType<typeof draftMode>>);

  beforeEach(async () => {
    const uid = productUid(firstProduct()[0]);
    await editDraft("product", uid, (document) => {
      (document.i18n as Record<string, Record<string, unknown>>).vi.title = "Tên mới";
    });
  });

  it("shows the drafts to a signed-in editor in Draft Mode", async () => {
    asRequestFrom(editor.cookie);
    draftModeIs(true);
    const overlay = await previewOverlay();
    expect(overlay?.applied.map((draft) => draft.label)).toEqual(["Tên mới"]);
  });

  it("shows nothing when Draft Mode is off, even to a signed-in editor", async () => {
    asRequestFrom(editor.cookie);
    draftModeIs(false);
    expect(await previewOverlay()).toBeNull();
  });

  it("shows nothing when the bypass cookie arrives without a session (anyone could replay it)", async () => {
    asRequestFrom(null);
    draftModeIs(true);
    expect(await previewOverlay()).toBeNull();
  });

  it("shows nothing to an account that has not changed its temporary password yet", async () => {
    const email = uniqueEmail("temp");
    await createUser(email, "editor", { mustChangePassword: true });
    asRequestFrom(await login(email));
    draftModeIs(true);
    expect(await previewOverlay()).toBeNull();
  });
});
