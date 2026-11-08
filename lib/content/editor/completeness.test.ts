import { describe, expect, it } from "vitest";
import { completeness, percentOf } from "./completeness";

describe("completeness", () => {
  it("counts the texts vi or en have that each language also has", () => {
    const result = completeness({
      i18n: { vi: { title: "a", description: "b" }, en: { title: "c" }, zh: { title: "d" } },
    });
    expect(result.vi).toEqual({ filled: 2, expected: 2 });
    expect(result.en).toEqual({ filled: 1, expected: 2 }); // English lacks the description Vietnamese has
    expect(result.zh).toEqual({ filled: 1, expected: 2 });
    expect(result.ja).toEqual({ filled: 0, expected: 2 });
  });

  it("walks the children too, and handles texts that are the language value itself", () => {
    const result = completeness({
      i18n: { vi: { title: "a" }, en: { title: "b" } },
      shapes: [{ i18n: { vi: { name: "x" }, en: { name: "y" }, ko: { name: "z" } } }],
      options: [{ bullets: [{ i18n: { vi: "đ", en: "d", zh: "z" } }, { i18n: { vi: "e" } }] }],
    });
    // Four texts in all: the title, the shape's name and one per bullet.
    expect(result.ko).toEqual({ filled: 1, expected: 4 }); // only the shape's name
    expect(result.zh).toEqual({ filled: 1, expected: 4 }); // only the first bullet
    expect(result.vi).toEqual({ filled: 4, expected: 4 });
  });

  it("counts blank text as missing", () => {
    expect(completeness({ i18n: { vi: { title: "a" }, en: { title: "  " } } }).en).toEqual({ filled: 0, expected: 1 });
  });

  it("measures a site message's trees leaf by leaf, lists included", () => {
    const result = completeness({ data: { vi: { hero: { title: "a", items: ["x", "y"] } }, en: { hero: { title: "b", items: ["p", "q"] } }, zh: { hero: { title: "c", items: ["r"] } } } });
    expect(result.zh).toEqual({ filled: 2, expected: 3 }); // the title and the first list item
    expect(result.en).toEqual({ filled: 3, expected: 3 });
  });

  it("is empty-safe: nothing to translate is complete", () => {
    const result = completeness({ icon: "Gem" });
    expect(result.zh).toEqual({ filled: 0, expected: 0 });
    expect(percentOf(result.zh)).toBe(100);
    expect(percentOf({ filled: 1, expected: 3 })).toBe(33);
  });

  it("does not mistake other objects for language maps", () => {
    expect(completeness({ prices: { base: 1 }, i18n: { notALanguage: { a: "b" } } }).vi).toEqual({ filled: 0, expected: 0 });
  });
});
