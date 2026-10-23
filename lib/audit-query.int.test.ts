import { afterAll, describe, expect, it } from "vitest";
import { AUDIT_PAGE_SIZE, queryAuditLog } from "@/lib/audit-query";
import { recordAudit, type AuditAction } from "@/lib/auth/audit";
import { getPool } from "@/lib/db";
import { createUser, uniqueEmail } from "@/tests/helpers/auth";

// audit_log is append-only, so every test filters on its own unique actor label instead of cleaning up.

afterAll(async () => {
  await getPool().end();
});

async function record(actorLabel: string, action: AuditAction, extra: { entityId?: string; ip?: string } = {}) {
  await recordAudit({ actorLabel, action, entityType: extra.entityId ? "user" : undefined, ...extra });
}

describe("queryAuditLog", () => {
  it("filters by actor (case-insensitive substring) and returns newest first", async () => {
    const actor = uniqueEmail("auditor");
    await record(actor, "auth.sign_in");
    await record(actor, "user.banned");
    await record(actor, "auth.sign_out");

    const result = await queryAuditLog({ actor: actor.toUpperCase(), page: 1 });
    expect(result.total).toBe(3);
    expect(result.rows.map((row) => row.action)).toEqual(["auth.sign_out", "user.banned", "auth.sign_in"]);
    expect(result.rows.every((row) => row.actorLabel === actor)).toBe(true);
  });

  it("combines the action and actor filters", async () => {
    const actor = uniqueEmail("combo");
    await record(actor, "auth.sign_in");
    await record(actor, "auth.sign_in_failed");

    const result = await queryAuditLog({ actor, action: "auth.sign_in_failed", page: 1 });
    expect(result.total).toBe(1);
    expect(result.rows[0].action).toBe("auth.sign_in_failed");
  });

  it("treats % and _ in the actor filter as literal characters", async () => {
    const token = uniqueEmail("wild");
    await record(`${token}-100%_real`, "auth.sign_in");
    await record(`${token}-100xxreal`, "auth.sign_in");

    const literal = await queryAuditLog({ actor: `${token}-100%_`, page: 1 });
    expect(literal.rows.map((row) => row.actorLabel)).toEqual([`${token}-100%_real`]);

    const backslash = await queryAuditLog({ actor: `${token}\\`, page: 1 });
    expect(backslash.total).toBe(0);
  });

  it("pages in fixed-size chunks and clamps an out-of-range page to the last one", async () => {
    const actor = uniqueEmail("paged");
    const count = AUDIT_PAGE_SIZE + 5;
    for (let i = 0; i < count; i += 1) await record(actor, "auth.sign_in");

    const first = await queryAuditLog({ actor, page: 1 });
    expect(first).toMatchObject({ total: count, page: 1, pageCount: 2 });
    expect(first.rows).toHaveLength(AUDIT_PAGE_SIZE);

    const second = await queryAuditLog({ actor, page: 2 });
    expect(second.rows).toHaveLength(5);
    expect(new Set([...first.rows, ...second.rows].map((row) => row.id)).size).toBe(count);

    const beyond = await queryAuditLog({ actor, page: 99 });
    expect(beyond.page).toBe(2);
    expect(beyond.rows).toHaveLength(5);
  });

  it("reports one empty page rather than page 0 when nothing matches", async () => {
    const result = await queryAuditLog({ actor: uniqueEmail("nobody"), page: 4 });
    expect(result).toMatchObject({ rows: [], total: 0, page: 1, pageCount: 1 });
  });

  it("resolves the affected account's email, and leaves it null when the id matches nobody", async () => {
    const actor = uniqueEmail("resolver");
    const targetEmail = uniqueEmail("target");
    const targetId = await createUser(targetEmail, "editor");
    await record(actor, "user.banned", { entityId: targetId });
    await record(actor, "user.unbanned", { entityId: "no-such-user-id" });

    const { rows } = await queryAuditLog({ actor, page: 1 });
    const banned = rows.find((row) => row.action === "user.banned");
    const unbanned = rows.find((row) => row.action === "user.unbanned");
    expect(banned?.targetEmail).toBe(targetEmail);
    expect(unbanned).toMatchObject({ targetEmail: null, entityId: "no-such-user-id" });
  });

  it("round-trips ip and detail", async () => {
    const actor = uniqueEmail("detail");
    await recordAudit({ actorLabel: actor, action: "user.role_changed", ip: "203.0.113.9", detail: { from: "editor", to: "admin" } });

    const { rows } = await queryAuditLog({ actor, page: 1 });
    expect(rows[0]).toMatchObject({ ip: "203.0.113.9", detail: { from: "editor", to: "admin" } });
  });
});
