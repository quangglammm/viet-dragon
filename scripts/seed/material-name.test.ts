import { describe, expect, it } from "vitest";
import { formatMaterialDisplayName } from "./material-name";

describe("formatMaterialDisplayName (seed copy)", () => {
  it.each([
    ["Couche", "vi", "Giấy loại C"],
    ["C300 (chuẩn)", "vi", "Giấy loại C"],
    ["Ford 300gsm", "vi", "Giấy loại F"],
    ["Ivory 300", "vi", "Giấy loại I"],
    ["Couche corrugated", "en", "Type C Paper corrugated"],
    ["Kraft", "vi", "Kraft"],
  ] as const)("rewrites %s (%s) to %s", (name, locale, expected) => {
    expect(formatMaterialDisplayName(name, locale)).toBe(expected);
  });
});
