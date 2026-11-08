import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { decideAdminAccess, isAdminPath } from "@/lib/admin-access";
import { COOKIE_PREFIX } from "@/lib/auth/constants";
import { getSiteEnv } from "@/lib/env";
import { decideRoute } from "@/lib/routes";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isAdminPath(pathname)) return routePublic(request);

  // Optimistic only: "is there a session cookie?" (no database in the proxy — it also runs on prefetches).
  // Pages and Route Handlers re-check the real session through lib/dal.ts.
  const hasSessionCookie = Boolean(getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX }));
  const decision = decideAdminAccess(pathname, search, hasSessionCookie);
  if (decision.action === "allow") return NextResponse.next();

  // Absolute, and from SITE_URL rather than request.url: Next rejects a relative Location here, and
  // behind Caddy the app itself sees http://, so request.url would downgrade the redirect off https.
  return NextResponse.redirect(new URL(decision.location, getSiteEnv().SITE_URL));
}

/**
 * The public site: the URL words of each language (lib/routes.ts) first, then next-intl. An address in the language's own words is served
 * from the internal route (a rewrite: the browser keeps the address it asked for); an old or foreign word is a permanent redirect (308) to
 * the canonical address. Absolute, from SITE_URL, for the reason given below for the admin.
 */
function routePublic(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decision = decideRoute(pathname);
  if (decision.action === "redirect") return NextResponse.redirect(new URL(`${decision.pathname}${search}`, getSiteEnv().SITE_URL), 308);
  if (decision.action === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = decision.pathname;
    return intlMiddleware(new NextRequest(url, request));
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/admin/:path*", "/((?!api|admin|zalo-reply|_next|_vercel|.*\\..*).*)"],
};
