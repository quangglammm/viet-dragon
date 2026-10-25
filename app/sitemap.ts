import type { MetadataRoute } from "next";
import { getPublishedBlog, getPublishedCatalog, getRevisionDates } from "@/lib/content/read/load";
import { getSiteEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/content/read/seo";
import { sitemapOf } from "@/lib/content/read/sitemap";

// Answered per request so `next build` needs no database; the reads under it are tag-cached, so a request is cheap and a publish shows
// at once (the catalog and blog tags, and the revision dates, are revalidated by it). The published reads, not the pages' own: an editor in
// Draft Mode who fetches this must not see the URLs of unpublished drafts in it.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, blog, modified] = await Promise.all([getPublishedCatalog(), getPublishedBlog(), getRevisionDates()]);
  const origin = getSiteEnv().SITE_URL;
  const absolute = (path: string): string => absoluteUrl(origin, path);
  return sitemapOf({ catalog, blog, modified }).map((entry) => ({
    url: absolute(entry.path),
    lastModified: entry.lastModified,
    alternates: { languages: Object.fromEntries(Object.entries(entry.languages).map(([language, path]) => [language, absolute(path)])) },
  }));
}
