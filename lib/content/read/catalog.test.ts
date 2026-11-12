import { describe, expect, it } from "vitest";
import { catalogInput, categoryDocument } from "@/tests/fixtures/catalog";
import { productDocument, UID } from "@/tests/fixtures/documents";
import { buildCatalog, publicPath } from "./catalog";
import { optionsForProduct, optionsForShape, sizesFor, specsFor } from "./selectors";

const build = () => buildCatalog(catalogInput());
const product = () => build().products[0];

describe("publicPath", () => {
  it("serves a media key from the site root, and nothing from nothing", () => {
    expect(publicPath("images/a.webp")).toBe("/images/a.webp");
    expect(publicPath(null)).toBeNull();
    expect(publicPath("")).toBeNull();
  });
});

describe("buildCatalog", () => {
  it("keeps every language a text exists in, one object for all of them", () => {
    const view = product();
    expect(view.title).toEqual({ vi: "Tờ rơi", en: "Flyers" });
    expect(view.description).toEqual({ vi: "In tờ rơi nhanh" });
    expect(view.seo.title).toEqual({ vi: "In tờ rơi giá rẻ" });
    expect(view.cover).toBe("/images/product/to-roi.webp");
  });

  it("carries the slugs of every language and the old URLs, for the URL layer", () => {
    const view = product();
    expect(view.slugs.vi).toEqual({ slug: "to-roi", aliases: [{ category: "marketing", slug: "flyer" }] });
    expect(view.slugs.zh.slug).toBe("flyers");
    expect(view.shapes[1].slugs.vi).toEqual({ slug: "a4", aliases: ["kho-a4"] });
  });

  it("describes a category and its seo", () => {
    const [category] = build().categories;
    expect(category).toMatchObject({ id: "marketing", icon: "Briefcase", cover: "/images/category/mkt.jpg", name: { vi: "Tiếp thị", en: "Marketing" } });
    expect(category.slugs.vi).toEqual({ slug: "tiep-thi", aliases: ["marketing"] });
  });

  it("lists published products only, in the order of their category and position", () => {
    const first = productDocument();
    const archived = { ...productDocument(), uid: "99999999-9999-4999-8999-999999999999", status: "archived" as const };
    const later = { ...productDocument(), uid: "88888888-8888-4888-8888-888888888888", position: 5 };
    const other = { ...productDocument(), uid: "77777777-7777-4777-8777-777777777777", category: "office", position: 0 };
    const input = { ...catalogInput(), categories: [categoryDocument("office", { position: 1 }), categoryDocument("marketing", { position: 0 })], products: [other, later, archived, first] };
    expect(buildCatalog(input).products.map((p) => p.uid)).toEqual([first.uid, later.uid, other.uid]);
  });

  describe("an option", () => {
    const option = () => product().options[0];

    it("keeps its authored name, and its heading is the card title where there is one, else the stock's name", () => {
      expect(option().name).toEqual({ vi: "Giấy loại C", en: "Type C paper" });
      expect(option().title).toEqual({ vi: "Giấy loại C", en: "Type C" }); // vi: stock name; en: the card title override
    });

    it("shows no heading in a language where the option has no authored name, even if the stock has one", () => {
      expect(option().title.zh).toBeUndefined();
    });

    it("draws its own icon, else its stock's", () => {
      expect(option().icon).toBe("Layers");
      const withoutIcon = { ...productDocument(), options: productDocument().options.map((o) => ({ ...o, icon: null })) };
      expect(buildCatalog({ ...catalogInput(), products: [withoutIcon] }).products[0].options[0].icon).toBe("Layers"); // the material's
    });

    it("splits the bullets into features (each with its trait) and best-for lines, ordered by position, per-language text", () => {
      expect(option().features).toEqual([{ trait: "glossy-coat", text: { vi: "Bóng", en: "Glossy" } }]);
      expect(option().bestFor).toEqual([{ vi: "Sự kiện" }]);
    });

    it("serves images from the site root", () => {
      expect(option().images).toEqual(["/images/product/c.webp"]);
      expect(option().pureImages).toEqual([]);
    });
  });

  it("names the spec items and resolves sizes and traits", () => {
    const view = product();
    expect(view.specs).toEqual([
      { shape: null, kind: "technique", item: "offset", position: 0, label: { vi: "In offset", en: "Offset printing" } },
      { shape: UID.shapeA5, kind: "finishing", item: "matte-lamination", position: 0, label: { vi: "Cán màng mờ", en: "Matte lamination" } },
    ]);
    expect(view.sizes[0]).toMatchObject({ shape: null, tier: "large", w: 210, h: 297, note: { vi: "Lớn" } });
    expect(build().traits["glossy-coat"]).toEqual({ key: "glossy-coat", icon: "Sparkles", label: { vi: "Bóng", en: "Glossy" }, description: { vi: "Mặt bóng" } });
    expect(build().materials["giay-loai-c"].name.zh).toBe("C类纸");
  });

  it("does not touch the documents it was given", () => {
    const input = catalogInput();
    const before = structuredClone(input);
    buildCatalog(input);
    expect(input).toEqual(before);
  });
});

describe("selectors", () => {
  it("shows a shape's own options instead of the product's, and the product's for a shape that has none", () => {
    const view = product();
    expect(optionsForShape(view, UID.shapeA5).map((o) => o.uid)).toEqual([UID.optionForShape]);
    expect(optionsForShape(view, UID.shapeA4).map((o) => o.uid)).toEqual([UID.option]);
    expect(optionsForShape(view, null).map((o) => o.uid)).toEqual([UID.option]);
  });

  it("shows the product's options on a product page, or every option when it has none of its own", () => {
    const view = product();
    expect(optionsForProduct(view).map((o) => o.uid)).toEqual([UID.option]);
    const onlyShapes = { ...view, options: view.options.filter((o) => o.shape !== null) };
    expect(optionsForProduct(onlyShapes).map((o) => o.uid)).toEqual([UID.optionForShape]);
  });

  it("replaces the product's sizes by a shape's, tier order kept", () => {
    const view = product();
    expect(sizesFor(view, null)).toHaveLength(1);
    expect(sizesFor(view, UID.shapeA5)).toEqual([expect.objectContaining({ shape: UID.shapeA5, text: "Size L - XL" })]);
    expect(sizesFor(view, UID.shapeA4)).toEqual(sizesFor(view, null));
  });

  it("replaces a spec list per kind", () => {
    const view = product();
    expect(specsFor(view, UID.shapeA5, "technique").map((s) => s.item)).toEqual(["offset"]); // the shape has no technique rows: the product's
    expect(specsFor(view, UID.shapeA5, "finishing").map((s) => s.item)).toEqual(["matte-lamination"]);
    expect(specsFor(view, UID.shapeA4, "finishing")).toEqual([]); // the product has no finishing rows
  });
});
