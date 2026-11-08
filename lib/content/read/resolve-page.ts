import { notFound } from "next/navigation";
import { permanentRedirect } from "@/i18n/navigation";
import type { LocaleCode } from "../schemas";
import { getCatalog } from "./load";
import type { Catalog } from "./types";
import { resolveUrl, type Resolved, type UrlParts } from "./urls";

// The catalog pages' first step: what does this URL name? A canonical URL renders, an old one (a former slug, another language's) is
// answered with a permanent redirect to the canonical, anything else — including an archived product — is a 404.
//
// These routes are dynamic (no `generateStaticParams`): a redirect thrown while a page is generated for the full-route cache is sent
// by Next 16.2 with the `Location` header TWICE on that first response, which clients that join repeated headers (Node's fetch, some
// crawlers) read as «/a, /a» and follow to a 404. A dynamic render sends it once. The data the pages read is cached (tagged, see
// ./cache.ts), so a render is a few milliseconds of work and a publish shows on the next request.

export type FoundPage = Extract<Resolved, { status: "ok" }> & { catalog: Catalog };

/** For `generateMetadata`: the page the URL names, or null when the page itself will redirect or answer 404. */
export async function peekPage(locale: LocaleCode, parts: UrlParts): Promise<FoundPage | null> {
  const catalog = await getCatalog();
  const resolved = resolveUrl(catalog, locale, parts);
  return resolved.status === "ok" ? { ...resolved, catalog } : null;
}

export async function resolvePage(locale: LocaleCode, parts: UrlParts): Promise<FoundPage> {
  const catalog = await getCatalog();
  const resolved = resolveUrl(catalog, locale, parts);
  if (resolved.status === "notFound") notFound();
  if (resolved.status === "redirect") return permanentRedirect({ href: resolved.to, locale });
  return { ...resolved, catalog };
}
