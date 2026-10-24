import type { MetadataRoute } from "next";
import { getSiteEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/zalo-reply"] }],
    sitemap: `${getSiteEnv().SITE_URL}/sitemap.xml`,
  };
}
