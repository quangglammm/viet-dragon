import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// React's cache() memoises per server request; outside one it would pin the first result for the whole
// run, so tests use the plain function.
vi.mock("react", async (importOriginal) => ({ ...(await importOriginal<typeof import("react")>()), cache: <T>(fn: T) => fn }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { headers } from "next/headers";
import { requireApiUser, requireUser } from "@/lib/dal";
import { getPool } from "@/lib/db";
import { authRequest, createUser, login, ORIGIN, uniqueEmail } from "@/tests/helpers/auth";

afterAll(async () => {
  await getPool().end();
});

type Case = { method?: string; cookie?: string; origin?: string | null; contentType?: string | null; fetchSite?: string };

function apiRequest({ method = "GET", cookie, origin = ORIGIN, contentType, fetchSite }: Case = {}): Request {
  const requestHeaders = new Headers();
  if (cookie) requestHeaders.set("cookie", cookie);
  if (origin !== null) requestHeaders.set("origin", origin);
  if (fetchSite) requestHeaders.set("sec-fetch-site", fetchSite);
  const resolvedType = contentType === undefined ? (method === "GET" ? null : "application/json") : contentType;
  if (resolvedType) requestHeaders.set("content-type", resolvedType);
  return new Request(`${ORIGIN}/api/admin/anything`, { method, headers: requestHeaders });
}

async function statusAndCode(result: Awaited<ReturnType<typeof requireApiUser>>) {
  if (result.ok) return { status: 200, code: "OK" };
  return { status: result.response.status, code: ((await result.response.json()) as { code: string }).code };
}

async function userWith(role: "admin" | "editor", { mustChangePassword = false } = {}) {
  const email = uniqueEmail(role);
  const id = await createUser(email, role, { mustChangePassword });
  return { email, id, cookie: await login(email) };
}

describe("requireApiUser", () => {
  it("answers 401 with no session, and never exposes who is missing", async () => {
    expect(await statusAndCode(await requireApiUser(apiRequest()))).toEqual({ status: 401, code: "UNAUTHENTICATED" });
  });

  it("returns a minimal user DTO — no token, hash or ban fields", async () => {
    const { cookie, email } = await userWith("editor");
    const result = await requireApiUser(apiRequest({ cookie }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.keys(result.user).sort()).toEqual(["email", "id", "mustChangePassword", "name", "role"]);
      expect(result.user).toMatchObject({ email, role: "editor", mustChangePassword: false });
    }
  });

  it("enforces permissions per role", async () => {
    const editor = await userWith("editor");
    const admin = await userWith("admin");
    expect((await statusAndCode(await requireApiUser(apiRequest({ cookie: editor.cookie }), ["content", "edit"]))).status).toBe(200);
    expect(await statusAndCode(await requireApiUser(apiRequest({ cookie: editor.cookie }), ["audit", "read"]))).toEqual({
      status: 403,
      code: "FORBIDDEN",
    });
    expect(await statusAndCode(await requireApiUser(apiRequest({ cookie: editor.cookie }), ["media", "delete"]))).toEqual({
      status: 403,
      code: "FORBIDDEN",
    });
    expect((await statusAndCode(await requireApiUser(apiRequest({ cookie: admin.cookie }), ["media", "delete"]))).status).toBe(200);
  });

  it("locks out an account that still has to change its temporary password", async () => {
    const { cookie } = await userWith("editor", { mustChangePassword: true });
    expect(await statusAndCode(await requireApiUser(apiRequest({ cookie })))).toEqual({
      status: 403,
      code: "PASSWORD_CHANGE_REQUIRED",
    });
  });

  it("treats a deactivated user's old cookie as no session at all", async () => {
    const admin = await userWith("admin");
    const target = await userWith("editor");
    await authRequest("/admin/ban-user", { cookie: admin.cookie, body: { userId: target.id } });
    expect((await statusAndCode(await requireApiUser(apiRequest({ cookie: target.cookie })))).status).toBe(401);
  });

  describe("mutations (CSRF second layer)", () => {
    it("accepts the site's own Origin with a JSON body", async () => {
      const { cookie } = await userWith("editor");
      expect((await statusAndCode(await requireApiUser(apiRequest({ method: "POST", cookie })))).status).toBe(200);
    });

    it.each([
      ["a foreign Origin", { origin: "https://evil.example" }],
      ["no Origin at all (curl)", { origin: null }],
      ["Sec-Fetch-Site: cross-site without Origin", { origin: null, fetchSite: "cross-site" }],
    ])("refuses %s, even with a valid cookie", async (_label, extra) => {
      const { cookie } = await userWith("editor");
      expect(await statusAndCode(await requireApiUser(apiRequest({ method: "POST", cookie, ...extra })))).toEqual({
        status: 403,
        code: "CROSS_ORIGIN",
      });
    });

    it("accepts Fetch Metadata same-origin when Origin is absent", async () => {
      const { cookie } = await userWith("editor");
      expect(
        (await statusAndCode(await requireApiUser(apiRequest({ method: "POST", cookie, origin: null, fetchSite: "same-origin" })))).status,
      ).toBe(200);
    });

    it("checks the origin before anything else — an unauthenticated cross-origin POST is a 403, not a 401", async () => {
      expect((await statusAndCode(await requireApiUser(apiRequest({ method: "POST", origin: "https://evil.example" })))).code).toBe(
        "CROSS_ORIGIN",
      );
    });

    it("rejects an undeclared or wrong body type with 415, and honours the multipart option", async () => {
      const { cookie } = await userWith("editor");
      for (const contentType of ["text/plain", "application/x-www-form-urlencoded", null as string | null]) {
        const result = await requireApiUser(apiRequest({ method: "POST", cookie, contentType }));
        expect(await statusAndCode(result)).toEqual({ status: 415, code: "UNSUPPORTED_MEDIA_TYPE" });
      }
      const multipart = apiRequest({ method: "POST", cookie, contentType: "multipart/form-data; boundary=x" });
      expect((await statusAndCode(await requireApiUser(multipart, undefined, { contentType: "multipart" }))).status).toBe(200);
      expect((await statusAndCode(await requireApiUser(multipart))).status).toBe(415); // JSON endpoints refuse multipart
    });
  });
});

describe("requireUser (pages)", () => {
  const asVisitor = (cookie?: string) => vi.mocked(headers).mockResolvedValue(new Headers(cookie ? { cookie } : {}) as never);

  beforeEach(() => {
    vi.mocked(headers).mockReset();
  });

  it("redirects a visitor with no session to the login page", async () => {
    asVisitor();
    await expect(requireUser()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("returns the signed-in user", async () => {
    const { cookie, email } = await userWith("editor");
    asVisitor(cookie);
    await expect(requireUser()).resolves.toMatchObject({ email, role: "editor" });
  });

  it("sends a user without the permission to their account page", async () => {
    const { cookie } = await userWith("editor");
    asVisitor(cookie);
    await expect(requireUser({ permission: ["audit", "read"] })).rejects.toThrow("REDIRECT:/admin/account?denied=1");
    const admin = await userWith("admin");
    asVisitor(admin.cookie);
    await expect(requireUser({ permission: ["audit", "read"] })).resolves.toMatchObject({ role: "admin" });
  });

  it("funnels a temporary-password account to the password page — and only that page may opt out", async () => {
    const { cookie } = await userWith("editor", { mustChangePassword: true });
    asVisitor(cookie);
    await expect(requireUser()).rejects.toThrow("REDIRECT:/admin/account/password");
    await expect(requireUser({ allowPasswordChange: true })).resolves.toMatchObject({ mustChangePassword: true });
  });

  it("signs a forged legacy cookie out like any other stranger", async () => {
    const forged = Buffer.from(`admin:vd_sec_token_98374291873912873:${Date.now()}`).toString("base64");
    asVisitor(`vd_admin_session=${forged}`);
    await expect(requireUser()).rejects.toThrow("REDIRECT:/admin/login");
  });
});
