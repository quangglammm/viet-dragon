import type { MetadataRoute } from "next";

// No `sitemap` entry yet — it is added with the database-backed sitemap (Phase 4),
// so crawlers are never pointed at a URL that 404s.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/zalo-reply"] }],
  };
}
