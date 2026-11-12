import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type RouteLocale = (typeof routing.locales)[number];

/**
 * The language a `[locale]` route segment names, or a 404. `proxy.ts` leaves a path with a file extension alone (so static files are not
 * rewritten), which means `/wp-login.php` or `/nope.png` arrive at the pages with the whole name as the «locale»; a page that indexed the
 * catalog by it would throw. The layout checks too, but it renders alongside the page, so the page must not rely on that.
 */
export function localeOf(segment: string): RouteLocale {
  if (!hasLocale(routing.locales, segment)) notFound();
  return segment;
}
