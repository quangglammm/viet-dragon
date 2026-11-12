import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getSiteEnv } from "@/lib/env";
import { decideRoute } from "@/lib/routes";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * The public site: the URL words of each language (lib/routes.ts) first, then next-intl. An address in the language's own words is served
 * from the internal route (a rewrite: the browser keeps the address it asked for); an old or foreign word is a permanent redirect (308) to
 * the canonical address. Absolute, from SITE_URL.
 */
export default function proxy(request: NextRequest) {
  try {
    const { pathname, search } = request.nextUrl;
    const decision = decideRoute(pathname);
    if (decision.action === "redirect") {
      return NextResponse.redirect(new URL(`${decision.pathname}${search}`, getSiteEnv().SITE_URL), 308);
    }
    if (decision.action === "rewrite") {
      const url = request.nextUrl.clone();
      url.pathname = decision.pathname;
      return intlMiddleware(new NextRequest(url, request));
    }
    return intlMiddleware(request);
  } catch (error) {
    console.error("Proxy error:", error);
    try {
      return intlMiddleware(request);
    } catch {
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: ["/((?!api|zalo-reply|_next|_vercel|.*\\..*).*)"],
};
