import { describe, expect, it } from "vitest";
import { slugsOf } from "@/tests/fixtures/documents";
import { planProductSlugs, planSegments, type ProductSlugRow, type SegmentTarget } from "./product-slugs";

const row = (locale: ProductSlugRow["locale"], categoryId: string, slug: string, isCanonical = false): ProductSlugRow => ({ locale, categoryId, slug, isCanonical });
const inLanguage = <R extends { locale: string }>(rows: readonly R[], locale: string): R[] => rows.filter((r) => r.locale === locale);
const canonicalOf = (rows: readonly ProductSlugRow[], locale: string) => rows.find((r) => r.locale === locale && r.isCanonical);
const aliasesOf = (rows: readonly ProductSlugRow[], locale: string) => rows.filter((r) => r.locale === locale && !r.isCanonical).map((r) => `${r.categoryId}/${r.slug}`);

describe("planProductSlugs", () => {
  it("writes a canonical slug in every language", () => {
    const rows = planProductSlugs({ category: "tet", slugs: slugsOf("to-roi", "flyers") }, []);
    expect(rows).toHaveLength(5);
    expect(canonicalOf(rows, "vi")).toEqual(row("vi", "tet", "to-roi", true));
    expect(canonicalOf(rows, "zh")).toEqual(row("zh", "tet", "flyers", true));
  });

  it("keeps the previous canonical slug as an alias when it is renamed — only in that language", () => {
    const held = [row("vi", "tet", "to-roi", true), row("en", "tet", "flyers", true)];
    const rows = planProductSlugs({ category: "tet", slugs: slugsOf("to-roi", "flyers-new") }, held);
    expect(canonicalOf(rows, "en")?.slug).toBe("flyers-new");
    expect(aliasesOf(rows, "en")).toEqual(["tet/flyers"]);
    expect(aliasesOf(rows, "vi")).toEqual([]);
  });

  it("keeps the old (category, slug) when the product moves category", () => {
    const held = [row("vi", "office", "ao-thun", true)];
    const rows = planProductSlugs({ category: "marketing", slugs: slugsOf("ao-thun", "t-shirt") }, held);
    expect(canonicalOf(rows, "vi")).toEqual(row("vi", "marketing", "ao-thun", true));
    expect(aliasesOf(rows, "vi")).toEqual(["office/ao-thun"]);
  });

  it("never drops an alias it already holds, even when the document no longer lists it", () => {
    const held = [row("vi", "tet", "to-roi", true), row("vi", "tet", "flyer-cu"), row("en", "tet", "old-en")];
    const rows = planProductSlugs({ category: "tet", slugs: slugsOf("to-roi", "flyers") }, held);
    expect(aliasesOf(rows, "vi")).toEqual(["tet/flyer-cu"]);
    expect(aliasesOf(rows, "en")).toEqual(["tet/old-en"]);
  });

  it("adds the aliases the document names, in any category, and never lists the canonical slug as an alias", () => {
    const slugs = slugsOf("to-roi", "flyers", { vi: [{ category: "office", slug: "tai-lieu" }, { category: "tet", slug: "to-roi" }] });
    const rows = planProductSlugs({ category: "tet", slugs }, [row("vi", "tet", "to-roi", true)]);
    expect(aliasesOf(rows, "vi")).toEqual(["office/tai-lieu"]);
  });

  it("restoring an old document keeps the newer URLs", () => {
    const held = [row("vi", "tet", "to-roi-c", true), row("vi", "tet", "to-roi-b"), row("vi", "tet", "to-roi")];
    const rows = planProductSlugs({ category: "tet", slugs: slugsOf("to-roi", "flyers") }, held);
    expect(canonicalOf(rows, "vi")?.slug).toBe("to-roi");
    expect(aliasesOf(rows, "vi").sort()).toEqual(["tet/to-roi-b", "tet/to-roi-c"]);
  });
});

const slugsFor = (vi: string, en = vi, aliases: { vi?: string[]; en?: string[] } = {}) => slugsOf(vi, en, aliases);
const target = (key: string, slugs: SegmentTarget["slugs"], held: SegmentTarget["held"] = {}): SegmentTarget => ({ key, slugs, held });

describe("planSegments", () => {
  it("gives every shape and option a canonical segment in every language", () => {
    const rows = planSegments([target("s:1", slugsFor("a5", "a5-flyer")), target("o:1", slugsFor("giay-c", "paper-c"))]);
    expect(rows.filter((r) => r.isCanonical)).toHaveLength(10);
    expect(rows.find((r) => r.key === "s:1" && r.locale === "ja")?.slug).toBe("a5-flyer");
  });

  it("keeps the old slug of a renamed shape (held) as an alias, per language", () => {
    const rows = planSegments([target("s:1", slugsFor("a5-moi", "a5"), { vi: ["a5"], en: ["a5"] })]);
    expect(inLanguage(rows, "vi").map((r) => [r.slug, r.isCanonical])).toEqual([["a5-moi", true], ["a5", false]]);
    // English did not change: the held slug IS the canonical one, so it is not repeated.
    expect(inLanguage(rows, "en").map((r) => [r.slug, r.isCanonical])).toEqual([["a5", true]]);
  });

  it("lets two shapes swap slugs in one publish", () => {
    const rows = planSegments([target("s:1", slugsFor("b"), { vi: ["a"] }), target("s:2", slugsFor("a"), { vi: ["b"] })]);
    expect(inLanguage(rows, "vi").map((r) => [r.key, r.slug, r.isCanonical])).toEqual([["s:1", "b", true], ["s:2", "a", true]]);
  });

  it("an explicit alias beats a held slug: a shape renamed while an option takes its old slug", () => {
    const rows = planSegments([
      target("s:1", slugsFor("a5-moi"), { vi: ["a5"] }),
      target("o:1", slugsFor("giay-c", "giay-c", { vi: ["a5"] })),
    ]);
    const owner = rows.find((r) => r.locale === "vi" && r.slug === "a5");
    expect(owner).toEqual({ key: "o:1", locale: "vi", slug: "a5", isCanonical: false });
  });

  it("a canonical slug always wins over any alias", () => {
    const rows = planSegments([target("s:1", slugsFor("x"), { vi: ["y"] }), target("o:1", slugsFor("y"))]);
    const y = rows.filter((r) => r.locale === "vi" && r.slug === "y");
    expect(y).toEqual([{ key: "o:1", locale: "vi", slug: "y", isCanonical: true }]);
  });

  it("never emits the same slug twice within a language", () => {
    const rows = planSegments([target("s:1", slugsFor("a", "a", { vi: ["z"] }), { vi: ["z", "a"] }), target("o:1", slugsFor("b"), { vi: ["z"] })]);
    const vi = inLanguage(rows, "vi").map((r) => r.slug);
    expect(new Set(vi).size).toBe(vi.length);
  });
});
