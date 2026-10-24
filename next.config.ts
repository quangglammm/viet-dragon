import { randomUUID } from "node:crypto";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Admin routes import lib/content-store.ts, which builds `public/` from
// process.cwd() and scans it. File tracing then bundles the whole directory
// (~290 MB) into every admin function and blows Vercel's 250 MB limit. On
// Vercel `public/` is served from the CDN, so the functions never need it.
const EXCLUDE_PUBLIC_FROM_TRACE = ["./public/**/*"];

// The data cache (`.next/cache`, a volume in compose.yaml and a folder in dev) outlives a deploy, but a cached content read holds what
// THIS build computed: view models and the defaults of messages/*.json. A new id per build is inlined into the server bundle and joins
// every cache key (lib/content/read/cache.ts), so a build never reads the previous build's entries. A publish still expires by tag.
const CONTENT_CACHE_BUILD = randomUUID();

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (.next/standalone). It does not copy
  // `public/` or `.next/static` — the Dockerfile's runner stage does.
  output: "standalone",
  outputFileTracingExcludes: {
    "**/*": EXCLUDE_PUBLIC_FROM_TRACE,
  },
  env: { CONTENT_CACHE_BUILD },
  images: {
    qualities: [30, 75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default withNextIntl(nextConfig);
