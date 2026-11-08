import { describe, expect, it } from "vitest";
import { setRootSlug, followRootNames, type RootSlugs } from "./slug-ops";
import { LOCALES } from "../schemas";

const slugs = (slug: string, aliases: string[] = []): RootSlugs => Object.fromEntries(LOCALES.map((locale) => [locale, { slug, aliases: [...aliases] }])) as RootSlugs;

describe("setRootSlug", () => {
  it("changes one language only", () => {
    const next = setRootSlug({ slugs: slugs("a") }, "vi", "b");
    expect(next.slugs.vi.slug).toBe("b");
    expect(next.slugs.en.slug).toBe("a");
  });

  it("drops the old URL that the new slug equals: a canonical URL is never also an alias", () => {
    const next = setRootSlug({ slugs: slugs("new", ["old", "older"]) }, "vi", "old");
    expect(next.slugs.vi).toEqual({ slug: "old", aliases: ["older"] });
    expect(next.slugs.en.aliases).toEqual(["old", "older"]);
  });

  it("does not touch the document it was given", () => {
    const document = { slugs: slugs("a", ["x"]) };
    setRootSlug(document, "en", "x");
    expect(document.slugs.en).toEqual({ slug: "a", aliases: ["x"] });
  });
});

describe("followRootNames", () => {
  it("rebuilds the placeholder slugs from the new names, zh/ja/ko following English", () => {
    const document = { slugs: slugs("moi-abc123") };
    const next = followRootNames(document, {}, { vi: "Mẹo in nhanh", en: "Quick tips" });
    expect(LOCALES.map((locale) => next.slugs[locale].slug)).toEqual(["meo-in-nhanh", "quick-tips", "quick-tips", "quick-tips", "quick-tips"]);
  });

  it("leaves a slug somebody typed by hand alone", () => {
    const document = { slugs: { ...slugs("moi-abc123"), vi: { slug: "chu-de-rieng", aliases: [] } } as RootSlugs };
    const next = followRootNames(document, { vi: "Cũ" }, { vi: "Mới", en: "New" });
    expect(next.slugs.vi.slug).toBe("chu-de-rieng");
    expect(next.slugs.en.slug).toBe("new");
  });

  it("avoids a slug another record already has", () => {
    const next = followRootNames({ slugs: slugs("moi-abc123") }, {}, { vi: "Mẹo", en: "Tips" }, { vi: new Set(["meo"]) });
    expect(next.slugs.vi.slug).toBe("meo-2");
  });
});
