import { describe, expect, it } from "vitest";
import { catalogInput } from "@/tests/fixtures/catalog";
import { postDocument, productDocument, UID } from "@/tests/fixtures/documents";
import { LOCALES } from "../schemas";
import { buildCatalog } from "./catalog";
import { buildBlog } from "./posts";
import { revisionKey, sitemapOf, type Modified, type SitemapEntry } from "./sitemap";

const MODIFIED: Modified = {
  [revisionKey("category", "marketing")]: "2026-03-01T00:00:00.000Z",
  [revisionKey("product", UID.product)]: "2026-05-02T08:30:00.000Z",
  [revisionKey("post", UID.post)]: "2026-04-10T01:00:00.000Z",
};

const TIPS = { schema: 2 as const, key: "tips", i18n: { vi: { label: "Mẹo" }, en: { label: "Tips" } } };

function entries(overrides: { products?: ReturnType<typeof productDocument>[]; posts?: ReturnType<typeof postDocument>[]; modified?: Modified } = {}): SitemapEntry[] {
  const input = catalogInput();
  return sitemapOf({
    catalog: buildCatalog({ ...input, products: overrides.products ?? input.products }),
    blog: buildBlog({ posts: overrides.posts ?? [postDocument()], categories: [TIPS] }),
    modified: overrides.modified ?? MODIFIED,
  });
}

const paths = (list: readonly SitemapEntry[]) => list.map((entry) => entry.path);
const entryAt = (list: readonly SitemapEntry[], path: string): SitemapEntry => list.find((entry) => entry.path === path)!;

describe("the sitemap", () => {
  it("lists every page once per language, each at its own address", () => {
    const list = entries();
    // 4 fixed + category + product + 2 shapes + 2 options + 1 post, in 5 languages
    expect(list).toHaveLength(11 * LOCALES.length);
    expect(new Set(paths(list)).size).toBe(list.length);
    expect(paths(list)).toEqual(expect.arrayContaining(["/", "/en", "/zh", "/ja", "/ko", "/san-pham", "/en/products", "/san-pham/in-nhanh", "/ko/products/fast-print", "/bai-viet", "/ja/blog"]));
  });

  it("writes a product, its shapes and its materials in the language's words and slugs", () => {
    const list = paths(entries());
    expect(list).toEqual(
      expect.arrayContaining([
        "/san-pham/tiep-thi",
        "/en/products/marketing",
        "/san-pham/tiep-thi/to-roi",
        "/zh/products/marketing/flyers",
        "/san-pham/tiep-thi/to-roi/a4",
        "/ko/products/marketing/flyers/a4-flyer",
        "/san-pham/tiep-thi/to-roi/giay-loai-c",
        "/ja/products/marketing/flyers/type-c-paper-a5",
      ]),
    );
  });

  it("writes a post under its own slug in each language", () => {
    expect(paths(entries())).toEqual(expect.arrayContaining(["/bai-viet/huong-dan-in-an", "/en/blog/printing-guide", "/zh/blog/printing-guide"]));
  });

  it("gives every page the same set of alternates — all five languages and x-default, itself included", () => {
    for (const entry of entries()) {
      expect(Object.keys(entry.languages)).toEqual([...LOCALES, "x-default"]);
      expect(Object.values(entry.languages)).toContain(entry.path);
      expect(entry.languages["x-default"]).toBe(entry.languages.vi);
    }
    expect(entryAt(entries(), "/en/products/marketing/flyers").languages).toEqual({
      vi: "/san-pham/tiep-thi/to-roi",
      en: "/en/products/marketing/flyers",
      zh: "/zh/products/marketing/flyers",
      ja: "/ja/products/marketing/flyers",
      ko: "/ko/products/marketing/flyers",
      "x-default": "/san-pham/tiep-thi/to-roi",
    });
  });

  it("dates a product, its shapes and its materials by the product's newest revision", () => {
    const list = entries();
    for (const path of ["/san-pham/tiep-thi/to-roi", "/en/products/marketing/flyers/a5-flyer", "/ja/products/marketing/flyers/type-c-paper"]) expect(entryAt(list, path).lastModified).toBe("2026-05-02T08:30:00.000Z");
  });

  it("dates a category by the newest of itself and its products, and a post by its own revision", () => {
    expect(entryAt(entries(), "/en/products/marketing").lastModified).toBe("2026-05-02T08:30:00.000Z");
    const older = { ...MODIFIED, [revisionKey("category", "marketing")]: "2026-09-09T00:00:00.000Z" };
    expect(entryAt(entries({ modified: older }), "/en/products/marketing").lastModified).toBe("2026-09-09T00:00:00.000Z");
    expect(entryAt(entries(), "/en/blog/printing-guide").lastModified).toBe("2026-04-10T01:00:00.000Z");
  });

  it("gives no date to a page that no single record decides, and none to a page with no revision on record", () => {
    const list = entries();
    for (const path of ["/", "/en", "/san-pham", "/en/products", "/bai-viet", "/san-pham/in-nhanh"]) expect(entryAt(list, path)).not.toHaveProperty("lastModified");
    expect(entryAt(entries({ modified: {} }), "/san-pham/tiep-thi/to-roi")).not.toHaveProperty("lastModified");
  });

  it("leaves out an archived post and an archived product", () => {
    const list = paths(entries({ posts: [{ ...postDocument(), status: "archived" }], products: [{ ...productDocument(), status: "archived" }] }));
    expect(list.some((path) => path.includes("huong-dan-in-an") || path.includes("printing-guide"))).toBe(false);
    expect(list.some((path) => path.includes("to-roi") || path.includes("flyers"))).toBe(false);
    expect(list).toContain("/san-pham/tiep-thi");
  });

  it("never lists an old address of a product, shape or post", () => {
    const list = paths(entries());
    for (const old of ["/san-pham/tiep-thi/flyer", "/san-pham/tiep-thi/to-roi/kho-a4", "/bai-viet/in-an-co-ban", "/en/products/marketing/to-roi"]) expect(list).not.toContain(old);
  });
});
