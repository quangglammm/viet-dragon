import { describe, expect, it } from "vitest";
import { EDITABLE_TYPES, listUrl } from "@/lib/content/editor/entity-meta";
import { buildNav, isNavItemActive } from "./admin-nav";

const hrefs = (role: string, legacy: boolean) => buildNav(role, legacy).flatMap((section) => section.items.map((item) => item.href));

const CONTENT_HREFS = EDITABLE_TYPES.map(listUrl);

describe("buildNav", () => {
  it("shows an admin the account, users and audit pages, then the content editors", () => {
    expect(hrefs("admin", false)).toEqual(["/admin/account", "/admin/users", "/admin/audit", ...CONTENT_HREFS]);
  });

  it("shows an editor their own account and the content editors — no Users, no Audit", () => {
    expect(hrefs("editor", false)).toEqual(["/admin/account", ...CONTENT_HREFS]);
  });

  it("links every editable type, to its own list", () => {
    expect(CONTENT_HREFS).toContain("/admin/content/material");
    expect(CONTENT_HREFS).toContain("/admin/content/fast-print-item");
    expect(CONTENT_HREFS.length).toBe(EDITABLE_TYPES.length);
  });

  it("shows nothing privileged to a user with no known role", () => {
    expect(hrefs("", true)).toEqual(["/admin/account"]);
    expect(hrefs("intern", true)).toEqual(["/admin/account"]);
  });

  it("adds the legacy editors only when asked (they are hidden in production)", () => {
    expect(hrefs("editor", true)).toContain("/admin/blog");
    expect(hrefs("editor", false)).not.toContain("/admin/blog");
    expect(buildNav("editor", false)).toHaveLength(2);
    expect(buildNav("editor", true)).toHaveLength(3);
  });
});

describe("isNavItemActive", () => {
  it("matches the page and its children, but not a sibling that shares a prefix", () => {
    expect(isNavItemActive("/admin/account", "/admin/account")).toBe(true);
    expect(isNavItemActive("/admin/account/password", "/admin/account")).toBe(true);
    expect(isNavItemActive("/admin/accounting", "/admin/account")).toBe(false);
  });
});
