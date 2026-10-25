import { describe, expect, it } from "vitest";
import { EDITABLE_TYPES, listUrl } from "@/lib/content/editor/entity-meta";
import { buildNav, isNavItemActive } from "./admin-nav";

const hrefs = (role: string) => buildNav(role).flatMap((section) => section.items.map((item) => item.href));

const CONTENT_HREFS = EDITABLE_TYPES.map(listUrl);

describe("buildNav", () => {
  it("shows an admin the account, users and audit pages, then the content editors", () => {
    expect(hrefs("admin")).toEqual(["/admin/account", "/admin/users", "/admin/audit", ...CONTENT_HREFS]);
  });

  it("shows an editor their own account and the content editors — no Users, no Audit", () => {
    expect(hrefs("editor")).toEqual(["/admin/account", ...CONTENT_HREFS]);
  });

  it("links every editable type, to its own list", () => {
    expect(CONTENT_HREFS).toContain("/admin/content/material");
    expect(CONTENT_HREFS).toContain("/admin/content/fast-print-item");
    expect(CONTENT_HREFS.length).toBe(EDITABLE_TYPES.length);
  });

  it("shows nothing privileged to a user with no known role", () => {
    expect(hrefs("")).toEqual(["/admin/account"]);
    expect(hrefs("intern")).toEqual(["/admin/account"]);
  });
});

describe("isNavItemActive", () => {
  it("matches the page and its children, but not a sibling that shares a prefix", () => {
    expect(isNavItemActive("/admin/account", "/admin/account")).toBe(true);
    expect(isNavItemActive("/admin/account/password", "/admin/account")).toBe(true);
    expect(isNavItemActive("/admin/accounting", "/admin/account")).toBe(false);
  });
});
