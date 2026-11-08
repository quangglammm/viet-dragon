import { describe, expect, it } from "vitest";
import { parseCspReports } from "./csp-report";

const legacy = (report: Record<string, unknown>) => ({ "csp-report": report });
const reporting = (body: Record<string, unknown>, url = "https://vietdragon.vn/") => ({ type: "csp-violation", url, body });

describe("a legacy report (application/csp-report)", () => {
  it("is cut down to the directive, an origin, the page's path and the disposition", () => {
    const [violation] = parseCspReports(
      legacy({
        "document-uri": "https://vietdragon.vn/san-pham/in-an?utm_source=zalo&token=secret#cta",
        "blocked-uri": "https://cdn.evil.example/lib.js?key=abc",
        "effective-directive": "script-src-elem",
        "violated-directive": "script-src-elem",
        disposition: "report",
        "source-file": "https://vietdragon.vn/_next/static/chunks/app.js?v=3",
        "line-number": 42,
        "original-policy": "default-src 'self'; …",
        referrer: "https://google.com/search?q=private",
      }),
    );
    expect(violation).toEqual({ directive: "script-src-elem", blocked: "https://cdn.evil.example", document: "/san-pham/in-an", disposition: "report", source: "https://vietdragon.vn/_next/static/chunks/app.js", line: 42 });
    expect(JSON.stringify(violation)).not.toMatch(/secret|utm_source|key=abc|private|original-policy/);
  });

  it("uses the name of violated-directive when there is no effective one, without its value", () => {
    const [violation] = parseCspReports(legacy({ "document-uri": "https://vietdragon.vn/", "blocked-uri": "inline", "violated-directive": "script-src 'self' 'unsafe-inline'" }));
    expect(violation).toMatchObject({ directive: "script-src", blocked: "inline" });
  });

  it("keeps a keyword as it is, and a data: or blob: URL as its scheme only", () => {
    const blocked = (value: string) => parseCspReports(legacy({ "document-uri": "https://vietdragon.vn/", "blocked-uri": value, "effective-directive": "img-src" }))[0].blocked;
    expect(blocked("inline")).toBe("inline");
    expect(blocked("eval")).toBe("eval");
    expect(blocked("data:image/png;base64,AAAA")).toBe("data");
    expect(blocked("blob:https://vietdragon.vn/1234-5678")).toBe("blob");
    expect(blocked("not a url at all")).toBe("other");
    expect(blocked("")).toBe("other");
  });
});

describe("a Reporting API report (application/reports+json)", () => {
  it("reads every csp-violation of the array and skips other report types", () => {
    const violations = parseCspReports([
      reporting({ documentURL: "https://vietdragon.vn/en/blog?x=1", blockedURL: "https://fonts.googleapis.com/css2?family=X", effectiveDirective: "style-src-elem", disposition: "report" }),
      { type: "deprecation", url: "https://vietdragon.vn/", body: { id: "x" } },
      reporting({ documentURL: "https://vietdragon.vn/", blockedURL: "eval", effectiveDirective: "script-src", disposition: "enforce", sourceFile: "https://vietdragon.vn/a.js", lineNumber: 7 }),
    ]);
    expect(violations).toEqual([
      { directive: "style-src-elem", blocked: "https://fonts.googleapis.com", document: "/en/blog", disposition: "report" },
      { directive: "script-src", blocked: "eval", document: "/", disposition: "enforce", source: "https://vietdragon.vn/a.js", line: 7 },
    ]);
  });

  it("takes at most ten reports from one request", () => {
    const many = Array.from({ length: 50 }, () => reporting({ documentURL: "https://vietdragon.vn/", blockedURL: "inline", effectiveDirective: "script-src" }));
    expect(parseCspReports(many)).toHaveLength(10);
  });

  it("falls back to the report's own url when the body names no document", () => {
    const [violation] = parseCspReports([reporting({ blockedURL: "inline", effectiveDirective: "script-src" }, "https://vietdragon.vn/zalo-reply?a=b")]);
    expect(violation.document).toBe("/zalo-reply");
  });
});

describe("what is left out", () => {
  it("drops anything a browser extension caused: those reports describe the visitor's browser", () => {
    const base = { "document-uri": "https://vietdragon.vn/", "effective-directive": "script-src-elem" };
    expect(parseCspReports(legacy({ ...base, "blocked-uri": "chrome-extension://abcdef/content.js" }))).toEqual([]);
    expect(parseCspReports(legacy({ ...base, "blocked-uri": "inline", "source-file": "moz-extension://abc/inject.js" }))).toEqual([]);
    expect(parseCspReports(legacy({ ...base, "blocked-uri": "safari-web-extension://abc/x.js" }))).toEqual([]);
  });

  it("returns nothing for bodies that are not reports", () => {
    for (const body of [null, undefined, 42, "text", [], {}, [null, 1, "x"], { "csp-report": "no" }, { "csp-report": [] }, [{ type: "csp-violation" }], [{ type: "csp-violation", body: "x" }]]) {
      expect(parseCspReports(body), JSON.stringify(body)).toEqual([]);
    }
  });

  it("refuses a directive that is not a plain directive name, so a sender cannot put text in the log", () => {
    const report = (directive: string) => legacy({ "document-uri": "https://vietdragon.vn/", "blocked-uri": "inline", "effective-directive": directive });
    expect(parseCspReports(report("script-src"))).toHaveLength(1);
    for (const bad of ["", "Script-Src", "script_src", "\u0001bad", "x".repeat(60), "1script", "$(whoami)"]) expect(parseCspReports(report(bad)), bad).toEqual([]);
  });

  it("caps long texts and ignores values of the wrong type", () => {
    const [violation] = parseCspReports(legacy({ "document-uri": `https://vietdragon.vn/${"a".repeat(5000)}`, "blocked-uri": `https://${"b".repeat(5000)}.example/`, "effective-directive": "img-src", "line-number": "12", "source-file": 5 }));
    expect(violation.document.length).toBeLessThanOrEqual(200);
    expect(violation.blocked.length).toBeLessThanOrEqual(120);
    expect(violation.source).toBeUndefined();
    expect(violation.line).toBeUndefined();
  });

  it("reports a line only together with the script it belongs to", () => {
    const [violation] = parseCspReports(legacy({ "document-uri": "https://vietdragon.vn/", "blocked-uri": "inline", "effective-directive": "script-src", "line-number": 9 }));
    expect(violation).not.toHaveProperty("line");
  });

  it("treats a disposition it does not know as a report", () => {
    const [violation] = parseCspReports(legacy({ "document-uri": "https://vietdragon.vn/", "blocked-uri": "inline", "effective-directive": "script-src", disposition: "anything" }));
    expect(violation.disposition).toBe("report");
  });
});
