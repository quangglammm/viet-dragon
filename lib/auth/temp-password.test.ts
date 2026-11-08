import { describe, expect, it } from "vitest";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";
import { generateTempPassword, TEMP_PASSWORD_LENGTH } from "./temp-password";
import { violatesPasswordPolicy } from "./password";

const AMBIGUOUS = /[0OIl1]/;

describe("generateTempPassword", () => {
  it("always satisfies the password policy the server enforces", () => {
    expect(TEMP_PASSWORD_LENGTH).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH);
    expect(TEMP_PASSWORD_LENGTH).toBeLessThanOrEqual(MAX_PASSWORD_LENGTH);
    for (let i = 0; i < 50; i += 1) expect(violatesPasswordPolicy(generateTempPassword())).toBe(false);
  });

  it("uses only characters that cannot be misread (no 0 O 1 l I)", () => {
    for (let i = 0; i < 200; i += 1) {
      const password = generateTempPassword();
      expect(password).toMatch(/^[A-Za-z2-9]+$/);
      expect(password).not.toMatch(AMBIGUOUS);
    }
  });

  it("does not repeat", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateTempPassword()));
    expect(seen.size).toBe(200);
  });

  it("discards biased bytes instead of wrapping them around the alphabet", () => {
    // 255 is above the unbiased limit (228 for a 57-symbol alphabet) and must be skipped, not mapped to a symbol.
    let calls = 0;
    const password = generateTempPassword((length) => {
      calls += 1;
      return calls === 1 ? new Uint8Array(length).fill(255) : new Uint8Array(length).fill(0);
    });
    expect(calls).toBe(2);
    expect(password).toBe("A".repeat(TEMP_PASSWORD_LENGTH));
  });

  it("keeps drawing until it has enough symbols", () => {
    // Every other byte is rejected, so one call yields too few and a second is needed.
    let calls = 0;
    const password = generateTempPassword((length) => {
      calls += 1;
      return Uint8Array.from({ length }, (_, index) => (index % 2 === 0 ? 255 : 1));
    });
    expect(password).toHaveLength(TEMP_PASSWORD_LENGTH);
    expect(calls).toBeGreaterThan(1);
  });
});
