import { describe, expect, it } from "vitest";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./constants";
import { hashPassword, verifyPassword, violatesPasswordPolicy } from "./password";

describe("password hashing", () => {
  it("stores argon2id (guards the numeric Algorithm constant)", async () => {
    expect(await hashPassword("correct horse battery staple")).toMatch(/^\$argon2id\$v=19\$/);
  });

  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword({ hash, password: "correct horse battery staple" })).toBe(true);
    expect(await verifyPassword({ hash, password: "correct horse battery stapl" })).toBe(false);
  });

  it("salts: the same password never hashes the same way twice", async () => {
    expect(await hashPassword("same password here")).not.toBe(await hashPassword("same password here"));
  });

  it("reads a malformed stored hash as 'wrong password', never as an error", async () => {
    await expect(verifyPassword({ hash: "not-a-hash", password: "x" })).resolves.toBe(false);
    await expect(verifyPassword({ hash: "", password: "x" })).resolves.toBe(false);
  });
});

describe("violatesPasswordPolicy", () => {
  it("accepts exactly the allowed length range", () => {
    expect(violatesPasswordPolicy("a".repeat(MIN_PASSWORD_LENGTH))).toBe(false);
    expect(violatesPasswordPolicy("a".repeat(MAX_PASSWORD_LENGTH))).toBe(false);
  });

  it("rejects too short, too long and non-strings", () => {
    expect(violatesPasswordPolicy("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(true);
    expect(violatesPasswordPolicy("a".repeat(MAX_PASSWORD_LENGTH + 1))).toBe(true);
    for (const value of [undefined, null, 123456789012, {}, ["a".repeat(20)]]) {
      expect(violatesPasswordPolicy(value)).toBe(true);
    }
  });
});
