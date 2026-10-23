import { describe, expect, it } from "vitest";
import { AUDIT_ACTIONS, AUDIT_ACTION_LABELS } from "@/lib/auth/audit";
import { auditPageHref, formatAuditDetail, parseAuditFilters } from "./audit-query";

describe("parseAuditFilters", () => {
  it("defaults to the first page with no filters", () => {
    expect(parseAuditFilters({})).toEqual({ action: undefined, actor: undefined, page: 1 });
  });

  it("keeps a known action and drops an unknown one", () => {
    expect(parseAuditFilters({ action: "user.banned" }).action).toBe("user.banned");
    expect(parseAuditFilters({ action: "user.deleted" }).action).toBeUndefined();
    expect(parseAuditFilters({ action: "" }).action).toBeUndefined();
  });

  it("takes the first value of a repeated key", () => {
    expect(parseAuditFilters({ action: ["auth.sign_in", "user.banned"], page: ["3", "9"] })).toMatchObject({ action: "auth.sign_in", page: 3 });
  });

  it("trims and bounds the actor text", () => {
    expect(parseAuditFilters({ actor: "  an@example.test " }).actor).toBe("an@example.test");
    expect(parseAuditFilters({ actor: "   " }).actor).toBeUndefined();
    expect(parseAuditFilters({ actor: "x".repeat(500) }).actor).toHaveLength(100);
  });

  it.each([
    ["0", 1],
    ["-4", 1],
    ["2.5", 1],
    ["abc", 1],
    ["", 1],
    ["7", 7],
    ["99999999999", 100_000],
  ])("reads page %j as %i", (raw, expected) => {
    expect(parseAuditFilters({ page: raw }).page).toBe(expected);
  });
});

describe("auditPageHref", () => {
  it("leaves out defaults so the first unfiltered page is the bare path", () => {
    expect(auditPageHref({ page: 1 }, 1)).toBe("/admin/audit");
  });

  it("carries the filters to every page", () => {
    expect(auditPageHref({ action: "auth.sign_in_failed", actor: "a b@x.test", page: 2 }, 3)).toBe(
      "/admin/audit?action=auth.sign_in_failed&actor=a+b%40x.test&page=3",
    );
  });
});

describe("formatAuditDetail", () => {
  it("lists keys in order and skips empty values", () => {
    expect(formatAuditDetail({ from: "editor", to: "admin", reason: null, other: undefined })).toBe("from: editor · to: admin");
  });

  it("renders nested values as JSON and ignores non-objects", () => {
    expect(formatAuditDetail({ lockedUntil: "2026-10-23T10:00:00Z", extra: { a: 1 } })).toBe(
      'lockedUntil: 2026-10-23T10:00:00Z · extra: {"a":1}',
    );
    expect(formatAuditDetail(null)).toBe("");
    expect(formatAuditDetail("text")).toBe("");
    expect(formatAuditDetail(["a"])).toBe("");
  });
});

describe("audit action labels", () => {
  it("covers every action with a non-empty Vietnamese label", () => {
    for (const action of AUDIT_ACTIONS) expect(AUDIT_ACTION_LABELS[action]).toMatch(/\S/);
    expect(Object.keys(AUDIT_ACTION_LABELS).sort()).toEqual([...AUDIT_ACTIONS].sort());
  });
});
