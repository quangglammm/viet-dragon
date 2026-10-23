import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { getLogger } from "@/lib/logger";
import { CLI_ACTOR, recordAudit, requestMeta, type AuditAction } from "./audit";
import { SESSION_FRESH_AGE_SECONDS } from "./constants";
import { clearAttempts, getLockState, lockSecondsRemaining, normalizeEmailKey, registerFailure } from "./lockout";
import { PASSWORD_POLICY_MESSAGE, violatesPasswordPolicy } from "./password";

// Better Auth hooks that close the gaps found in the Phase 2 spike:
//   * per-account lockout (the library only rate-limits per IP)
//   * session freshness — `freshAge` is NOT enforced on change-password or the admin endpoints
//   * password policy on admin create-user (the library skips minPasswordLength there)
// and that write the audit trail. Hooks also fire for server-side `auth.api.*` calls (the CLI),
// where there is no request, session or IP — every helper below tolerates that.

type HookContext = Parameters<Parameters<typeof createAuthMiddleware>[0]>[0];
type StatusName = "TOO_MANY_REQUESTS" | "FORBIDDEN" | "BAD_REQUEST";

const log = getLogger("auth");

const FRESH_SESSION_PATHS = new Set([
  "/change-password",
  "/admin/create-user",
  "/admin/set-role",
  "/admin/ban-user",
  "/admin/unban-user",
  "/admin/set-user-password",
  "/admin/revoke-user-sessions",
]);
const SELF_ACTION_PATHS = new Set(["/admin/set-role", "/admin/ban-user"]);

const INVALID_CREDENTIALS = "INVALID_EMAIL_OR_PASSWORD";

// The role a target had before set-role ran, so the audit entry can say "editor -> admin".
// Keyed by the request: before and after hooks of one HTTP call share it.
const previousRoles = new WeakMap<Request, string | null>();

function reject(status: StatusName, code: string, message: string, headers?: HeadersInit): never {
  throw new APIError(status, { message, code }, headers);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function field(source: unknown, key: string): string | undefined {
  const value = asRecord(source)?.[key];
  return typeof value === "string" ? value : undefined;
}

async function actorOf(ctx: HookContext): Promise<{ actorId: string | null; actorLabel: string }> {
  const session = await getSessionFromCtx(ctx).catch(() => null);
  return session ? { actorId: session.user.id, actorLabel: session.user.email } : { actorId: null, actorLabel: CLI_ACTOR };
}

async function audit(
  ctx: HookContext,
  action: AuditAction,
  entityId: string | undefined,
  detail?: Record<string, unknown>,
): Promise<void> {
  await recordAudit({
    ...(await actorOf(ctx)),
    action,
    entityType: "user",
    entityId,
    detail,
    ...requestMeta(ctx.headers),
  });
}

// ───────────────────────────── before ─────────────────────────────

async function assertNotLocked(email: unknown): Promise<void> {
  if (typeof email !== "string" || email === "") return; // Better Auth rejects malformed bodies itself
  const remaining = lockSecondsRemaining(await getLockState(normalizeEmailKey(email)), new Date());
  if (remaining > 0) {
    reject("TOO_MANY_REQUESTS", "ACCOUNT_LOCKED", "Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau.", {
      "Retry-After": String(remaining),
    });
  }
}

async function assertFreshSession(ctx: HookContext): Promise<void> {
  const session = await getSessionFromCtx(ctx).catch(() => null);
  if (!session) return; // unauthenticated: the endpoint's own middleware answers 401
  const ageSeconds = (Date.now() - new Date(session.session.createdAt).getTime()) / 1000;
  if (ageSeconds > SESSION_FRESH_AGE_SECONDS) {
    reject("FORBIDDEN", "SESSION_NOT_FRESH", "Phiên đăng nhập đã cũ. Vui lòng đăng nhập lại để tiếp tục thao tác này.");
  }
}

function assertPasswordPolicy(password: unknown): void {
  if (violatesPasswordPolicy(password)) reject("BAD_REQUEST", "PASSWORD_POLICY", PASSWORD_POLICY_MESSAGE);
}

async function assertNotSelfTarget(ctx: HookContext): Promise<void> {
  const session = await getSessionFromCtx(ctx).catch(() => null);
  if (session && field(ctx.body, "userId") === session.user.id) {
    reject("FORBIDDEN", "SELF_ACTION_FORBIDDEN", "Không thể tự đổi vai trò hoặc vô hiệu hóa chính tài khoản của bạn.");
  }
}

async function rememberPreviousRole(ctx: HookContext): Promise<void> {
  const userId = field(ctx.body, "userId");
  if (!userId || !ctx.request) return;
  // The adapter's user type predates the admin plugin's `role` column, hence the loose read.
  const target = await ctx.context.internalAdapter.findUserById(userId);
  previousRoles.set(ctx.request, field(target, "role") ?? null);
}

async function runBefore(ctx: HookContext): Promise<void> {
  const { path } = ctx;
  if (path === "/sign-in/email") return assertNotLocked(field(ctx.body, "email"));
  if (path === "/sign-out") return audit(ctx, "auth.sign_out", undefined); // before: the session is still valid

  if (FRESH_SESSION_PATHS.has(path)) await assertFreshSession(ctx);
  if (path === "/admin/create-user") assertPasswordPolicy(field(ctx.body, "password"));
  if (path === "/admin/set-user-password") assertPasswordPolicy(field(ctx.body, "newPassword"));
  if (SELF_ACTION_PATHS.has(path)) await assertNotSelfTarget(ctx);
  if (path === "/admin/set-role") await rememberPreviousRole(ctx);
}

// ───────────────────────────── after ─────────────────────────────

async function afterSignIn(ctx: HookContext): Promise<void> {
  const emailKey = normalizeEmailKey(field(ctx.body, "email") ?? "");
  const meta = requestMeta(ctx.headers);
  const newSession = ctx.context.newSession;

  if (newSession) {
    await clearAttempts(emailKey);
    await recordAudit({ actorId: newSession.user.id, actorLabel: newSession.user.email, action: "auth.sign_in", ...meta });
    return;
  }

  const returned = ctx.context.returned;
  // Only genuine credential failures count: counting validation errors or bans would let anyone lock any address.
  if (!(returned instanceof APIError) || field(returned.body, "code") !== INVALID_CREDENTIALS) return;

  const { state, justLocked } = await registerFailure(emailKey);
  await recordAudit({ actorLabel: emailKey, action: "auth.sign_in_failed", detail: { failures: state.failures }, ...meta });
  if (justLocked) {
    log.warn({ lockLevel: state.lockLevel }, "account locked after repeated failed sign-ins");
    await recordAudit({
      actorLabel: emailKey,
      action: "auth.account_locked",
      detail: { lockLevel: state.lockLevel, lockedUntil: state.lockedUntil?.toISOString() },
      ...meta,
    });
  }
}

async function afterPasswordChanged(ctx: HookContext): Promise<void> {
  const session = await getSessionFromCtx(ctx).catch(() => null);
  if (!session) return;
  await ctx.context.internalAdapter.updateUser(session.user.id, { mustChangePassword: false });
  await recordAudit({
    actorId: session.user.id,
    actorLabel: session.user.email,
    action: "auth.password_changed",
    entityType: "user",
    entityId: session.user.id,
    detail: { revokedOtherSessions: asRecord(ctx.body)?.revokeOtherSessions === true },
    ...requestMeta(ctx.headers),
  });
}

async function afterPasswordReset(ctx: HookContext): Promise<void> {
  const userId = field(ctx.body, "userId");
  if (!userId) return;
  // An admin-set password is a temporary one: force a change, and end whatever sessions the old password had.
  await ctx.context.internalAdapter.updateUser(userId, { mustChangePassword: true });
  await ctx.context.internalAdapter.deleteUserSessions(userId);
  await audit(ctx, "user.password_reset", userId);
}

async function runAfter(ctx: HookContext): Promise<void> {
  if (ctx.path === "/sign-in/email") return afterSignIn(ctx);
  if (ctx.context.returned instanceof APIError) return; // everything below audits successes only

  const userId = field(ctx.body, "userId");
  const returnedUser = asRecord(asRecord(ctx.context.returned)?.user);
  const returnedId = field(returnedUser, "id");

  switch (ctx.path) {
    case "/change-password":
      return afterPasswordChanged(ctx);
    case "/admin/set-user-password":
      return afterPasswordReset(ctx);
    case "/admin/create-user":
      return audit(ctx, "user.created", returnedId, { email: field(returnedUser, "email"), role: field(returnedUser, "role") });
    case "/admin/set-role":
      return audit(ctx, "user.role_changed", userId, {
        from: ctx.request ? previousRoles.get(ctx.request) : undefined,
        to: field(returnedUser, "role"),
      });
    case "/admin/ban-user":
      return audit(ctx, "user.banned", userId, { reason: field(ctx.body, "banReason") });
    case "/admin/unban-user":
      return audit(ctx, "user.unbanned", userId);
    case "/admin/revoke-user-sessions":
      return audit(ctx, "user.sessions_revoked", userId);
  }
}

export function createAuthHooks() {
  return {
    before: createAuthMiddleware(runBefore),
    after: createAuthMiddleware(runAfter),
  };
}
