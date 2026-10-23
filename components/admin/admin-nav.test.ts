import { describe, expect, it } from "vitest";
import { buildNav, isNavItemActive } from "./admin-nav";

const hrefs = (role: string, legacy: boolean) => buildNav(role, legacy).flatMap((section) => section.items.map((item) => item.href));

describe("buildNav", () => {
  it("shows an admin the account, users and audit pages", () => {
    expect(hrefs("admin", false)).toEqual(["/admin/account", "/admin/users", "/admin/audit"]);
  });

  it("shows an editor only their own account — no Users, no Audit", () => {
    expect(hrefs("editor", false)).toEqual(["/admin/account"]);
  });

  it("shows nothing privileged to a user with no known role", () => {
    expect(hrefs("", true)).toEqual(["/admin/account"]);
    expect(hrefs("intern", true)).toEqual(["/admin/account"]);
  });

  it("adds the legacy editors only when asked (they are hidden in production)", () => {
    expect(hrefs("editor", true)).toContain("/admin/blog");
    expect(hrefs("editor", false)).not.toContain("/admin/blog");
    expect(buildNav("editor", false)).toHaveLength(1);
    expect(buildNav("editor", true)).toHaveLength(2);
  });
});

describe("isNavItemActive", () => {
  it("matches the page and its children, but not a sibling that shares a prefix", () => {
    expect(isNavItemActive("/admin/account", "/admin/account")).toBe(true);
    expect(isNavItemActive("/admin/account/password", "/admin/account")).toBe(true);
    expect(isNavItemActive("/admin/accounting", "/admin/account")).toBe(false);
  });
});
