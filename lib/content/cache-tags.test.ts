import { describe, expect, it } from "vitest";
import { affectedBy, cacheTags } from "./cache-tags";

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
  it("other entities affect only themselves", () => {
    const trait = { type: "trait", id: "glossy-coat" } as const;
    expect(affectedBy(trait, { key: "glossy-coat" }, { key: "glossy-coat" })).toEqual([trait]);
  });
});

describe("cacheTags", () => {
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
