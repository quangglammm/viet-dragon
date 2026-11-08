import { describe, expect, it } from "vitest";
import { finishedSlug, followNames, placeholderSlug, suggestSlugs, typedSlug, uniqueIn, withoutAliasEqualTo } from "./slugs";

describe("suggestSlugs", () => {
  it("makes Vietnamese from the Vietnamese name, English from the English one, and zh/ja/ko copy English", () => {
    expect(suggestSlugs({ vi: "Giấy loại C", en: "Type C paper" })).toEqual({ vi: "giay-loai-c", en: "type-c-paper", zh: "type-c-paper", ja: "type-c-paper", ko: "type-c-paper" });
  });
  it("uses the other name when one is missing, and 'x' when there is neither", () => {
    expect(suggestSlugs({ vi: "Tờ rơi" }).en).toBe("to-roi");
    expect(suggestSlugs({ en: "Flyers" }).vi).toBe("flyers");
    expect(suggestSlugs({}).vi).toBe("x");
  });
  it("avoids what is taken in that language only", () => {
    const slugs = suggestSlugs({ vi: "A5", en: "A5" }, { vi: new Set(["a5"]), en: new Set(["a5", "a5-2"]) });
    expect(slugs.vi).toBe("a5-2");
    expect(slugs.en).toBe("a5-3");
    expect(slugs.zh).toBe("a5"); // zh has nothing taken: it keeps the plain slug
  });
});

describe("uniqueIn", () => {
  it("counts up until free", () => {
    expect(uniqueIn("a", new Set(["a", "a-2"]))).toBe("a-3");
    expect(uniqueIn("a", undefined)).toBe("a");
  });
});

describe("placeholderSlug", () => {
  it("is a valid slug made from the uid", () => {
    expect(placeholderSlug("3f2a1c9e-aaaa-4bbb-8ccc-123456789abc")).toBe("moi-3f2a1c");
    expect(placeholderSlug("3f2a1c9e-aaaa-4bbb-8ccc-123456789abc")).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe("followNames", () => {
  const placeholder = { vi: "moi-aaaaaa", en: "moi-aaaaaa", zh: "moi-aaaaaa", ja: "moi-aaaaaa", ko: "moi-aaaaaa" };

  it("replaces the placeholder in every language once a name is typed (zh/ja/ko follow English)", () => {
    const afterVi = followNames(placeholder, {}, { vi: "Khổ A5" });
    expect(afterVi.vi).toBe("kho-a5");
    expect(afterVi.en).toBe("moi-aaaaaa");
    const afterEn = followNames(afterVi, { vi: "Khổ A5" }, { vi: "Khổ A5", en: "A5 size" });
    expect(afterEn).toEqual({ vi: "kho-a5", en: "a5-size", zh: "a5-size", ja: "a5-size", ko: "a5-size" });
  });

  it("keeps following while the slug is still the old name's slug", () => {
    const current = { vi: "kho-a5", en: "a5", zh: "a5", ja: "a5", ko: "a5" };
    const next = followNames(current, { vi: "Khổ A5", en: "A5" }, { vi: "Khổ A5 mới", en: "A5 new" });
    expect(next).toEqual({ vi: "kho-a5-moi", en: "a5-new", zh: "a5-new", ja: "a5-new", ko: "a5-new" });
  });

  it("leaves alone a slug somebody typed by hand, in that language only", () => {
    const current = { vi: "my-own", en: "a5", zh: "a5", ja: "custom-ja", ko: "a5" };
    const next = followNames(current, { vi: "A5", en: "A5" }, { vi: "A6", en: "A6" });
    expect(next.vi).toBe("my-own");
    expect(next.en).toBe("a6");
    expect(next.ja).toBe("custom-ja");
    expect(next.zh).toBe("a6");
  });

  it("changes nothing for a blank name or an unchanged one", () => {
    expect(followNames(placeholder, {}, { vi: "   " })).toEqual(placeholder);
    const current = { vi: "a", en: "a", zh: "a", ja: "a", ko: "a" };
    expect(followNames(current, { vi: "A", en: "A" }, { vi: "A", en: "A" })).toEqual(current);
  });

  it("does not follow into a slug that is taken", () => {
    const next = followNames(placeholder, {}, { vi: "Khổ A5" }, { vi: new Set(["kho-a5"]) });
    expect(next.vi).toBe("kho-a5-2");
  });
});

describe("withoutAliasEqualTo", () => {
  it("drops the alias that the new canonical slug would equal (plain aliases)", () => {
    expect(withoutAliasEqualTo(["a", "b"], "a")).toEqual(["b"]);
  });
  it("matches a product alias by category AND slug", () => {
    const aliases = [{ category: "tet", slug: "to-roi" }, { category: "marketing", slug: "to-roi" }];
    expect(withoutAliasEqualTo(aliases, "to-roi", "tet")).toEqual([{ category: "marketing", slug: "to-roi" }]);
    expect(withoutAliasEqualTo(aliases, "to-roi", "office")).toEqual(aliases);
  });
});

describe("typing a slug", () => {
  it("shows lower case without diacritics, and anything else as a dash", () => {
    expect(typedSlug("Giấy Kraft")).toBe("giay-kraft");
    expect(typedSlug("Đóng gói / Hộp")).toBe("dong-goi-hop");
    expect(typedSlug("--a")).toBe("a");
  });
  it("keeps a trailing dash while typing (the next word is coming) and drops it when finished", () => {
    expect(typedSlug("kho-")).toBe("kho-");
    expect(finishedSlug("kho-")).toBe("kho");
    expect(finishedSlug("  Khổ  A5  ")).toBe("kho-a5");
    expect(finishedSlug("")).toBe("");
  });
});
