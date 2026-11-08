import { randomUUID } from "node:crypto";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "./lib/security-headers";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// The data cache (`.next/cache`, a volume in compose.yaml and a folder in dev) outlives a deploy, but a cached content read holds what
// THIS build computed: view models and the defaults of messages/*.json. A new id per build is inlined into the server bundle and joins
// every cache key (lib/content/read/cache.ts), so a build never reads the previous build's entries. A publish still expires by tag.
const CONTENT_CACHE_BUILD = randomUUID();

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (.next/standalone). It does not copy
  // `public/` or `.next/static` — the Dockerfile's runner stage does.
  output: "standalone",
  env: { CONTENT_CACHE_BUILD },
  // Next would announce itself in `X-Powered-By`; the other security headers are lib/security-headers.ts (Caddy adds the rest).
  poweredByHeader: false,
  headers: async () => securityHeaders({ reportOnly: process.env.NODE_ENV === "production" }),
  images: {
    qualities: [30, 75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default withNextIntl(nextConfig);
