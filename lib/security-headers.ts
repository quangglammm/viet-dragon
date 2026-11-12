// The response headers the app sets itself, as a pure table: next.config.ts returns it from `headers()` and security-headers.test.ts pins it.
// Import-free, because Next loads the config before anything else is up.
//
// Who sets what: Caddy (deploy/Caddyfile) sets Strict-Transport-Security, X-Content-Type-Options and Referrer-Policy on every response and removes
// `Server`; nothing here repeats them, so a header never appears twice. The app sets what depends on the route: framing, browser features,
// the Content-Security-Policy, and "this is not for search engines or caches" on the admin and the API.

export type HeaderRule = { source: string; headers: { key: string; value: string }[] };

export const CSP_REPORT_PATH = "/api/csp-report";

/** The testimonial avatars (Testimonials.tsx) are still picsum.photos placeholders, and picsum answers with a redirect to its CDN: both hosts are loaded. */
export const PLACEHOLDER_AVATAR_HOSTS = ["https://picsum.photos", "https://fastly.picsum.photos"] as const;

/**
 * ENFORCED on every page. These four need no knowledge of what a page loads, so they cannot break one: nobody may frame the site, a `<base>`
 * cannot redirect relative URLs, no plugins, and a form only posts to the site itself.
 */
export const ENFORCED_CSP = ["frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'", "form-action 'self'"].join("; ");

/**
 * REPORT-ONLY: the policy the site is expected to satisfy, observed (not enforced) until a soak in production shows no unexplained report.
 * No `frame-ancestors` here: browsers ignore it in a report-only policy (and warn); ENFORCED_CSP carries it.
 * It has `'unsafe-inline'` for scripts on purpose: Next writes inline scripts into every page (the flight payload), and a nonce or hash
 * would make every page dynamic, which ends the ISR the site is built on (docs/security.md has the full reasoning).
 * Derived from what the production build really loads (the survey is in docs/security.md): no `data:` or `blob:` image, worker or manifest
 * exists anywhere, so none is allowed. The only remote origin is the testimonial avatars.
 */
export const REPORT_ONLY_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' ${PLACEHOLDER_AVATAR_HOSTS.join(" ")}`,
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  `report-uri ${CSP_REPORT_PATH}`,
].join("; ");

// Features the site never uses. Anything an embedded or injected script could ask the visitor's browser for is switched off; autoplay and
// the clipboard stay as they are (the About video starts on a click, and /zalo-reply and the admin copy text).
const DISABLED_FEATURES = [
  "accelerometer",
  "bluetooth",
  "browsing-topics",
  "camera",
  "display-capture",
  "geolocation",
  "gyroscope",
  "hid",
  "magnetometer",
  "microphone",
  "midi",
  "payment",
  "serial",
  "usb",
] as const;

export const PERMISSIONS_POLICY = DISABLED_FEATURES.map((feature) => `${feature}=()`).join(", ");

/**
 * Paths the CSP rule skips, because they are files, not pages, and already send their own policy: `/uploads/*` (a route handler: `default-src 'none';
 * sandbox`) and Next's image optimizer under `/_next/` (`script-src 'none'; frame-src 'none'; sandbox`). A second policy would only replace theirs.
 */
export const CSP_SKIPPED_PREFIXES = ["uploads/", "_next/"] as const;
const DOCUMENTS = `/((?!${CSP_SKIPPED_PREFIXES.join("|")}).*)`;

const NOT_FOR_SEARCH_OR_CACHES = [
  { key: "Cache-Control", value: "no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

export type SecurityHeaderOptions = {
  /** Production builds only: the dev server needs `eval` and a socket for hot reload, so the full policy would only produce noise there. */
  reportOnly: boolean;
};

export function securityHeaders({ reportOnly }: SecurityHeaderOptions): HeaderRule[] {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
      ],
    },
    {
      source: DOCUMENTS,
      headers: [
        { key: "Content-Security-Policy", value: ENFORCED_CSP },
        ...(reportOnly ? [{ key: "Content-Security-Policy-Report-Only", value: REPORT_ONLY_CSP }] : []),
      ],
    },
    { source: "/admin/:path*", headers: NOT_FOR_SEARCH_OR_CACHES },
    { source: "/api/:path*", headers: NOT_FOR_SEARCH_OR_CACHES },
    { source: "/zalo-reply", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
  ];
}
