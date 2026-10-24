import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatMaterialDisplayName } from "./material-name";

const functionText = (source: string): string => {
  const start = source.indexOf("function formatMaterialDisplayName(");
  return source.slice(start, source.indexOf("\n}\n", start) + 3);
};

describe("formatMaterialDisplayName (seed copy)", () => {
  it("is textually identical to the private original in the product card", () => {
    const original = functionText(readFileSync("components/ui/material-flashcard.tsx", "utf8"));
    const copy = functionText(readFileSync("scripts/seed/material-name.ts", "utf8"));
    expect(original.length).toBeGreaterThan(500);
    expect(copy).toBe(original);
  });

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
