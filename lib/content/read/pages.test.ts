import { describe, expect, it } from "vitest";
import { catalogInput, categoryDocument, TRAIT_GLOSSY } from "@/tests/fixtures/catalog";
import { productDocument, UID } from "@/tests/fixtures/documents";
import { buildCatalog } from "./catalog";
import { categoryPageOf, glossaryOf, productPageOf } from "./pages";
import { resolveUrl, type SegmentTarget } from "./urls";

const catalog = () => buildCatalog(catalogInput());

function targetOf(parts: { product?: string; segment?: string }, locale: "vi" | "en" = "vi"): SegmentTarget | null {
  const resolved = resolveUrl(catalog(), locale, { category: locale === "vi" ? "tiep-thi" : "marketing", ...parts });
  if (resolved.status !== "ok") throw new Error(`${JSON.stringify(parts)} resolved to ${resolved.status}`);
  return resolved.target;
}

describe("categoryPageOf", () => {
  const second = () => categoryDocument("office", { position: 1, slugs: { ...categoryDocument().slugs, vi: { slug: "van-phong", aliases: [] }, en: { slug: "office", aliases: [] } }, i18n: { vi: { name: "Văn phòng", description: "Ấn phẩm văn phòng" }, en: { name: "Office", description: "Office prints" } } });
  const three = () => {
    const input = catalogInput();
    return buildCatalog({ ...input, categories: [categoryDocument("marketing", { position: 0 }), second(), categoryDocument("tet", { position: 2, slugs: { ...categoryDocument().slugs, vi: { slug: "an-pham-tet", aliases: [] }, en: { slug: "tet", aliases: [] } } })] });
  };

  it("titles the page «<name> | Viet Dragon» with the category's description, and lists its cards", () => {
    const page = categoryPageOf(catalog(), "vi", catalog().categories[0]);
    expect(page.meta).toEqual({ title: "Tiếp thị | Viet Dragon", description: "Ấn phẩm quảng bá" });
    expect(page).toMatchObject({ name: "Tiếp thị", icon: "Briefcase", cover: "/images/category/mkt.jpg" });
    expect(page.cards.map((card) => card.href)).toEqual(["/products/tiep-thi/to-roi"]);
  });

  it("links the category before and after in the page's language, and none at the ends", () => {
    const all = three();
    const first = categoryPageOf(all, "en", all.categories[0]);
    expect(first.prev).toBeNull();
    expect(first.next).toEqual({ label: "Office", href: "/products/office" });
    const middle = categoryPageOf(all, "vi", all.categories[1]);
    expect(middle.prev).toEqual({ label: "Tiếp thị", href: "/products/tiep-thi" });
    expect(middle.next?.href).toBe("/products/an-pham-tet");
    expect(categoryPageOf(all, "vi", all.categories[2]).next).toBeNull();
  });
});

describe("productPageOf", () => {
  const page = (parts: { product?: string; segment?: string }, locale: "vi" | "en" = "vi") => productPageOf(catalog(), locale, catalog().categories[0], catalog().products[0], targetOf({ product: locale === "vi" ? "to-roi" : "flyers", ...parts }, locale));

  it("is a grid of the product's shapes when it has any, each with its anchor and page", () => {
    const shapes = page({});
    if (shapes.kind !== "shapes") throw new Error(shapes.kind);
    expect(shapes.meta).toEqual({ title: "Tờ rơi | Viet Dragon", description: "In tờ rơi nhanh" });
    expect(shapes.context).toMatchObject({ title: "Tờ rơi", category: { label: "Tiếp thị", href: "/products/tiep-thi", icon: "Briefcase" }, product: { label: "Tờ rơi", href: "/products/tiep-thi/to-roi" } });
    expect(shapes.shapes.map((shape) => [shape.name, shape.href, shape.anchor.id])).toEqual([
      ["A5", "/products/tiep-thi/to-roi/a5", "a5"],
      ["A4", "/products/tiep-thi/to-roi/a4", "a4"],
    ]);
    expect([...shapes.shapes[1].anchor.aliases].sort()).toEqual(["a4-flyer", "kho-a4"]); // the English slug and the Vietnamese old one both still scroll to it
    expect(shapes.shapes[0].description).toBe("");
  });

  it("is the product's materials, with its neighbours in the category, when it has no shapes", () => {
    const flat = { ...productDocument(), shapes: [], options: productDocument().options.filter((option) => option.shape === null), sizes: [], specs: [] };
    const next = { ...flat, uid: "88888888-8888-4888-8888-888888888888", position: 1, i18n: { vi: { title: "Danh thiếp" }, en: { title: "Cards" } }, slugs: { ...flat.slugs, vi: { slug: "danh-thiep", aliases: [] }, en: { slug: "cards", aliases: [] } } };
    const built = buildCatalog({ ...catalogInput(), products: [flat, next] });
    const result = productPageOf(built, "vi", built.categories[0], built.products[0], null);
    if (result.kind !== "detail") throw new Error(result.kind);
    expect(result.cards.map((card) => [card.heading, card.consultName])).toEqual([["Giấy loại C", "Tờ rơi"]]);
    expect(result.prev).toBeNull();
    expect(result.next).toEqual({ label: "Danh thiếp", href: "/products/tiep-thi/danh-thiep" });
  });

  it("is one shape: its name in the title, its own options named after it, the shapes either side of it", () => {
    const shape = page({ segment: "a5" });
    if (shape.kind !== "shape") throw new Error(shape.kind);
    expect(shape.meta.title).toBe("A5 - Tờ rơi | Viet Dragon");
    expect(shape.shape).toMatchObject({ name: "A5", image: "/images/product/to-roi.webp" }); // the shape has no picture of its own: the product's cover
    expect(shape.cards.map((card) => [card.uid, card.consultName])).toEqual([[UID.optionForShape, "A5 - Giấy loại C khổ A5"]]);
    expect(shape.prev).toBeNull();
    expect(shape.next).toEqual({ label: "A4", href: "/products/tiep-thi/to-roi/a4" });
    const last = page({ segment: "a4" });
    if (last.kind !== "shape") throw new Error(last.kind);
    expect(last.prev?.label).toBe("A5");
    expect(last.next).toBeNull();
    expect(last.cards.map((card) => card.uid)).toEqual([UID.option]); // a shape without options of its own shows the product's
  });

  it("is a material: every card of the product, with the one the URL named picked out", () => {
    const material = page({ segment: "giay-loai-c" });
    if (material.kind !== "material") throw new Error(material.kind);
    expect(material.meta.title).toBe("Tờ rơi - Giấy loại C | Viet Dragon");
    expect(material.material).toMatchObject({ name: "Giấy loại C", uid: UID.option, anchor: { id: "giay-loai-c" } });
    expect(material.cards.map((card) => card.uid)).toEqual([UID.option]);
    expect(material.cards[0].consultName).toBe("Tờ rơi - Giấy loại C");
  });

  it("builds every part in the page's language", () => {
    const english = page({ segment: "a5-flyer" }, "en");
    if (english.kind !== "shape") throw new Error(english.kind);
    expect(english.meta.title).toBe("A5 flyer - Flyers | Viet Dragon");
    expect(english.context.category.href).toBe("/products/marketing");
    expect(english.next?.href).toBe("/products/marketing/flyers/a4-flyer");
  });
});

describe("glossaryOf", () => {
  it("lists every trait in the page's language, ordered by key, with its icon", () => {
    const traits = glossaryOf(catalog(), "vi");
    expect(traits).toEqual([{ key: "glossy-coat", icon: "Sparkles", label: "Bóng", description: "Mặt bóng" }]);
    expect(glossaryOf(catalog(), "en")[0]).toMatchObject({ label: "Glossy", description: "Mặt bóng" }); // no English description: Vietnamese
  });

  it("orders the traits by key, whatever order they were loaded in", () => {
    const first = { ...TRAIT_GLOSSY, key: "a-first", icon: "Leaf", i18n: { vi: { label: "Đầu" }, en: { label: "First" } } };
    const built = buildCatalog({ ...catalogInput(), traits: [TRAIT_GLOSSY, first] });
    expect(glossaryOf(built, "vi").map((trait) => trait.key)).toEqual(["a-first", "glossy-coat"]);
    expect(glossaryOf(built, "en").map((trait) => trait.label)).toEqual(["First", "Glossy"]);
  });
});
