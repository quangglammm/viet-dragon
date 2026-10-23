import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// React's cache() memoises per server request; outside one it would pin the first result for the whole run.
vi.mock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), cache: <T>(fn: T) => fn }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// The legacy store writes to the source tree (data/content, messages, public/uploads). A test must never do that.
vi.mock("@/lib/content-store", () => ({
  getStoredBlogPosts: vi.fn(async () => []),
  saveStoredBlogPosts: vi.fn(async () => undefined),
  getStoredProducts: vi.fn(async () => []),
  saveStoredProducts: vi.fn(async () => undefined),
  getAllTranslations: vi.fn(async () => ({})),
  saveAllTranslations: vi.fn(async () => undefined),
  getMediaAssets: vi.fn(async () => []),
  saveUploadedFile: vi.fn(async () => ({ url: "/uploads/x.png" })),
  deleteMediaFiles: vi.fn(async () => ({ deleted: [], blocked: [] })),
}));

import { DELETE as mediaDelete, GET as mediaGet, POST as mediaPost } from "@/app/api/admin/media/route";
import { GET as blogGet, POST as blogPost } from "@/app/api/admin/blog/route";
import { GET as productsGet, POST as productsPost } from "@/app/api/admin/products/route";
import { POST as translatePost } from "@/app/api/admin/translate/route";
import { GET as translationsGet, POST as translationsPost } from "@/app/api/admin/translations/route";
import * as store from "@/lib/content-store";
import { getPool } from "@/lib/db";
import { createUser, login, ORIGIN, uniqueEmail } from "@/tests/helpers/auth";

afterAll(async () => {
  await getPool().end();
});

beforeEach(() => {
  vi.clearAllMocks();
});

type Handler = (request: Request) => Promise<Response>;
type Call = { cookie?: string; origin?: string | null; contentType?: string | null; body?: BodyInit };

function req(method: string, call: Call = {}): Request {
  const headers = new Headers();
  if (call.cookie) headers.set("cookie", call.cookie);
  if (call.origin !== null) headers.set("origin", call.origin ?? ORIGIN);
  if (call.contentType !== null && call.body !== undefined && typeof call.body === "string") {
    headers.set("content-type", call.contentType ?? "application/json");
  }
  return new Request(`${ORIGIN}/api/admin/anything`, { method, headers, body: call.body });
}

const JSON_BODY = JSON.stringify([]);
const TRANSLATE_BODY = JSON.stringify({ text: "Liên Hệ", targetLocale: "en" });
const DELETE_BODY = JSON.stringify({ urls: ["/uploads/x.png"] });

function upload(): FormData {
  const form = new FormData();
  form.set("file", new File(["x"], "x.png", { type: "image/png" }));
  return form;
}

// [name, handler, method, a valid body for it]
const HANDLERS: Array<[string, Handler, string, BodyInit | undefined]> = [
  ["blog GET", blogGet, "GET", undefined],
  ["blog POST", blogPost, "POST", JSON_BODY],
  ["products GET", productsGet, "GET", undefined],
  ["products POST", productsPost, "POST", JSON_BODY],
  ["translations GET", translationsGet, "GET", undefined],
  ["translations POST", translationsPost, "POST", JSON_BODY],
  ["media GET", mediaGet, "GET", undefined],
  ["media POST", mediaPost, "POST", upload()],
  ["media DELETE", mediaDelete, "DELETE", DELETE_BODY],
  ["translate POST", translatePost, "POST", TRANSLATE_BODY],
];

function storeWasTouched(): boolean {
  return Object.values(store).some((fn) => vi.isMockFunction(fn) && fn.mock.calls.length > 0);
}

async function codeOf(response: Response): Promise<string> {
  return ((await response.json()) as { code?: string }).code ?? "";
}

async function signedIn(role: "admin" | "editor", mustChangePassword = false) {
  const email = uniqueEmail(role);
  await createUser(email, role, { mustChangePassword });
  return login(email);
}

describe("legacy /api/admin routes — authentication", () => {
  it.each(HANDLERS)("%s answers 401 with no session and never reaches the store", async (_name, handler, method, body) => {
    const response = await handler(req(method, { body }));
    expect(response.status).toBe(401);
    expect(await codeOf(response)).toBe("UNAUTHENTICATED");
    expect(storeWasTouched()).toBe(false);
  });

  it.each(HANDLERS)("%s rejects the old forgeable cookie", async (_name, handler, method, body) => {
    // The retired cookie: base64("admin:<hardcoded token>:<timestamp>") named vd_admin_session. Anyone with the
    // source (and git history) could mint it, which is why the whole mechanism was deleted.
    const forged = Buffer.from(`admin:vd_sec_token_98374291873912873:${Date.now()}`).toString("base64");
    const response = await handler(req(method, { body, cookie: `vd_admin_session=${forged}` }));
    expect(response.status).toBe(401);
    expect(storeWasTouched()).toBe(false);
  });

  it.each(HANDLERS)("%s refuses a user who still has to change their temporary password", async (_name, handler, method, body) => {
    const cookie = await signedIn("editor", true);
    const response = await handler(req(method, { body, cookie }));
    expect(response.status).toBe(403);
    expect(await codeOf(response)).toBe("PASSWORD_CHANGE_REQUIRED");
    expect(storeWasTouched()).toBe(false);
  });
});

describe("legacy /api/admin routes — authorization", () => {
  it("lets an editor read and save content", async () => {
    const cookie = await signedIn("editor");
    expect((await blogGet(req("GET", { cookie }))).status).toBe(200);
    expect((await blogPost(req("POST", { cookie, body: JSON_BODY }))).status).toBe(200);
    expect(store.saveStoredBlogPosts).toHaveBeenCalledTimes(1);
    expect((await translatePost(req("POST", { cookie, body: TRANSLATE_BODY }))).status).toBe(200);
  });

  it("lets an editor upload media but not delete it", async () => {
    const cookie = await signedIn("editor");
    expect((await mediaPost(req("POST", { cookie, body: upload() }))).status).toBe(200);
    expect(store.saveUploadedFile).toHaveBeenCalledTimes(1);

    const denied = await mediaDelete(req("DELETE", { cookie, body: DELETE_BODY }));
    expect(denied.status).toBe(403);
    expect(await codeOf(denied)).toBe("FORBIDDEN");
    expect(store.deleteMediaFiles).not.toHaveBeenCalled();
  });

  it("lets an admin delete media", async () => {
    const cookie = await signedIn("admin");
    expect((await mediaDelete(req("DELETE", { cookie, body: DELETE_BODY }))).status).toBe(200);
    expect(store.deleteMediaFiles).toHaveBeenCalledWith(["/uploads/x.png"]);
  });
});

describe("legacy /api/admin routes — request hygiene on mutations", () => {
  it.each(HANDLERS.filter(([, , method]) => method !== "GET"))("%s rejects a cross-origin request even with a valid session", async (_name, handler, method, body) => {
    const cookie = await signedIn("admin");
    const response = await handler(req(method, { body, cookie, origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(await codeOf(response)).toBe("CROSS_ORIGIN");
    expect(storeWasTouched()).toBe(false);
  });

  it("rejects a mutation with no Origin at all", async () => {
    const cookie = await signedIn("admin");
    const response = await blogPost(req("POST", { cookie, body: JSON_BODY, origin: null }));
    expect(response.status).toBe(403);
    expect(storeWasTouched()).toBe(false);
  });

  it("rejects a JSON route called with another body type, and the upload route called with JSON", async () => {
    const cookie = await signedIn("admin");
    const wrongForJson = await blogPost(req("POST", { cookie, body: JSON_BODY, contentType: "text/plain" }));
    expect(wrongForJson.status).toBe(415);
    const wrongForUpload = await mediaPost(req("POST", { cookie, body: JSON_BODY }));
    expect(wrongForUpload.status).toBe(415);
    expect(storeWasTouched()).toBe(false);
  });
});
