import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";
import { ACCOUNT_PATH, ADMIN_LOGIN_PATH, PASSWORD_CHANGE_PATH } from "@/lib/admin-access";
import { getAuth } from "@/lib/auth";
import { getSiteEnv } from "@/lib/env";
import { hasPermission, type Permission } from "@/lib/permissions";

// The Data Access Layer: the ONE place that decides "who is this and may they do that". Every
// admin page and every /api/admin/* handler calls it — proxy.ts and layouts are only convenience
// (a layout does not re-render on client navigation, so it can never be the access check).

/** What the UI may know about the signed-in user — never the session token, password hash or ban fields. */
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
};

async function readSessionUser(requestHeaders: Headers): Promise<SessionUser | null> {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session || session.user.banned) return null;
  const { id, email, name, role, mustChangePassword } = session.user;
  // Unknown is treated as "must change": the safe default for a flag that gates the whole console.
  return { id, email, name, role: role ?? "", mustChangePassword: mustChangePassword !== false };
}

/** Deduplicated per request, so a layout and its page share one database lookup. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => readSessionUser(await headers()));

type RequireUserOptions = {
  permission?: Permission;
  /** Only the forced password-change page sets this. */
  allowPasswordChange?: boolean;
};

/** For Server Components and layouts: returns the user or redirects. */
export async function requireUser({ permission, allowPasswordChange = false }: RequireUserOptions = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(ADMIN_LOGIN_PATH);
  if (user.mustChangePassword && !allowPasswordChange) redirect(PASSWORD_CHANGE_PATH);
  if (permission && !hasPermission(user.role, permission)) redirect(`${ACCOUNT_PATH}?denied=1`);
  return user;
}

// ───────────────────────────── Route Handlers ─────────────────────────────

export type ApiAuth = { ok: true; user: SessionUser } | { ok: false; response: NextResponse };

type RequireApiUserOptions = {
  /** Body type a mutating request must declare. Defaults to JSON. */
  contentType?: "json" | "multipart";
};

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const BODY_TYPES = { json: "application/json", multipart: "multipart/form-data" } as const;

function deny(status: number, code: string, error: string): { ok: false; response: NextResponse } {
  return { ok: false, response: NextResponse.json({ error, code }, { status }) };
}

/**
 * A mutation must come from our own pages. Browsers always send `Origin` on cross-site POSTs, so a
 * missing one (curl, scripts) is refused unless Fetch Metadata says same-origin. SameSite=Strict
 * already keeps the cookie off cross-site requests; this is the second layer.
 */
export function isSameOriginRequest(requestHeaders: Headers, siteOrigin: string): boolean {
  const origin = requestHeaders.get("origin");
  if (origin) return origin === siteOrigin;
  return requestHeaders.get("sec-fetch-site") === "same-origin";
}

export function hasBodyType(contentType: string | null, kind: keyof typeof BODY_TYPES): boolean {
  return (contentType ?? "").toLowerCase().startsWith(BODY_TYPES[kind]);
}

/** For Route Handlers: `const auth = await requireApiUser(request, [...]); if (!auth.ok) return auth.response;` */
export async function requireApiUser(
  request: Request,
  permission?: Permission,
  { contentType = "json" }: RequireApiUserOptions = {},
): Promise<ApiAuth> {
  const isMutation = !SAFE_METHODS.has(request.method);
  if (isMutation && !isSameOriginRequest(request.headers, getSiteEnv().SITE_URL)) {
    return deny(403, "CROSS_ORIGIN", "Forbidden");
  }

  const user = await readSessionUser(request.headers);
  if (!user) return deny(401, "UNAUTHENTICATED", "Unauthorized");
  if (user.mustChangePassword) return deny(403, "PASSWORD_CHANGE_REQUIRED", "Password change required");
  if (permission && !hasPermission(user.role, permission)) return deny(403, "FORBIDDEN", "Forbidden");

  if (isMutation && !hasBodyType(request.headers.get("content-type"), contentType)) {
    return deny(415, "UNSUPPORTED_MEDIA_TYPE", "Unsupported media type");
  }
  return { ok: true, user };
}
