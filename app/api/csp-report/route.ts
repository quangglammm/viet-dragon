import { MAX_CSP_REPORT_BYTES, parseCspReports } from "@/lib/csp-report";
import { getDb } from "@/lib/db";
import { readBodyCapped } from "@/lib/http/body";
import { getLogger } from "@/lib/logger";
import { clientAddress, consumeLimit } from "@/lib/rate-limit";

// Where browsers send what the Report-Only Content-Security-Policy would have blocked (lib/security-headers.ts, `report-uri`). Public by
// necessity: the browser posts it without cookies, for any visitor. So it trusts nothing: it reads at most 16 KB, answers 204 to everything
// (an error would tell a prober what it got right, and browsers ignore the answer), limits each address, and logs a trimmed record
// (lib/csp-report.ts) instead of what was sent.

const log = getLogger("csp");

const REPORT_TYPES = new Set(["application/csp-report", "application/reports+json", "application/json"]);
const LIMIT = { purpose: "csp-report", windowSeconds: 60, max: 30 } as const;

const noContent = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

const mediaTypeOf = (request: Request): string => (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();

async function withinLimit(request: Request): Promise<boolean> {
  try {
    return (await consumeLimit(getDb(), { ...LIMIT, subject: clientAddress(request.headers) })).allowed;
  } catch (error) {
    // A reporting endpoint is not worth refusing for: with the database down the cap on the body is what bounds the work.
    log.error({ err: error }, "csp report limit unavailable: reading the report anyway");
    return true;
  }
}

export async function POST(request: Request) {
  if (!REPORT_TYPES.has(mediaTypeOf(request))) return noContent();
  if (!(await withinLimit(request))) return noContent();

  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(await readBodyCapped(request, MAX_CSP_REPORT_BYTES)));
  } catch {
    // Too large, or not JSON: nothing worth a log line.
    return noContent();
  }

  for (const violation of parseCspReports(body)) log.warn({ csp: violation }, "content security policy violation");
  return noContent();
}
