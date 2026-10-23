import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { decideAdminAccess, isAdminPath } from "@/lib/admin-access";
import { COOKIE_PREFIX } from "@/lib/auth/constants";
import { getSiteEnv } from "@/lib/env";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isAdminPath(pathname)) return intlMiddleware(request);

  // Optimistic only: "is there a session cookie?" (no database in the proxy — it also runs on prefetches).
  // Pages and Route Handlers re-check the real session through lib/dal.ts.
  const hasSessionCookie = Boolean(getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX }));
  const decision = decideAdminAccess(pathname, search, hasSessionCookie);
  if (decision.action === "allow") return NextResponse.next();

  // Absolute, and from SITE_URL rather than request.url: Next rejects a relative Location here, and
  // behind Caddy the app itself sees http://, so request.url would downgrade the redirect off https.
  return NextResponse.redirect(new URL(decision.location, getSiteEnv().SITE_URL));
}

export const config = {
  matcher: ["/admin/:path*", "/((?!api|admin|zalo-reply|_next|_vercel|.*\\..*).*)"],
};
