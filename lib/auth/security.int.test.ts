import { afterAll, describe, expect, it } from "vitest";
import {
  ageSessions,
  auditRows,
  authRequest,
  body,
  createUser,
  expireLock,
  lockedUntil,
  login,
  PASSWORD,
  signIn,
  uniqueEmail,
  uniqueIp,
  userRow,
} from "@/tests/helpers/auth";
import { getPool } from "@/lib/db";
import { LOCK_BASE_SECONDS, LOCK_THRESHOLD } from "./constants";

afterAll(async () => {
  await getPool().end();
});

const WRONG = "definitely the wrong password";

/** Fails `times` sign-ins from a different IP each time, so only the per-ACCOUNT lock can react. */
async function failSignIns(email: string, times: number): Promise<Response> {
  let last = new Response();
  for (let i = 0; i < times; i++) last = await signIn(email, WRONG, uniqueIp());
  return last;
}

describe("sign-in basics", () => {
  it("answers a wrong password and an unknown email identically (no account enumeration)", async () => {
    const email = uniqueEmail("enum");
    await createUser(email, "editor");
    const known = await signIn(email, WRONG);
    const unknown = await signIn(uniqueEmail("ghost"), WRONG);
    expect(known.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await body(known)).toEqual(await body(unknown));
  });

  it("signs in with the right password, sets a strict HttpOnly cookie, and audits it with IP and user agent", async () => {
    const email = uniqueEmail("ok");
    const id = await createUser(email, "editor");
    const ip = uniqueIp();
    const response = await signIn(email, PASSWORD, ip);
    expect(response.status).toBe(200);
    const setCookie = response.headers.getSetCookie()[0];
    expect(setCookie).toMatch(/^vd\.session_token=/);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Strict/);
    expect(setCookie).toMatch(/Max-Age=43200/);

    const [row] = await auditRows({ actorLabel: email, action: "auth.sign_in" });
    expect(row).toMatchObject({ actor_id: id, ip, user_agent: "vitest-integration" });
  });

  it("refuses a cross-origin sign-in and does not count it as a failed attempt", async () => {
    const email = uniqueEmail("origin");
    await createUser(email, "editor");
    const response = await signIn(email, PASSWORD, uniqueIp(), "https://evil.example");
    expect(response.status).toBe(403);
    expect(await body(response)).toMatchObject({ code: "INVALID_ORIGIN" });
    expect(await auditRows({ actorLabel: email, action: "auth.sign_in_failed" })).toHaveLength(0);
  });

  it("has sign-up disabled (invite-only)", async () => {
    const response = await authRequest("/sign-up/email", {
      body: { email: uniqueEmail("intruder"), password: PASSWORD, name: "x" },
    });
    expect(response.status).toBe(400);
    expect(await body(response)).toMatchObject({ code: "EMAIL_PASSWORD_SIGN_UP_DISABLED" });
  });

  it("signs out, revokes the session, and audits it", async () => {
    const email = uniqueEmail("out");
    await createUser(email, "editor");
    const cookie = await login(email);
    const out = await authRequest("/sign-out", { body: {}, cookie });
    expect(out.status).toBe(200);
    expect(await (await authRequest("/get-session", { cookie })).json()).toBeNull();
    expect(await auditRows({ actorLabel: email, action: "auth.sign_out" })).toHaveLength(1);
  });

  it("rate limits one IP across many different emails, with Better Auth's own 429 (not the account lock)", async () => {
    const ip = uniqueIp();
    const statuses: number[] = [];
    let last: Response = new Response();
    for (let i = 0; i < 7; i++) {
      last = await signIn(uniqueEmail("burst"), WRONG, ip);
      statuses.push(last.status);
    }
    expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(statuses.slice(5)).toEqual([429, 429]);
    expect((await body(last)).code).not.toBe("ACCOUNT_LOCKED");
  });
});

describe("per-account lockout", () => {
  it("locks the ACCOUNT (not the IP) after the threshold, even for the correct password, with Retry-After", async () => {
    const email = uniqueEmail("lock");
    await createUser(email, "editor");
    await failSignIns(email, LOCK_THRESHOLD);

    const blocked = await signIn(email, PASSWORD, uniqueIp()); // right password, brand-new IP
    expect(blocked.status).toBe(429);
    expect(await body(blocked)).toMatchObject({ code: "ACCOUNT_LOCKED" });
    const retryAfter = Number(blocked.headers.get("retry-after"));
    expect(retryAfter).toBeGreaterThan(LOCK_BASE_SECONDS - 5);
    expect(retryAfter).toBeLessThanOrEqual(LOCK_BASE_SECONDS);

    expect(await auditRows({ actorLabel: email, action: "auth.sign_in_failed" })).toHaveLength(LOCK_THRESHOLD);
    expect(await auditRows({ actorLabel: email, action: "auth.account_locked" })).toHaveLength(1);
  });

  it("locks an address with no account in exactly the same way (no enumeration through the lock)", async () => {
    const ghost = uniqueEmail("ghost-lock");
    await failSignIns(ghost, LOCK_THRESHOLD);
    const blocked = await signIn(ghost, PASSWORD, uniqueIp());
    expect(blocked.status).toBe(429);
    expect(await body(blocked)).toMatchObject({ code: "ACCOUNT_LOCKED" });
  });

  it("treats upper- and lower-case spellings of an email as the same account", async () => {
    const email = uniqueEmail("case");
    await createUser(email, "editor");
    await failSignIns(email.toUpperCase(), LOCK_THRESHOLD);
    expect((await signIn(email, PASSWORD, uniqueIp())).status).toBe(429);
  });

  it("a success resets the counter", async () => {
    const email = uniqueEmail("reset");
    await createUser(email, "editor");
    await failSignIns(email, LOCK_THRESHOLD - 1);
    expect((await signIn(email, PASSWORD, uniqueIp())).status).toBe(200);
    await failSignIns(email, LOCK_THRESHOLD - 1);
    expect((await signIn(email, PASSWORD, uniqueIp())).status).toBe(200); // still not locked
  });

  it("unlocks when the lock expires, and the next lock is longer (exponential back-off)", async () => {
    const email = uniqueEmail("backoff");
    await createUser(email, "editor");
    await failSignIns(email, LOCK_THRESHOLD);
    await expireLock(email);

    await failSignIns(email, LOCK_THRESHOLD - 1);
    // fifth failure of the second round locks again, twice as long
    await signIn(email, WRONG, uniqueIp());
    const remainingMs = ((await lockedUntil(email)) as Date).getTime() - Date.now();
    expect(remainingMs / 1000).toBeGreaterThan(LOCK_BASE_SECONDS * 2 - 10);
    expect(remainingMs / 1000).toBeLessThanOrEqual(LOCK_BASE_SECONDS * 2);
  });

  it("counts only genuine credential failures — validation errors never lock an address", async () => {
    const email = uniqueEmail("nolock");
    await createUser(email, "editor");
    for (let i = 0; i < LOCK_THRESHOLD + 2; i++) {
      const malformed = await authRequest("/sign-in/email", { body: { email }, ip: uniqueIp() }); // no password field
      expect(malformed.status).toBe(400);
    }
    expect((await signIn(email, PASSWORD, uniqueIp())).status).toBe(200);
  });
});

describe("session freshness (enforced by our hook; Better Auth does not)", () => {
  it("refuses sensitive actions from a session older than 15 minutes, but still allows reads", async () => {
    const email = uniqueEmail("stale-admin");
    await createUser(email, "admin");
    const cookie = await login(email);
    await ageSessions(email, 3600);

    const target = uniqueEmail("stale-target");
    const targetId = await createUser(target, "editor");
    const attempts = await Promise.all([
      authRequest("/admin/create-user", { cookie, body: { email: uniqueEmail("x"), password: PASSWORD, name: "x", role: "editor" } }),
      authRequest("/admin/set-role", { cookie, body: { userId: targetId, role: "admin" } }),
      authRequest("/admin/ban-user", { cookie, body: { userId: targetId } }),
      authRequest("/admin/set-user-password", { cookie, body: { userId: targetId, newPassword: PASSWORD } }),
      authRequest("/change-password", { cookie, body: { currentPassword: PASSWORD, newPassword: `${PASSWORD} new` } }),
    ]);
    for (const response of attempts) {
      expect(response.status).toBe(403);
      expect(await body(response)).toMatchObject({ code: "SESSION_NOT_FRESH" });
    }
    expect((await userRow(target)).role).toBe("editor"); // nothing happened
    expect((await authRequest("/admin/list-users", { cookie })).status).toBe(200); // reads are fine
  });

  it("allows the same actions right after signing in again", async () => {
    const email = uniqueEmail("fresh-admin");
    await createUser(email, "admin");
    await login(email);
    await ageSessions(email, 3600);
    const cookie = await login(email); // new session = fresh
    const response = await authRequest("/admin/create-user", {
      cookie,
      body: { email: uniqueEmail("made"), password: PASSWORD, name: "made", role: "editor" },
    });
    expect(response.status).toBe(200);
  });
});

describe("password policy", () => {
  it("rejects short passwords on create-user (Better Auth alone would accept them) and set-user-password", async () => {
    const adminEmail = uniqueEmail("policy-admin");
    await createUser(adminEmail, "admin");
    const cookie = await login(adminEmail);
    const targetId = await createUser(uniqueEmail("policy-target"), "editor");

    const created = await authRequest("/admin/create-user", {
      cookie,
      body: { email: uniqueEmail("short"), password: "short", name: "s", role: "editor" },
    });
    expect(created.status).toBe(400);
    expect(await body(created)).toMatchObject({ code: "PASSWORD_POLICY" });

    const reset = await authRequest("/admin/set-user-password", { cookie, body: { userId: targetId, newPassword: "short" } });
    expect(reset.status).toBe(400);
    expect(await body(reset)).toMatchObject({ code: "PASSWORD_POLICY" });
  });

  it("rejects a short new password on change-password", async () => {
    const email = uniqueEmail("policy-self");
    await createUser(email, "editor");
    const response = await authRequest("/change-password", {
      cookie: await login(email),
      body: { currentPassword: PASSWORD, newPassword: "short" },
    });
    expect(response.status).toBe(400);
  });
});

describe("temporary passwords: mustChangePassword", () => {
  it("is on for admin-created accounts, cleared by the user's own password change, and audited", async () => {
    const adminEmail = uniqueEmail("mc-admin");
    await createUser(adminEmail, "admin");
    const adminCookie = await login(adminEmail);

    const editorEmail = uniqueEmail("mc-editor");
    const created = await authRequest("/admin/create-user", {
      cookie: adminCookie,
      body: { email: editorEmail, password: PASSWORD, name: "mc", role: "editor" },
    });
    expect(created.status).toBe(200);
    expect((await userRow(editorEmail)).must_change_password).toBe(true);

    const editorCookie = await login(editorEmail);
    const session = (await (await authRequest("/get-session", { cookie: editorCookie })).json()) as { user: { mustChangePassword: boolean } };
    expect(session.user.mustChangePassword).toBe(true);

    const changed = await authRequest("/change-password", {
      cookie: editorCookie,
      body: { currentPassword: PASSWORD, newPassword: `${PASSWORD} chosen by me` },
    });
    expect(changed.status).toBe(200);
    expect((await userRow(editorEmail)).must_change_password).toBe(false);
    expect(await auditRows({ actorLabel: editorEmail, action: "auth.password_changed" })).toHaveLength(1);
    expect(await auditRows({ actorLabel: adminEmail, action: "user.created" })).toHaveLength(1);
  });

  it("an admin password reset forces a change again, ends the target's sessions, and never audits the password", async () => {
    const adminEmail = uniqueEmail("reset-admin");
    await createUser(adminEmail, "admin");
    const adminCookie = await login(adminEmail);
    const editorEmail = uniqueEmail("reset-editor");
    const editorId = await createUser(editorEmail, "editor", { mustChangePassword: false });
    const editorCookie = await login(editorEmail);

    const newPassword = "a freshly generated temp password";
    const response = await authRequest("/admin/set-user-password", { cookie: adminCookie, body: { userId: editorId, newPassword } });
    expect(response.status).toBe(200);

    expect((await userRow(editorEmail)).must_change_password).toBe(true);
    expect(await (await authRequest("/get-session", { cookie: editorCookie })).json()).toBeNull(); // old session is gone
    expect((await signIn(editorEmail, newPassword)).status).toBe(200);

    const [row] = await auditRows({ action: "user.password_reset", entityId: editorId });
    expect(row.actor_label).toBe(adminEmail);
    expect(JSON.stringify(row)).not.toContain(newPassword);
  });
});

describe("roles and the admin plugin", () => {
  it("answers 401 to unauthenticated admin calls and 403 to an editor", async () => {
    expect((await authRequest("/admin/list-users")).status).toBe(401);
    const editorEmail = uniqueEmail("role-editor");
    await createUser(editorEmail, "editor");
    const cookie = await login(editorEmail);
    expect((await authRequest("/admin/list-users", { cookie })).status).toBe(403);
    expect(
      (await authRequest("/admin/create-user", { cookie, body: { email: uniqueEmail("e"), password: PASSWORD, name: "e", role: "admin" } })).status,
    ).toBe(403);
  });

  it("never lets even an admin delete or impersonate a user, or rewrite one through update-user", async () => {
    const adminEmail = uniqueEmail("never-admin");
    await createUser(adminEmail, "admin");
    const cookie = await login(adminEmail);
    const targetId = await createUser(uniqueEmail("never-target"), "editor");
    for (const [path, payload] of [
      ["/admin/remove-user", { userId: targetId }],
      ["/admin/impersonate-user", { userId: targetId }],
      ["/admin/update-user", { userId: targetId, data: { role: "admin" } }],
    ] as const) {
      expect((await authRequest(path, { cookie, body: payload })).status, path).toBe(403);
    }
  });

  it("stops an admin from changing their own role or banning themselves", async () => {
    const email = uniqueEmail("self");
    const id = await createUser(email, "admin");
    const cookie = await login(email);
    for (const [path, payload] of [
      ["/admin/set-role", { userId: id, role: "editor" }],
      ["/admin/ban-user", { userId: id }],
    ] as const) {
      const response = await authRequest(path, { cookie, body: payload });
      expect(response.status, path).toBe(403);
      expect(await body(response)).toMatchObject({ code: "SELF_ACTION_FORBIDDEN" });
    }
    expect(await userRow(email)).toMatchObject({ role: "admin", banned: false });
  });

  it("audits a role change with the previous and new role", async () => {
    const adminEmail = uniqueEmail("rc-admin");
    await createUser(adminEmail, "admin");
    const cookie = await login(adminEmail);
    const targetId = await createUser(uniqueEmail("rc-target"), "editor");

    expect((await authRequest("/admin/set-role", { cookie, body: { userId: targetId, role: "admin" } })).status).toBe(200);
    const [row] = await auditRows({ action: "user.role_changed", entityId: targetId });
    expect(row.actor_label).toBe(adminEmail);
    expect(row.detail).toEqual({ from: "editor", to: "admin" });
  });
});

describe("deactivation (ban)", () => {
  it("blocks sign-in, ends sessions, stays generic for a wrong password, and can be undone — all audited", async () => {
    const adminEmail = uniqueEmail("ban-admin");
    await createUser(adminEmail, "admin");
    const adminCookie = await login(adminEmail);
    const email = uniqueEmail("ban-target");
    const id = await createUser(email, "editor");
    const targetCookie = await login(email);

    expect((await authRequest("/admin/ban-user", { cookie: adminCookie, body: { userId: id, banReason: "left the company" } })).status).toBe(200);

    expect(await (await authRequest("/get-session", { cookie: targetCookie })).json()).toBeNull();
    const banned = await signIn(email, PASSWORD);
    expect(banned.status).toBe(403);
    expect(await body(banned)).toMatchObject({ code: "BANNED_USER" });
    const wrong = await signIn(email, WRONG);
    expect(wrong.status).toBe(401); // a ban is only revealed to someone who knows the password
    expect(await body(wrong)).toMatchObject({ code: "INVALID_EMAIL_OR_PASSWORD" });

    expect((await authRequest("/admin/unban-user", { cookie: adminCookie, body: { userId: id } })).status).toBe(200);
    expect((await signIn(email, PASSWORD)).status).toBe(200);

    const [banRow] = await auditRows({ action: "user.banned", entityId: id });
    expect(banRow.detail).toEqual({ reason: "left the company" });
    expect(await auditRows({ action: "user.unbanned", entityId: id })).toHaveLength(1);
  });
});

describe("endpoints that must stay inert", () => {
  it("gives a known and an unknown address the same answer on password-reset requests", async () => {
    const email = uniqueEmail("reset-probe");
    await createUser(email, "editor");
    const known = await authRequest("/request-password-reset", { body: { email, redirectTo: "/admin/login" } });
    const unknown = await authRequest("/request-password-reset", { body: { email: uniqueEmail("nobody"), redirectTo: "/admin/login" } });
    expect(known.status).toBe(unknown.status);
    expect(await body(known)).toEqual(await body(unknown));
  });
});

describe("cookies", () => {
  it("never accepts the legacy forged admin cookie", async () => {
    const forged = Buffer.from(`admin:vd_sec_token_98374291873912873:${Date.now()}`).toString("base64");
    const response = await authRequest("/get-session", { cookie: `vd_admin_session=${forged}` });
    expect(await response.json()).toBeNull();
  });
});
