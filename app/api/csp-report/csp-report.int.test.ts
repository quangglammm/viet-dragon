import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const log = vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock("@/lib/logger", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/logger")>()), getLogger: () => log }));
vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/rate-limit")>();
  return { ...original, consumeLimit: vi.fn(original.consumeLimit) };
});

import * as route from "@/app/api/csp-report/route";
import { MAX_CSP_REPORT_BYTES } from "@/lib/csp-report";
import { getPool } from "@/lib/db";
import { consumeLimit } from "@/lib/rate-limit";
import { uniqueIp } from "@/tests/helpers/auth";

// The report endpoint end to end: real counters in Postgres, the logger replaced by a spy. It is public, so what matters is that it answers 204
// to everything, logs only the trimmed record, and cannot be made to log or work without bound.

const LEGACY = "application/csp-report";
const REPORTING = "application/reports+json";

const violation = (extra: Record<string, unknown> = {}) => ({
  "csp-report": { "document-uri": "https://vietdragon.vn/san-pham?session=SECRET#x", "blocked-uri": "https://cdn.example/a.js?k=SECRET", "effective-directive": "script-src-elem", disposition: "report", ...extra },
});

function send(body: unknown, { type = LEGACY, ip = uniqueIp(), raw }: { type?: string | null; ip?: string; raw?: BodyInit } = {}): Promise<Response> {
  const headers: Record<string, string> = { "x-real-ip": ip };
  if (type) headers["content-type"] = type;
  return route.POST(new Request("http://localhost:3000/api/csp-report", { method: "POST", headers, body: raw ?? JSON.stringify(body) }));
}

beforeEach(() => {
  log.warn.mockClear();
  log.error.mockClear();
  vi.mocked(consumeLimit).mockClear();
});
afterAll(async () => {
  await getPool().query("delete from rate_limit where key like 'vd:csp-report:%'");
  await getPool().end();
});

describe("a violation", () => {
  it("answers 204 with no body and logs the trimmed record, not what was sent", async () => {
    const response = await send(violation());
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(log.warn).toHaveBeenCalledTimes(1);
    const [fields] = log.warn.mock.calls[0];
    expect(fields).toEqual({ csp: { directive: "script-src-elem", blocked: "https://cdn.example", document: "/san-pham", disposition: "report" } });
    expect(JSON.stringify(log.warn.mock.calls)).not.toContain("SECRET");
  });

  it("takes the Reporting API form too, and application/json", async () => {
    const body = [{ type: "csp-violation", url: "https://vietdragon.vn/", body: { documentURL: "https://vietdragon.vn/en", blockedURL: "inline", effectiveDirective: "script-src" } }];
    expect((await send(body, { type: REPORTING })).status).toBe(204);
    expect((await send(body, { type: "application/json; charset=utf-8" })).status).toBe(204);
    expect(log.warn).toHaveBeenCalledTimes(2);
  });

  it("logs nothing for what a browser extension caused", async () => {
    expect((await send(violation({ "blocked-uri": "chrome-extension://abc/x.js" }))).status).toBe(204);
    expect(log.warn).not.toHaveBeenCalled();
  });
});

describe("what is not a report", () => {
  it("still answers 204, logs nothing, and does no database work for a content type it does not read", async () => {
    for (const type of ["text/plain", "multipart/form-data", "text/html", null]) {
      const response = await send(violation(), { type });
      expect(response.status, String(type)).toBe(204);
    }
    expect(log.warn).not.toHaveBeenCalled();
    expect(consumeLimit).not.toHaveBeenCalled();
  });

  it("survives broken JSON and bodies of the wrong shape", async () => {
    for (const raw of ["{not json", "", "null", "[1,2,3]", '"text"', "{}"]) expect((await send(null, { raw })).status, raw).toBe(204);
    expect(log.warn).not.toHaveBeenCalled();
    expect(log.error).not.toHaveBeenCalled();
  });

  it("stops reading a body past 16 KB, whether or not it says how long it is", async () => {
    const big = JSON.stringify(violation({ padding: "x".repeat(MAX_CSP_REPORT_BYTES) }));
    expect((await send(null, { raw: big })).status).toBe(204);
    const chunks = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let sent = 0; sent < MAX_CSP_REPORT_BYTES * 4; sent += 4096) controller.enqueue(new TextEncoder().encode(" ".repeat(4096)));
        controller.close();
      },
    });
    const streamed = await route.POST(new Request("http://localhost:3000/api/csp-report", { method: "POST", headers: { "content-type": LEGACY, "x-real-ip": uniqueIp() }, body: chunks, duplex: "half" } as RequestInit));
    expect(streamed.status).toBe(204);
    expect(log.warn).not.toHaveBeenCalled();
  });

  it("offers no other method", () => {
    expect(Object.keys(route).filter((name) => /^(GET|PUT|PATCH|DELETE|HEAD)$/.test(name))).toEqual([]);
  });
});

describe("limits", () => {
  it("logs the first 30 reports of an address in a minute and answers 204 to the rest without logging them", async () => {
    const ip = uniqueIp();
    for (let n = 0; n < 35; n++) expect((await send(violation(), { ip })).status).toBe(204);
    expect(log.warn).toHaveBeenCalledTimes(30);
    // Someone else is not held back by it.
    expect((await send(violation())).status).toBe(204);
    expect(log.warn).toHaveBeenCalledTimes(31);
  });

  it("reads the report anyway when the limiter cannot be asked, and says so", async () => {
    vi.mocked(consumeLimit).mockRejectedValueOnce(new Error("connection refused"));
    expect((await send(violation())).status).toBe(204);
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(log.warn).toHaveBeenCalledTimes(1);
  });
});
