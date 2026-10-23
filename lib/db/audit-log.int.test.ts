import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { recordAudit } from "@/lib/auth/audit";
import { clearAttempts, EMPTY_LOCK_STATE, getLockState, registerFailure } from "@/lib/auth/lockout";
import { LOCK_THRESHOLD } from "@/lib/auth/constants";
import { createUser, uniqueEmail } from "@/tests/helpers/auth";
import { getPool } from "@/lib/db";

afterAll(async () => {
  await getPool().end();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const rowsFor = async (actorLabel: string) =>
  (await getPool().query(`select * from audit_log where actor_label = $1 order by id`, [actorLabel])).rows;

describe("audit_log", () => {
  it("records an entry with its actor, entity, address and structured detail", async () => {
    const actorLabel = uniqueEmail("audit");
    await recordAudit({
      actorLabel,
      action: "user.created",
      entityType: "user",
      entityId: "abc123",
      ip: "203.0.113.9",
      userAgent: "vitest",
      detail: { role: "editor" },
    });
    const [row] = await rowsFor(actorLabel);
    expect(row).toMatchObject({
      actor_id: null,
      action: "user.created",
      entity_type: "user",
      entity_id: "abc123",
      ip: "203.0.113.9",
      user_agent: "vitest",
      detail: { role: "editor" },
    });
    expect(row.at).toBeInstanceOf(Date);
  });

  it.each([
    ["UPDATE", "update audit_log set action = 'tampered' where actor_label = $1"],
    ["DELETE", "delete from audit_log where actor_label = $1"],
  ])("is append-only: %s is refused, even for the connected (owner) role", async (_verb, sql) => {
    const actorLabel = uniqueEmail("append-only");
    await recordAudit({ actorLabel, action: "auth.sign_in" });
    await expect(getPool().query(sql, [actorLabel])).rejects.toThrow(/append-only/);
    expect(await rowsFor(actorLabel)).toHaveLength(1);
  });

  it("is append-only: TRUNCATE is refused too", async () => {
    await expect(getPool().query(`truncate audit_log`)).rejects.toThrow(/append-only/);
  });

  it("refuses a blank action at the database", async () => {
    await expect(
      getPool().query(`insert into audit_log (actor_label, action) values ('x', '   ')`),
    ).rejects.toThrow(/audit_log_action_nonblank/);
  });

  it("recordAudit never throws: a failed write is logged and swallowed, the audited action stands", async () => {
    const actorLabel = uniqueEmail("swallow");
    await expect(recordAudit({ actorLabel, action: "   " as never })).resolves.toBeUndefined();
    expect(await rowsFor(actorLabel)).toHaveLength(0);
  });

  it("keeps authorship: a user referenced by the audit trail cannot be deleted", async () => {
    const email = uniqueEmail("author");
    const id = await createUser(email, "editor");
    await recordAudit({ actorId: id, actorLabel: email, action: "auth.sign_in" });
    await expect(getPool().query(`delete from app_user where id = $1`, [id])).rejects.toThrow(/audit_log_actor_id_app_user_id_fk/);
  });
});

describe("login_attempt persistence", () => {
  it("serialises concurrent failures: exactly one lock, no matter how many arrive at once", async () => {
    const key = uniqueEmail("race");
    const outcomes = await Promise.all(Array.from({ length: LOCK_THRESHOLD * 3 }, () => registerFailure(key)));
    expect(outcomes.filter((outcome) => outcome.justLocked)).toHaveLength(1);
    const state = await getLockState(key);
    expect(state.lockLevel).toBe(1); // the extra failures arrived while locked and did not escalate
    expect(state.lockedUntil).not.toBeNull();
  });

  it("clearAttempts forgets everything about an address", async () => {
    const key = uniqueEmail("clear");
    await registerFailure(key);
    expect((await getLockState(key)).failures).toBe(1);
    await clearAttempts(key);
    expect(await getLockState(key)).toEqual(EMPTY_LOCK_STATE);
  });

  it("prunes forgotten rows but never a running lock or a recent failure", async () => {
    const pool = getPool();
    const stale = uniqueEmail("stale");
    const stillLocked = uniqueEmail("still-locked");
    const recent = uniqueEmail("recent");
    await pool.query(
      `insert into login_attempt (email_key, failures, lock_level, locked_until, last_failure_at) values
         ($1, 2, 1, null, now() - interval '3 days'),
         ($2, 0, 4, now() + interval '2 hours', now() - interval '3 days'),
         ($3, 1, 0, null, now() - interval '1 hour')`,
      [stale, stillLocked, recent],
    );

    vi.spyOn(Math, "random").mockReturnValue(0); // force the opportunistic prune
    await registerFailure(uniqueEmail("trigger"));

    const remaining = (await pool.query(`select email_key from login_attempt where email_key = any($1)`, [[stale, stillLocked, recent]])).rows.map(
      (row) => row.email_key,
    );
    expect(remaining.sort()).toEqual([recent, stillLocked].sort());
  });
});
