import type { MetadataRoute } from "next";
import { getBlog, getCatalog, getRevisionDates } from "@/lib/content/read/load";
import { getSiteEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/content/read/seo";
import { sitemapOf } from "@/lib/content/read/sitemap";

// Answered per request so `next build` needs no database; the reads under it are tag-cached, so a request is cheap and a publish shows
// at once (the catalog and blog tags, and the revision dates, are revalidated by it).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, blog, modified] = await Promise.all([getCatalog(), getBlog(), getRevisionDates()]);
  const origin = getSiteEnv().SITE_URL;
  const absolute = (path: string): string => absoluteUrl(origin, path);
  return sitemapOf({ catalog, blog, modified }).map((entry) => ({
    url: absolute(entry.path),
    lastModified: entry.lastModified,
    alternates: { languages: Object.fromEntries(Object.entries(entry.languages).map(([language, path]) => [language, absolute(path)])) },
  }));
}
