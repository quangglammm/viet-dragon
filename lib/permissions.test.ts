import { describe, expect, it } from "vitest";
import { can, DEFAULT_ROLE, hasPermission, isAdminRole, roles } from "./permissions";

describe("role matrix", () => {
  it.each([
    ["user", "create"],
    ["user", "list"],
    ["user", "get"],
    ["user", "set-role"],
    ["user", "set-password"],
    ["user", "ban"],
    ["session", "list"],
    ["session", "revoke"],
    ["content", "edit"],
    ["content", "publish"],
    ["media", "upload"],
    ["media", "delete"],
    ["audit", "read"],
  ] as const)("admin may %s:%s", (resource, action) => {
    expect(can("admin", resource, action)).toBe(true);
  });

  it.each([
    ["user", "delete"],
    ["user", "update"],
    ["user", "impersonate"],
    ["user", "impersonate-admins"],
    ["session", "delete"],
  ] as const)("admin may NEVER %s:%s (no role has it)", (resource, action) => {
    expect(can("admin", resource, action as never)).toBe(false);
    expect(can("editor", resource, action as never)).toBe(false);
  });

  it.each([
    ["content", "edit"],
    ["content", "publish"],
    ["media", "upload"],
  ] as const)("editor may %s:%s", (resource, action) => {
    expect(can("editor", resource, action)).toBe(true);
  });

  it.each([
    ["media", "delete"],
    ["audit", "read"],
    ["user", "list"],
    ["user", "create"],
    ["user", "ban"],
    ["session", "list"],
  ] as const)("editor may NOT %s:%s", (resource, action) => {
    expect(can("editor", resource, action)).toBe(false);
  });

  it("has exactly the admin and editor roles, editor by default", () => {
    expect(Object.keys(roles).sort()).toEqual(["admin", "editor"]);
    expect(DEFAULT_ROLE).toBe("editor");
  });
});

describe("can() on odd input", () => {
  it.each([null, undefined, "", "superuser", "constructor", "__proto__", "toString"])("denies role %j", (role) => {
    expect(can(role, "content", "edit")).toBe(false);
  });

  it("lets any one of several comma-separated roles grant the action", () => {
    expect(can("editor,admin", "audit", "read")).toBe(true);
    expect(can("x, editor", "media", "upload")).toBe(true);
    expect(can("x,y", "media", "upload")).toBe(false);
  });
});

describe("hasPermission", () => {
  it("answers the same question from a [resource, action] pair", () => {
    expect(hasPermission("admin", ["audit", "read"])).toBe(true);
    expect(hasPermission("editor", ["audit", "read"])).toBe(false);
    expect(hasPermission(null, ["content", "edit"])).toBe(false);
  });
});

describe("isAdminRole", () => {
  it("recognises admin among comma-separated roles only", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("editor, admin")).toBe(true);
    expect(isAdminRole("editor")).toBe(false);
    expect(isAdminRole("superadmin")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });
});
