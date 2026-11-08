import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { CLI_ACTOR, recordAudit } from "@/lib/auth/audit";
import { clearAttempts, normalizeEmailKey } from "@/lib/auth/lockout";
import { violatesPasswordPolicy } from "@/lib/auth/password";
import { CliError } from "./errors";
import { PASSWORD_RULE } from "./rules";

// What `pnpm admin:create` and `pnpm admin:reset-password` do, separate from how they ask for input so the
// integration tests can run them against a real database without a terminal. This is the break-glass path
// (the first admin, or recovery after every admin is locked out), so it never needs an existing session.

const MAX_NAME_LENGTH = 100;

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!z.email().safeParse(normalized).success) throw new CliError(`"${email.trim()}" is not a valid email address.`);
  return normalized;
}

function assertPassword(password: string): void {
  if (violatesPasswordPolicy(password)) throw new CliError(PASSWORD_RULE);
}

export type CreatedAdmin = { id: string; email: string };

/**
 * Creates an `admin` account. It goes through Better Auth's own `createUser`, so the password policy and the
 * audit entry (`user.created`, actor "cli") come from the same hooks as the web UI. No forced password change:
 * the person at the keyboard just chose this password.
 */
export async function createAdmin(input: { email: string; name: string; password: string }): Promise<CreatedAdmin> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  if (!name || name.length > MAX_NAME_LENGTH) throw new CliError(`The name must be 1–${MAX_NAME_LENGTH} characters.`);
  assertPassword(input.password);

  const auth = getAuth();
  if (await (await auth.$context).internalAdapter.findUserByEmail(email)) {
    throw new CliError(`An account for ${email} already exists. To set a new password for it run: admin:reset-password ${email}`);
  }

  const { user } = await auth.api.createUser({
    body: { email, password: input.password, name, role: "admin", data: { mustChangePassword: false } },
  });
  return { id: user.id, email };
}

export type PasswordReset = { id: string; email: string; banned: boolean };

/**
 * Replaces an account's password. Mirrors what an admin reset does in the UI — forced change at the next sign-in,
 * every existing session ended, audit entry — and also lifts the sign-in lockout, because the usual reason to run
 * this is someone locked out. A deactivated account stays deactivated; the caller is told.
 */
export async function resetPassword(input: { email: string; password: string }): Promise<PasswordReset> {
  const email = normalizeEmail(input.email);
  assertPassword(input.password);

  const context = await getAuth().$context;
  const found = await context.internalAdapter.findUserByEmail(email);
  if (!found) throw new CliError(`There is no account for ${email}.`);
  const { user } = found;

  const hashed = await context.password.hash(input.password);
  if (await context.internalAdapter.findCredentialAccount(user.id)) {
    await context.internalAdapter.updatePassword(user.id, hashed);
  } else {
    await context.internalAdapter.createAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: hashed });
  }
  await context.internalAdapter.updateUser(user.id, { mustChangePassword: true });
  await context.internalAdapter.deleteUserSessions(user.id);
  await clearAttempts(normalizeEmailKey(email));
  await recordAudit({
    actorLabel: CLI_ACTOR,
    action: "user.password_reset",
    entityType: "user",
    entityId: user.id,
    detail: { email, via: "cli" },
  });

  return { id: user.id, email, banned: (user as { banned?: boolean | null }).banned === true };
}
