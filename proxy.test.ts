import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { getSiteEnv } from "./lib/env";
import proxy from "./proxy";

const origin = () => getSiteEnv().SITE_URL;
const request = (path: string) => new NextRequest(`${origin()}${path}`);

describe("proxy public routing", () => {
  it("hands standard localized paths to next-intl", async () => {
    const response = await proxy(request("/en/products"));
    expect(response.status).toBeLessThan(400);
  });

  it("rewrites or redirects language-specific aliases", async () => {
    const response = await proxy(request("/en/san-pham"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`${origin()}/en/products`);
  });
});
