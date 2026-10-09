import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Admin routes import lib/content-store.ts, which builds `public/` from
// process.cwd() and scans it. File tracing then bundles the whole directory
// (~290 MB) into every admin function and blows Vercel's 250 MB limit. On
// Vercel `public/` is served from the CDN, so the functions never need it.
const EXCLUDE_PUBLIC_FROM_TRACE = ["./public/**/*"];

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "**/*": EXCLUDE_PUBLIC_FROM_TRACE,
  },
  images: {
    qualities: [30, 75, 85],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default withNextIntl(nextConfig);
