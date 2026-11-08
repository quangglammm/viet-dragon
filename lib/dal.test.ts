import { describe, expect, it } from "vitest";
import { hasBodyType, isSameOriginRequest } from "./dal";

const SITE = "https://vietdragon.vn";
const headersOf = (init: Record<string, string>) => new Headers(init);

describe("isSameOriginRequest (CSRF second layer)", () => {
  it("accepts the site's own Origin", () => {
    expect(isSameOriginRequest(headersOf({ origin: SITE }), SITE)).toBe(true);
  });

  it.each([
    "https://evil.example",
    "http://vietdragon.vn", // scheme downgrade
    "https://vietdragon.vn.evil.example", // suffix trick
    "https://sub.vietdragon.vn",
    "https://vietdragon.vn:8443",
    "null",
  ])("rejects Origin %s", (origin) => {
    expect(isSameOriginRequest(headersOf({ origin }), SITE)).toBe(false);
  });

  it("without Origin, falls back to Fetch Metadata: only same-origin passes", () => {
    expect(isSameOriginRequest(headersOf({ "sec-fetch-site": "same-origin" }), SITE)).toBe(true);
    for (const site of ["cross-site", "same-site", "none"]) {
      expect(isSameOriginRequest(headersOf({ "sec-fetch-site": site }), SITE)).toBe(false);
    }
  });

  it("refuses a request that carries neither header (curl, scripts)", () => {
    expect(isSameOriginRequest(headersOf({}), SITE)).toBe(false);
  });

  it("trusts Origin over Fetch Metadata when both are present", () => {
    expect(isSameOriginRequest(headersOf({ origin: "https://evil.example", "sec-fetch-site": "same-origin" }), SITE)).toBe(false);
  });
});

describe("hasBodyType", () => {
  it("matches the declared kind, ignoring case and parameters", () => {
    expect(hasBodyType("application/json", "json")).toBe(true);
    expect(hasBodyType("Application/JSON; charset=utf-8", "json")).toBe(true);
    expect(hasBodyType("multipart/form-data; boundary=x", "multipart")).toBe(true);
  });

  it.each([null, "", "text/plain", "application/x-www-form-urlencoded", "multipart/form-data"])(
    "rejects %j as json",
    (value) => {
      expect(hasBodyType(value, "json")).toBe(false);
    },
  );

  it("does not accept one kind for the other", () => {
    expect(hasBodyType("application/json", "multipart")).toBe(false);
    expect(hasBodyType("multipart/form-data; boundary=x", "json")).toBe(false);
  });
});
