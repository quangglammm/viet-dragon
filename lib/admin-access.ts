// Pure routing decisions for /admin, kept free of imports so proxy.ts and the tests share them.
// This is the OPTIMISTIC layer only — it sees nothing but whether a session cookie exists. The real
// check (is the session valid, is the user allowed) is the DAL in lib/dal.ts, close to the data.

export const ADMIN_ROOT = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ACCOUNT_PATH = "/admin/account";
export const PASSWORD_CHANGE_PATH = "/admin/account/password";

const MAX_NEXT_LENGTH = 512;
// Control characters and backslashes (browsers read `\` as `/`, so `/\evil.example` is protocol-relative).
const UNSAFE_NEXT_CHARS = /[\u0000-\u001f\u007f\\]/;
const DOT_SEGMENT = /(^|\/)(\.|%2e){2}(\/|$)/i;

export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_ROOT || pathname.startsWith(`${ADMIN_ROOT}/`);
}

function isLoginPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);
}

/**
 * A `next` value is only honoured when it is a same-site path inside /admin — never another origin,
 * never a protocol-relative `//host`, never the login page itself (open-redirect and loop guard).
 */
export function safeAdminNextPath(value: string | null | undefined): string | null {
  if (!value || value.length > MAX_NEXT_LENGTH || UNSAFE_NEXT_CHARS.test(value)) return null;
  const path = value.split(/[?#]/)[0];
  // Dot segments (also percent-encoded — URL parsing treats %2e%2e as "..") could climb out of /admin.
  if (!isAdminPath(path) || isLoginPath(path) || DOT_SEGMENT.test(path)) return null;
  return value;
}

export type AdminAccessDecision = { action: "allow" } | { action: "redirect"; location: string };

export function decideAdminAccess(pathname: string, search: string, hasSessionCookie: boolean): AdminAccessDecision {
  // The login page decides for itself with the real session: a stale cookie must not bounce it back here.
  if (!isAdminPath(pathname) || isLoginPath(pathname) || hasSessionCookie) return { action: "allow" };

  const next = safeAdminNextPath(`${pathname}${search}`);
  const location = next ? `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(next)}` : ADMIN_LOGIN_PATH;
  return { action: "redirect", location };
}
