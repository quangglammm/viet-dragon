import { describe, expect, it } from "vitest";
import { cleanPhone, isPhoneNumber, zaloNumber } from "./phone";

describe("isPhoneNumber", () => {
  it.each(["0901448377", "0901 448 377", "090.144.8377", "090-144-8377", "+84901448377", "  0356789012  ", "0812345678", "0789123456", "0587654321"])("takes %s", (value) => {
    expect(isPhoneNumber(value)).toBe(true);
  });

  it.each([
    ["too short", "090144837"],
    ["too long", "09014483777"],
    ["a landline prefix", "0281234567"],
    ["02 is not mobile", "0201234567"],
    ["01 is not mobile", "0101234567"],
    ["a pipe where a digit class char was typed (the old pattern let this through)", "0|01448377"],
    ["84 without the plus", "84901448377"],
    ["letters", "09O1448377"],
    ["empty", ""],
    ["markup", "<script>"],
    ["a second number", "0901448377 0901448378"],
  ])("refuses %s", (_name, value) => {
    expect(isPhoneNumber(value)).toBe(false);
  });
});

describe("cleanPhone / zaloNumber", () => {
  it("strips the separators people type and nothing else", () => {
    expect(cleanPhone(" 090 144.83-77 ")).toBe("0901448377");
    expect(cleanPhone("+84 901 448 377")).toBe("+84901448377");
  });

  it("writes the number the way zalo.me wants it", () => {
    expect(zaloNumber("0901448377")).toBe("84901448377");
    expect(zaloNumber("+84901448377")).toBe("84901448377");
    expect(zaloNumber("84901448377")).toBe("84901448377");
    expect(zaloNumber("901448377")).toBe("84901448377");
  });
});
