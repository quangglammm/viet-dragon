import { describe, expect, it } from "vitest";
import { affectedBy, cacheTags, readTags } from "./cache-tags";

const product = { type: "product", id: "11111111-1111-4111-8111-111111111111" } as const;

describe("affectedBy", () => {
  it("a product publish also touches the menu of its category", () => {
    expect(affectedBy(product, { category: "tet" }, { category: "tet" })).toEqual([product, { type: "menu", id: "tet" }]);
  });
  it("a product that moved touches the menu it left and the one it joined", () => {
    expect(affectedBy(product, { category: "office" }, { category: "marketing" })).toEqual([product, { type: "menu", id: "office" }, { type: "menu", id: "marketing" }]);
  });
  it("a new product has no old category", () => {
    expect(affectedBy(product, null, { category: "tet" })).toEqual([product, { type: "menu", id: "tet" }]);
  });
  it("a category touches its menu and every product (their URLs contain its segment)", () => {
    const category = { type: "category", id: "tet" } as const;
    expect(affectedBy(category, null, null)).toEqual([category, { type: "menu", id: "tet" }, { type: "product" }]);
  });
  it("vocabulary touches every record that shows it", () => {
    expect(affectedBy({ type: "trait", id: "glossy-coat" }, null, null)).toEqual([{ type: "trait", id: "glossy-coat" }, { type: "product" }]);
    expect(affectedBy({ type: "unit", id: "box" }, null, null)).toEqual([{ type: "unit", id: "box" }, { type: "product" }, { type: "fast_print_item" }]);
    expect(affectedBy({ type: "post_category", id: "tips" }, null, null)).toEqual([{ type: "post_category", id: "tips" }, { type: "post" }]);
  });
  it("records nothing else shows affect only themselves", () => {
    const post = { type: "post", id: "11111111-1111-4111-8111-111111111111" } as const;
    expect(affectedBy(post, null, null)).toEqual([post]);
    expect(affectedBy({ type: "site_message", id: "hero" }, null, null)).toEqual([{ type: "site_message", id: "hero" }]);
  });
});

describe("cacheTags", () => {
  it("an affected type without an id invalidates the whole type but no single entity", () => {
    expect(cacheTags([{ type: "trait", id: "glossy-coat" }, { type: "product" }])).toEqual(["content", "content:trait", "content:trait:glossy-coat", "content:product"]);
  });

  it("lists the whole tree, each type and each entity once", () => {
    expect(cacheTags([product, { type: "menu", id: "tet" }, { type: "menu", id: "office" }])).toEqual([
      "content",
      "content:product",
      `content:product:${product.id}`,
      "content:menu",
      "content:menu:tet",
      "content:menu:office",
    ]);
  });
});

describe("readTags", () => {
  it("tags a read with its type and entity but never with the root tag that every publish revalidates", () => {
    expect(readTags({ type: "product" })).toEqual(["content:product"]);
    expect(readTags({ type: "menu", id: "tet" })).toEqual(["content:menu", "content:menu:tet"]);
    for (const tag of readTags({ type: "product", id: "u1" }, { type: "category" })) expect(tag).not.toBe("content");
  });

  it("is invalidated by exactly the changes that concern it: what a publish revalidates covers what a read is tagged with", () => {
    const published = new Set(cacheTags(affectedBy({ type: "trait", id: "glossy" }, null, null)));
    expect(readTags({ type: "product" }).every((tag) => published.has(tag))).toBe(true); // a trait change reaches every cached product
    const unrelated = new Set(cacheTags(affectedBy({ type: "post", id: "p1" }, null, null)));
    expect(readTags({ type: "product" }).some((tag) => unrelated.has(tag))).toBe(false); // a post change does not
  });
});
