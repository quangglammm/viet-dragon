import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import proxy from "./proxy";

const request = (path: string, cookie?: string) =>
  new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} });

describe("proxy admin branch", () => {
  // SITE_URL defaults to http://localhost:3000 outside production.
  it("redirects a cookie-less admin request to the login page, as an ABSOLUTE URL on the site origin", async () => {
    const response = await proxy(request("/admin/products?tab=1"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `http://localhost:3000/admin/login?next=${encodeURIComponent("/admin/products?tab=1")}`,
    );
  });

  it("redirects the bare /admin root", async () => {
    expect((await proxy(request("/admin"))).headers.get("location")).toBe("http://localhost:3000/admin/login?next=%2Fadmin");
  });

  it("takes the redirect origin from SITE_URL, not from the incoming request URL (Caddy hands the app http://)", async () => {
    const saved = process.env.SITE_URL;
    process.env.SITE_URL = "https://vietdragon.vn";
    vi.resetModules();
    try {
      const { default: freshProxy } = await import("./proxy");
      const response = await freshProxy(request("/admin/users"));
      expect(response.headers.get("location")).toBe("https://vietdragon.vn/admin/login?next=%2Fadmin%2Fusers");
    } finally {
      if (saved === undefined) delete process.env.SITE_URL;
      else process.env.SITE_URL = saved;
    }
  });

  it.each(["vd.session_token=abc.def", "__Secure-vd.session_token=abc.def"])("lets %s through", async (cookie) => {
    const response = await proxy(request("/admin/users", cookie));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("does not trust a cookie with the wrong name or prefix", async () => {
    for (const cookie of ["better-auth.session_token=abc", "session_token=abc", "vd_admin_session=YWRtaW46eDoxMjM="]) {
      expect((await proxy(request("/admin/users", cookie))).status).toBe(307);
    }
  });

  it("never redirects the login page, with or without a cookie", async () => {
    expect((await proxy(request("/admin/login"))).headers.get("location")).toBeNull();
    expect((await proxy(request("/admin/login", "vd.session_token=stale"))).headers.get("location")).toBeNull();
  });
});

describe("proxy public branch", () => {
  it("still hands non-admin paths to next-intl, never to the admin guard", async () => {
    const response = await proxy(request("/en/products"));
    expect(response.headers.get("location") ?? "").not.toContain("/admin/login");
    expect(response.status).toBeLessThan(400);
  });
});
