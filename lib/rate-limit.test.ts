import { describe, expect, it } from "vitest";
import { digest, limitKey, retryAfterSeconds } from "./rate-limit";

describe("limitKey", () => {
  it("namespaces every key, so none can meet Better Auth's own", () => {
    expect(limitKey("consult-ip", "203.0.113.9")).toBe("vd:consult-ip:203.0.113.9");
    expect(limitKey("x", "a|/sign-in/email").startsWith("vd:")).toBe(true);
  });

  it("cuts a subject that is absurdly long", () => {
    expect(limitKey("p", "a".repeat(500)).length).toBe("vd:p:".length + 100);
  });
});

describe("digest", () => {
  it("is stable, fixed-length and does not contain the value", () => {
    expect(digest("0901448377")).toBe(digest("0901448377"));
    expect(digest("0901448377")).toHaveLength(24);
    expect(digest("0901448377")).not.toContain("0901448377");
    expect(digest("0901448377")).not.toBe(digest("0901448378"));
  });
});

describe("retryAfterSeconds", () => {
  const WINDOW = 600_000;
  it("rounds up to whole seconds", () => {
    expect(retryAfterSeconds(1_000_000, WINDOW, 1_000_000)).toBe(600);
    expect(retryAfterSeconds(1_000_000, WINDOW, 1_000_001)).toBe(600);
    expect(retryAfterSeconds(1_000_000, WINDOW, 1_599_000)).toBe(1);
  });

  it("is never less than one second, even at or past the end of the window", () => {
    expect(retryAfterSeconds(1_000_000, WINDOW, 1_600_000)).toBe(1);
    expect(retryAfterSeconds(1_000_000, WINDOW, 9_000_000)).toBe(1);
  });
});
