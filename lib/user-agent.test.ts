import { describe, expect, it } from "vitest";
import { describeUserAgent } from "./user-agent";

describe("describeUserAgent", () => {
  it.each([
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Chrome trên macOS",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
      "Edge trên Windows",
    ],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0", "Firefox trên Windows"],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      "Safari trên iOS",
    ],
    [
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
      "Chrome trên Android",
    ],
  ])("reads %#", (userAgent, expected) => {
    expect(describeUserAgent(userAgent)).toBe(expected);
  });

  it("falls back for missing or unrecognisable agents", () => {
    expect(describeUserAgent(null)).toBe("Thiết bị không xác định");
    expect(describeUserAgent("")).toBe("Thiết bị không xác định");
    expect(describeUserAgent("curl/8.7.1")).toBe("Thiết bị không xác định");
  });
});
