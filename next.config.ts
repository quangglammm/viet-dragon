import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Exclude public/ from serverless function tracing on Vercel
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
