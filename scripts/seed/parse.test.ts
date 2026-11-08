import { describe, expect, it } from "vitest";
import { parseDimensionsCm, parsePrice } from "./parse";
import { bump, majority, slugify, uniqueSlug } from "./util";

describe("parsePrice", () => {
  it.each([
    ["Chỉ từ 120.000đ/Hộp", { amount: 120000, unit: "Hộp" }],
    ["From 120,000đ/Box", { amount: 120000, unit: "Box" }],
    ["120,000₫/箱〜", { amount: 120000, unit: "箱" }],
    ["최저 850₫/장", { amount: 850, unit: "장" }],
  ])("reads %s", (text, expected) => {
    expect(parsePrice(text)).toEqual(expected);
  });
  it("returns null without a price", () => {
    expect(parsePrice("Liên hệ")).toBeNull();
  });
});

describe("parseDimensionsCm", () => {
  it("converts centimetres to whole millimetres", () => {
    expect(parseDimensionsCm("21 x 29.7 cm")).toEqual({ w: 210, h: 297, d: null });
    expect(parseDimensionsCm("10 x 5 x 3 cm")).toEqual({ w: 100, h: 50, d: 30 });
  });
  it("is null for non-metric sizes and reports sub-millimetre values", () => {
    expect(parseDimensionsCm("Size L - XL")).toBeNull();
    const seen: string[] = [];
    parseDimensionsCm("5.55 x 9 cm", (text) => seen.push(text));
    expect(seen).toEqual(["5.55 x 9 cm"]);
  });
});

describe("util", () => {
  it("slugifies Vietnamese", () => {
    expect(slugify("Giấy loại C")).toBe("giay-loai-c");
    expect(slugify("Đóng gói / Hộp")).toBe("dong-goi-hop");
    expect(slugify("???")).toBe("x");
  });
  it("makes slugs unique", () => {
    const taken = new Set<string>();
    expect([uniqueSlug("a", taken), uniqueSlug("a", taken), uniqueSlug("a", taken)]).toEqual(["a", "a-2", "a-3"]);
  });
  it("picks the most frequent, the first on a tie", () => {
    const counts = new Map<string, number>();
    for (const key of ["x", "y", "y", "x", "z"]) bump(counts, key);
    expect(majority(counts)).toEqual({ value: "x", distinct: 3 });
  });
});
