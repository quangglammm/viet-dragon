// What a browser sends when a page breaks a Content-Security-Policy, reduced to what is worth a log line. The endpoint that receives it is public
// (anyone can POST anything), so nothing from the body is logged as it came: URLs shrink to an origin, the page to its path, every text is capped,
// and what the browser's own extensions cause is left out. Pure: app/api/csp-report/route.ts reads the body and calls this.

export const MAX_CSP_REPORT_BYTES = 16 * 1024;
/** A single page can break the policy a dozen times; a request that carries more is a script. */
const MAX_REPORTS_PER_REQUEST = 10;
const MAX_FIELD_LENGTH = 120;
const MAX_PATH_LENGTH = 200;

/** `blocked-uri` values that name a kind of thing, not a URL (CSP level 2/3). */
const KEYWORDS = new Set(["inline", "eval", "wasm-eval", "trusted-types-policy", "trusted-types-sink", "self", "data", "blob", "mediastream", "filesystem"]);
const EXTENSION_SCHEMES = new Set(["chrome-extension:", "moz-extension:", "safari-extension:", "safari-web-extension:", "ms-browser-extension:", "webkit-masked-url:"]);
const DIRECTIVE = /^[a-z][a-z-]{0,39}$/;

export interface CspViolation {
  /** The directive that was broken, e.g. `script-src-elem`. */
  directive: string;
  /** An origin (`https://cdn.example`), a keyword (`inline`, `eval`), a scheme for `data:` / `blob:`, or `other`. */
  blocked: string;
  /** The path of the page, never its query string or fragment. */
  document: string;
  /** `report` for a Report-Only policy, `enforce` for an enforced one. */
  disposition: string;
  /** Origin and path of the script that did it, when the browser says, and the line. */
  source?: string;
  line?: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max = MAX_FIELD_LENGTH): string => (typeof value === "string" ? value.slice(0, max) : "");

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** True when a URL belongs to a browser extension: those reports describe the visitor's browser, not our site. */
const isExtension = (value: string): boolean => {
  const url = parseUrl(value);
  return url !== null && EXTENSION_SCHEMES.has(url.protocol);
};

function blockedOf(value: string): string {
  if (KEYWORDS.has(value)) return value;
  const url = parseUrl(value);
  if (!url) return "other";
  // `data:` and `blob:` have no useful origin and `data:` carries the whole payload.
  if (url.protocol === "data:" || url.protocol === "blob:") return url.protocol.slice(0, -1);
  return url.origin === "null" ? "other" : url.origin.slice(0, MAX_FIELD_LENGTH);
}

function pathOf(value: string): string {
  const url = parseUrl(value);
  return url ? url.pathname.slice(0, MAX_PATH_LENGTH) : "";
}

function sourceOf(value: string): string | undefined {
  const url = parseUrl(value);
  return url && url.origin !== "null" ? `${url.origin}${url.pathname}`.slice(0, MAX_PATH_LENGTH) : undefined;
}

/** The fields of a report in either wire format, under one set of names. */
interface RawViolation {
  directive: unknown;
  blocked: unknown;
  document: unknown;
  disposition: unknown;
  source: unknown;
  line: unknown;
}

function fromLegacy(body: Record<string, unknown>): RawViolation | null {
  const report = body["csp-report"];
  if (!isRecord(report)) return null;
  return {
    directive: report["effective-directive"] ?? report["violated-directive"],
    blocked: report["blocked-uri"],
    document: report["document-uri"],
    disposition: report.disposition,
    source: report["source-file"],
    line: report["line-number"],
  };
}

function fromReportingApi(entry: unknown): RawViolation | null {
  if (!isRecord(entry) || entry.type !== "csp-violation" || !isRecord(entry.body)) return null;
  const { body } = entry;
  return {
    directive: body.effectiveDirective ?? body.violatedDirective,
    blocked: body.blockedURL,
    document: body.documentURL ?? entry.url,
    disposition: body.disposition,
    source: body.sourceFile,
    line: body.lineNumber,
  };
}

function tidy(raw: RawViolation): CspViolation | null {
  // `violated-directive` may come with its value (`script-src 'self'`): the name is what is needed.
  const directive = text(raw.directive).split(" ")[0];
  const blockedText = text(raw.blocked, 2000);
  const sourceText = text(raw.source, 2000);
  if (!DIRECTIVE.test(directive) || isExtension(blockedText) || isExtension(sourceText)) return null;

  const source = sourceOf(sourceText);
  const line = typeof raw.line === "number" && Number.isInteger(raw.line) && raw.line >= 0 ? raw.line : undefined;
  return {
    directive,
    blocked: blockedOf(blockedText),
    document: pathOf(text(raw.document, 2000)),
    disposition: raw.disposition === "enforce" ? "enforce" : "report",
    ...(source ? { source } : {}),
    ...(source && line !== undefined ? { line } : {}),
  };
}

/**
 * The violations in a request body, trimmed. Accepts the legacy `{"csp-report": {…}}` object (`application/csp-report`) and the Reporting API's
 * array of `{type: "csp-violation", body: {…}}` (`application/reports+json`). Anything else, and anything from an extension, yields nothing.
 */
export function parseCspReports(body: unknown): CspViolation[] {
  const entries: (RawViolation | null)[] = Array.isArray(body) ? body.slice(0, MAX_REPORTS_PER_REQUEST).map(fromReportingApi) : isRecord(body) ? [fromLegacy(body)] : [];
  return entries.flatMap((raw) => {
    const violation = raw ? tidy(raw) : null;
    return violation ? [violation] : [];
  });
}
