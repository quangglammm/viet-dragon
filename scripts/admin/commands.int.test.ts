import { afterAll, describe, expect, it } from "vitest";
import { getLockState, normalizeEmailKey, registerFailure } from "@/lib/auth/lockout";
import { getPool } from "@/lib/db";
import { auditRows, body, createUser, login, PASSWORD, signIn, uniqueEmail, userRow } from "@/tests/helpers/auth";
import { createAdmin, resetPassword } from "./commands";
import { CliError } from "./errors";

afterAll(async () => {
  await getPool().end();
});

const NEW_PASSWORD = "a brand new passphrase 9";

async function sessionCount(email: string): Promise<number> {
  const { rows } = await getPool().query(
    `select count(*)::int as n from session where user_id = (select id from app_user where email = $1)`,
    [email],
  );
  return rows[0].n;
}

async function rejection(promise: Promise<unknown>): Promise<CliError> {
  const error = await promise.then(
    () => undefined,
    (thrown: unknown) => thrown,
  );
  expect(error).toBeInstanceOf(CliError);
  return error as CliError;
}

describe("createAdmin", () => {
  it("creates an admin who can sign in at once, with the CLI as the audited actor", async () => {
    const email = uniqueEmail("cli-admin");
    const created = await createAdmin({ email: `  ${email.toUpperCase()} `, name: "  Chủ Xưởng ", password: PASSWORD });

    expect(created.email).toBe(email);
    const row = await userRow(email);
    expect(row).toMatchObject({ name: "Chủ Xưởng", role: "admin", must_change_password: false, banned: false });

    const response = await signIn(email, PASSWORD);
    expect(response.status).toBe(200);
    expect((await body(response)).redirect).not.toBe(true);

    const audit = await auditRows({ action: "user.created", entityId: created.id });
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor_label: "cli", actor_id: null });
  });

  it("refuses an address that already has an account, and leaves that account alone", async () => {
    const email = uniqueEmail("cli-dupe");
    await createUser(email, "editor");

    const error = await rejection(createAdmin({ email, name: "Someone", password: NEW_PASSWORD }));
    expect(error.message).toContain("reset-password");
    expect(await userRow(email)).toMatchObject({ role: "editor" });
    expect((await signIn(email, PASSWORD)).status).toBe(200);
    expect((await signIn(email, NEW_PASSWORD)).status).toBe(401);
  });

  it.each([
    ["a too-short password", { email: "x", name: "Admin", password: "short" }],
    ["a too-long password", { email: "x", name: "Admin", password: "x".repeat(129) }],
    ["an invalid email", { email: "not-an-email", name: "Admin", password: PASSWORD }],
    ["a blank name", { email: "x", name: "   ", password: PASSWORD }],
  ])("rejects %s without creating anything", async (_label, input) => {
    const email = input.email === "x" ? uniqueEmail("cli-bad") : input.email;
    await rejection(createAdmin({ ...input, email }));
    expect((await getPool().query(`select 1 from app_user where email = $1`, [email.toLowerCase()])).rowCount).toBe(0);
  });
});

describe("resetPassword", () => {
  it("replaces the password, forces a change, ends every session and is audited as the CLI", async () => {
    const email = uniqueEmail("cli-reset");
    const id = await createUser(email, "editor");
    await login(email);
    await login(email);
    expect(await sessionCount(email)).toBe(2);

    const result = await resetPassword({ email: email.toUpperCase(), password: NEW_PASSWORD });

    expect(result).toEqual({ id, email, banned: false });
    expect((await signIn(email, PASSWORD)).status).toBe(401);
    expect((await signIn(email, NEW_PASSWORD)).status).toBe(200);
    expect(await userRow(email)).toMatchObject({ must_change_password: true });
    expect(await sessionCount(email)).toBe(1); // only the one the new sign-in just made

    const audit = await auditRows({ action: "user.password_reset", entityId: id });
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor_label: "cli", actor_id: null });
    expect(audit[0].detail).toMatchObject({ email, via: "cli" });
  });

  it("lifts a sign-in lockout — the usual reason to run it", async () => {
    const email = uniqueEmail("cli-locked");
    await createUser(email, "admin");
    const key = normalizeEmailKey(email);
    for (let failure = 0; failure < 5; failure += 1) await registerFailure(key);
    expect((await getLockState(key)).lockedUntil).not.toBeNull();

    await resetPassword({ email, password: NEW_PASSWORD });

    expect((await getLockState(key)).lockedUntil).toBeNull();
    expect((await signIn(email, NEW_PASSWORD)).status).toBe(200);
  });

  it("does not reactivate a deactivated account, and says so", async () => {
    const email = uniqueEmail("cli-banned");
    await createUser(email, "editor");
    await getPool().query(`update app_user set banned = true where email = $1`, [email]);

    const result = await resetPassword({ email, password: NEW_PASSWORD });

    expect(result.banned).toBe(true);
    const response = await signIn(email, NEW_PASSWORD);
    expect(response.status).toBe(403);
    expect((await body(response)).code).toBe("BANNED_USER");
  });

  it("names an unknown address instead of pretending to succeed", async () => {
    const error = await rejection(resetPassword({ email: uniqueEmail("cli-ghost"), password: NEW_PASSWORD }));
    expect(error.message).toMatch(/no account/i);
  });

  it("rejects a weak password and leaves the old one working", async () => {
    const email = uniqueEmail("cli-weak");
    await createUser(email, "editor");

    await rejection(resetPassword({ email, password: "short" }));

    expect((await signIn(email, PASSWORD)).status).toBe(200);
    expect(await userRow(email)).toMatchObject({ must_change_password: false });
  });
});
