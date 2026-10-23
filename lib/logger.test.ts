import { describe, expect, it } from "vitest";
import { maskPhone } from "./logger";

describe("maskPhone", () => {
  it.each([
    ["0901448377", "0901***377"],
    ["0901 448 377", "0901***377"],
    ["+84 901 448 377", "8490***377"],
  ])("masks %s -> %s", (input, expected) => {
    expect(maskPhone(input)).toBe(expected);
  });

  it.each(["", "123", "1234567", "abc"])("hides a short or non-numeric value entirely (%j)", (input) => {
    expect(maskPhone(input)).toBe("***");
  });

  it("never lets the middle digits through", () => {
    expect(maskPhone("0912345678")).not.toContain("23456");
  });
});
