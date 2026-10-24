import { describe, expect, it } from "vitest";
import { catalogInput, categoryDocument } from "@/tests/fixtures/catalog";
import { productDocument, slugsOf, UID } from "@/tests/fixtures/documents";
import { LOCALES } from "../schemas";
import { buildCatalog } from "./catalog";
import { alternatePaths, categoryById, categoryPath, productByUid, productPath, resolveUrl, segmentPath } from "./urls";

const catalog = () => buildCatalog(catalogInput());
const resolve = (locale: Parameters<typeof resolveUrl>[1], parts: Parameters<typeof resolveUrl>[2]) => resolveUrl(catalog(), locale, parts);

describe("building a URL", () => {
  it("writes each part in the language of the page", () => {
    const c = catalog();
    const [category] = c.categories;
    const [product] = c.products;
    expect(categoryPath("vi", category)).toBe("/products/tiep-thi");
    expect(categoryPath("en", category)).toBe("/products/marketing");
    expect(productPath(c, "vi", product)).toBe("/products/tiep-thi/to-roi");
    expect(productPath(c, "ja", product)).toBe("/products/marketing/flyers");
    expect(segmentPath(c, "en", product, { shape: product.shapes[0] })).toBe("/products/marketing/flyers/a5-flyer");
    expect(segmentPath(c, "vi", product, { option: product.options[0] })).toBe("/products/tiep-thi/to-roi/giay-loai-c");
  });

  it("gives the same page in every language", () => {
    const c = catalog();
    const alternates = alternatePaths(c, c.categories[0], c.products[0], { shape: c.products[0].shapes[1] });
    expect(Object.keys(alternates)).toEqual([...LOCALES]);
    expect(alternates.vi).toBe("/products/tiep-thi/to-roi/a4");
    expect(alternates.ko).toBe("/products/marketing/flyers/a4-flyer");
  });

  it("finds a product or category by id", () => {
    const c = catalog();
    expect(productByUid(c, UID.product)?.slugs.en.slug).toBe("flyers");
    expect(categoryById(c, "marketing")?.slugs.en.slug).toBe("marketing");
    expect(productByUid(c, "nope")).toBeUndefined();
  });
});

describe("reading a URL", () => {
  it("renders the canonical URL of a category, a product, a shape and an option", () => {
    expect(resolve("vi", { category: "tiep-thi" })).toMatchObject({ status: "ok", product: null });
    expect(resolve("vi", { category: "tiep-thi", product: "to-roi" })).toMatchObject({ status: "ok", product: { uid: UID.product } });
    expect(resolve("en", { category: "marketing", product: "flyers", segment: "a5-flyer" })).toMatchObject({ status: "ok", target: { shape: { uid: UID.shapeA5 } } });
    expect(resolve("vi", { category: "tiep-thi", product: "to-roi", segment: "giay-loai-c" })).toMatchObject({ status: "ok", target: { option: { uid: UID.option } } });
  });

  it("redirects an old URL of the category, the product, or the shape to the canonical one", () => {
    expect(resolve("vi", { category: "marketing" })).toEqual({ status: "redirect", to: "/products/tiep-thi" }); // old category slug
    expect(resolve("vi", { category: "tiep-thi", product: "flyer" })).toEqual({ status: "redirect", to: "/products/tiep-thi/to-roi" }); // old product slug
    expect(resolve("vi", { category: "tiep-thi", product: "to-roi", segment: "kho-a4" })).toEqual({ status: "redirect", to: "/products/tiep-thi/to-roi/a4" });
  });

  it("redirects a URL written in another language's slugs to the page's own language", () => {
    expect(resolve("vi", { category: "marketing", product: "flyers" })).toEqual({ status: "redirect", to: "/products/tiep-thi/to-roi" });
    expect(resolve("en", { category: "tiep-thi", product: "to-roi", segment: "giay-loai-c" })).toEqual({ status: "redirect", to: "/products/marketing/flyers/type-c-paper" });
  });

  it("follows an old URL of a product that has since moved to another category", () => {
    const moved = { ...productDocument(), category: "office", slugs: slugsOf<{ category: string; slug: string }>("to-roi", "flyers", { vi: [{ category: "marketing", slug: "to-roi-cu" }] }) };
    const c = buildCatalog({ ...catalogInput(), categories: [categoryDocument("marketing"), categoryDocument("office", { slugs: slugsOf("van-phong", "office"), position: 1 })], products: [moved] });
    expect(resolveUrl(c, "vi", { category: "tiep-thi", product: "to-roi-cu" })).toEqual({ status: "redirect", to: "/products/van-phong/to-roi" });
  });

  it("does not find what is not there: an unknown part, a segment without a product, a product in the wrong category, an archived product", () => {
    expect(resolve("vi", { category: "khong-co" })).toEqual({ status: "notFound" });
    expect(resolve("vi", { category: "tiep-thi", product: "khong-co" })).toEqual({ status: "notFound" });
    expect(resolve("vi", { category: "tiep-thi", product: "to-roi", segment: "khong-co" })).toEqual({ status: "notFound" });
    expect(resolve("vi", { category: "tiep-thi", segment: "a5" })).toEqual({ status: "notFound" });
    const c = buildCatalog({ ...catalogInput(), categories: [categoryDocument("marketing"), categoryDocument("office", { slugs: slugsOf("van-phong", "office"), position: 1 })] });
    expect(resolveUrl(c, "vi", { category: "van-phong", product: "to-roi" })).toEqual({ status: "notFound" });
    const archived = buildCatalog({ ...catalogInput(), products: [{ ...productDocument(), status: "archived" }] });
    expect(resolveUrl(archived, "vi", { category: "tiep-thi", product: "to-roi" })).toEqual({ status: "notFound" });
  });

  it("keeps the languages apart when two things share a slug in different languages", () => {
    const twin = { ...productDocument(), uid: "88888888-8888-4888-8888-888888888888", position: 1, slugs: slugsOf<{ category: string; slug: string }>("flyers", "other-flyers") };
    const c = buildCatalog({ ...catalogInput(), products: [productDocument(), twin] });
    expect(resolveUrl(c, "vi", { category: "tiep-thi", product: "flyers" })).toMatchObject({ status: "ok", product: { uid: twin.uid } }); // vi "flyers" is the twin
    expect(resolveUrl(c, "en", { category: "marketing", product: "flyers" })).toMatchObject({ status: "ok", product: { uid: UID.product } }); // en "flyers" is the original
  });

  it("answers in every language the same way for the canonical URLs it built", () => {
    const c = catalog();
    for (const locale of LOCALES) {
      const path = productPath(c, locale, c.products[0]).split("/").slice(2);
      expect(resolveUrl(c, locale, { category: path[0], product: path[1] }).status, locale).toBe("ok");
    }
  });
});
