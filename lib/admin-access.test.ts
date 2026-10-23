import { describe, expect, it } from "vitest";
import { ADMIN_LOGIN_PATH, decideAdminAccess, isAdminPath, safeAdminNextPath } from "./admin-access";

describe("isAdminPath", () => {
  it.each(["/admin", "/admin/", "/admin/users", "/admin/login"])("%s is an admin path", (path) => {
    expect(isAdminPath(path)).toBe(true);
  });

  it.each(["/", "/en/admin", "/administrator", "/administrators/x", "/api/admin/blog", "/adminx"])("%s is not", (path) => {
    expect(isAdminPath(path)).toBe(false);
  });
});

describe("decideAdminAccess", () => {
  it("lets a request with a session cookie through (the DAL validates it for real)", () => {
    expect(decideAdminAccess("/admin/users", "", true)).toEqual({ action: "allow" });
  });

  it("redirects a cookie-less request to the login page, remembering where it was going", () => {
    expect(decideAdminAccess("/admin/products", "?tab=2", false)).toEqual({
      action: "redirect",
      location: `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent("/admin/products?tab=2")}`,
    });
  });

  it("redirects the bare /admin root too", () => {
    expect(decideAdminAccess("/admin", "", false)).toEqual({
      action: "redirect",
      location: `${ADMIN_LOGIN_PATH}?next=%2Fadmin`,
    });
  });

  it.each([false, true])("never redirects the login page itself (cookie=%s) — a stale cookie must not loop", (cookie) => {
    expect(decideAdminAccess("/admin/login", "", cookie)).toEqual({ action: "allow" });
    expect(decideAdminAccess("/admin/login/", "?next=/admin", cookie)).toEqual({ action: "allow" });
  });

  it("leaves non-admin paths alone", () => {
    expect(decideAdminAccess("/en/products", "", false)).toEqual({ action: "allow" });
  });

  it("drops a `next` that is not a safe admin path instead of forwarding it", () => {
    // Can't normally happen from the proxy, but the function must not mint unsafe redirects.
    expect(decideAdminAccess("/admin/x\\evil", "", false)).toEqual({ action: "redirect", location: ADMIN_LOGIN_PATH });
  });
});

describe("safeAdminNextPath (open-redirect guard)", () => {
  it.each([
    "/admin",
    "/admin/users",
    "/admin/products?tab=1&x=2",
    "/admin/audit#top",
  ])("accepts %s", (value) => {
    expect(safeAdminNextPath(value)).toBe(value);
  });

  it.each([
    ["absolute URL", "https://evil.example/admin"],
    ["protocol-relative", "//evil.example/admin"],
    ["dot-segment climb", "/admin/../../evil"],
    ["dot-segment at the end", "/admin/.."],
    ["percent-encoded dot-segment", "/admin/%2e%2e/evil"],
    ["mixed-case percent-encoded dot-segment", "/admin/.%2E/evil"],
    ["backslash trick", "/admin\\..\\evil"],
    ["backslash host", "/\\evil.example"],
    ["not under /admin", "/en/products"],
    ["sibling prefix", "/administrator"],
    ["login page (loop)", "/admin/login"],
    ["login with query (loop)", "/admin/login?next=/admin"],
    ["control character", "/admin/\u0000x"],
    ["newline injection", "/admin/x\r\nSet-Cookie: a=b"],
    ["tab", "/admin/\tx"],
    ["javascript scheme", "javascript:alert(1)"],
    ["empty", ""],
    ["too long", `/admin/${"a".repeat(600)}`],
  ])("rejects %s", (_label, value) => {
    expect(safeAdminNextPath(value)).toBeNull();
  });

  it("rejects null and undefined", () => {
    expect(safeAdminNextPath(null)).toBeNull();
    expect(safeAdminNextPath(undefined)).toBeNull();
  });
});
