import { describe, expect, it } from "vitest";
import { CSP_REPORT_PATH, CSP_SKIPPED_PREFIXES, ENFORCED_CSP, PERMISSIONS_POLICY, PLACEHOLDER_AVATAR_HOSTS, REPORT_ONLY_CSP, securityHeaders, type HeaderRule } from "./security-headers";

const keysOf = (rule: HeaderRule) => rule.headers.map((header) => header.key);
const ruleFor = (rules: HeaderRule[], source: string): HeaderRule => {
  const rule = rules.find((candidate) => candidate.source === source);
  if (!rule) throw new Error(`no rule for ${source}`);
  return rule;
};
const DOCUMENTS = "/((?!uploads/|_next/).*)";
const valueOf = (rule: HeaderRule, key: string) => rule.headers.find((header) => header.key === key)?.value;

describe("the header table", () => {
  const production = securityHeaders({ reportOnly: true });
  const development = securityHeaders({ reportOnly: false });

  it("denies framing and browser features on every page", () => {
    const all = ruleFor(production, "/:path*");
    expect(valueOf(all, "X-Frame-Options")).toBe("DENY");
    expect(valueOf(all, "Permissions-Policy")).toBe(PERMISSIONS_POLICY);
    for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"]) expect(PERMISSIONS_POLICY).toContain(`${feature}=()`);
  });

  it("leaves autoplay and the clipboard alone: the About video loops and the admin copies text", () => {
    expect(PERMISSIONS_POLICY).not.toMatch(/autoplay|clipboard|fullscreen/);
  });

  it("enforces only the four directives that cannot break a page", () => {
    const directives = ENFORCED_CSP.split("; ").map((directive) => directive.split(" ")[0]);
    expect(directives).toEqual(["frame-ancestors", "base-uri", "object-src", "form-action"]);
    expect(ENFORCED_CSP).not.toContain("unsafe-");
    expect(ENFORCED_CSP).toContain("frame-ancestors 'none'");
  });

  it("observes the full policy in production, and says where to report", () => {
    const rule = ruleFor(production, DOCUMENTS);
    expect(keysOf(rule)).toEqual(["Content-Security-Policy", "Content-Security-Policy-Report-Only"]);
    expect(valueOf(rule, "Content-Security-Policy-Report-Only")).toBe(REPORT_ONLY_CSP);
    expect(REPORT_ONLY_CSP).toContain(`report-uri ${CSP_REPORT_PATH}`);
    for (const directive of ["default-src 'self'", "object-src 'none'", "frame-src 'none'", "base-uri 'self'", "form-action 'self'"]) expect(REPORT_ONLY_CSP).toContain(directive);
  });

  it("leaves frame-ancestors out of the report-only policy, where browsers ignore it", () => {
    expect(REPORT_ONLY_CSP).not.toContain("frame-ancestors");
  });

  it("has no report-only policy outside production, where the dev server would only make noise", () => {
    expect(keysOf(ruleFor(development, DOCUMENTS))).toEqual(["Content-Security-Policy"]);
  });

  it("allows the site itself and the placeholder avatar hosts, nothing else", () => {
    const hosts = REPORT_ONLY_CSP.match(/https?:\/\/[^\s;]+/g) ?? [];
    expect(hosts).toEqual([...PLACEHOLDER_AVATAR_HOSTS]);
    expect(REPORT_ONLY_CSP).not.toMatch(/\*|unsafe-eval|data:|blob:/);
  });

  it("allows 'unsafe-inline' for scripts and styles only, because Next writes inline scripts and Motion inline styles", () => {
    const withInline = REPORT_ONLY_CSP.split("; ").filter((directive) => directive.includes("'unsafe-inline'")).map((directive) => directive.split(" ")[0]);
    expect(withInline).toEqual(["script-src", "style-src"]);
  });

  it("keeps CSP away from files that send their own policy: /uploads and Next's image optimizer", () => {
    expect([...CSP_SKIPPED_PREFIXES]).toEqual(["uploads/", "_next/"]);
    const rule = ruleFor(production, DOCUMENTS);
    // The source is a plain regular expression group, so the test can use it as one.
    const matches = (path: string) => new RegExp(`^${rule.source}$`).test(path);
    for (const path of ["/uploads/2026/05/cover-ab12cd34.webp", "/_next/image", "/_next/static/chunks/app.js"]) expect(matches(path), path).toBe(false);
    for (const path of ["/", "/en", "/san-pham", "/en/products/x/y", "/admin/login", "/api/consult", "/zalo-reply", "/uploads-are-not-this", "/robots.txt"]) expect(matches(path), path).toBe(true);
  });

  it("marks the admin and the API as neither cacheable nor indexable", () => {
    for (const source of ["/admin/:path*", "/api/:path*"]) {
      const rule = ruleFor(production, source);
      expect(valueOf(rule, "Cache-Control")).toBe("no-store");
      expect(valueOf(rule, "X-Robots-Tag")).toBe("noindex, nofollow");
    }
    expect(valueOf(ruleFor(production, "/zalo-reply"), "X-Robots-Tag")).toBe("noindex");
  });

  it("does not touch the cache headers of public pages or uploads", () => {
    const withCacheControl = production.filter((rule) => keysOf(rule).includes("Cache-Control")).map((rule) => rule.source);
    expect(withCacheControl).toEqual(["/admin/:path*", "/api/:path*"]);
  });

  it("leaves to Caddy what Caddy sets, so none of it appears twice", () => {
    const all = production.flatMap(keysOf).map((key) => key.toLowerCase());
    for (const owned of ["strict-transport-security", "x-content-type-options", "referrer-policy", "server"]) expect(all).not.toContain(owned);
  });

  it("never sets one header twice in the same rule", () => {
    for (const rule of production) expect(new Set(keysOf(rule)).size).toBe(rule.headers.length);
  });
});
