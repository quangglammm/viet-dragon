import { describe, expect, it } from "vitest";
import type { EntityRef } from "../compose";
import { DRAFT_ENTITY_TYPES } from "../entity-types";
import { catalogInput } from "@/tests/fixtures/catalog";
import { postDocument, UID } from "@/tests/fixtures/documents";
import { buildCatalog } from "./catalog";
import { buildBlog } from "./posts";
import { previewPathOf } from "./preview-target";

// Where «Xem trước» lands. The catalog and blog are built the way the preview builds them: from documents that may include drafts.

const catalog = buildCatalog(catalogInput());
const blog = buildBlog({ posts: [postDocument()], categories: [] });
const where = (ref: EntityRef, locale: "vi" | "en" | "ja" = "vi") => previewPathOf(ref, locale, { catalog, blog });

describe("previewPathOf", () => {
  it("lands a product on its own page, written in the language chosen", () => {
    expect(where({ type: "product", id: UID.product })).toBe("/products/tiep-thi/to-roi");
    expect(where({ type: "product", id: UID.product }, "en")).toBe("/products/marketing/flyers");
  });

  it("lands a post on its own page", () => {
    expect(where({ type: "post", id: UID.post })).toBe("/blog/huong-dan-in-an");
    expect(where({ type: "post", id: UID.post }, "ja")).toBe("/blog/printing-guide");
  });

  it("lands a category and its menu on the category page", () => {
    expect(where({ type: "category", id: "marketing" })).toBe("/products/tiep-thi");
    expect(where({ type: "menu", id: "marketing" }, "en")).toBe("/products/marketing");
  });

  it("lands the vocabulary and the UI copy on the home page, the other lists on the page that draws them", () => {
    for (const type of ["material", "trait", "spec_item", "site_message"] as const) expect(where({ type, id: "x" }), type).toBe("/");
    expect(where({ type: "fast_print_item", id: "x" })).toBe("/products/fast-print");
    expect(where({ type: "unit", id: "hop" })).toBe("/products/fast-print");
    expect(where({ type: "showcase_item", id: "x" })).toBe("/products");
    expect(where({ type: "post_category", id: "tips" })).toBe("/blog");
  });

  it("falls back to the index when the entity is not on the site (archived, or no such id)", () => {
    expect(where({ type: "product", id: "00000000-0000-4000-8000-000000000000" })).toBe("/products");
    expect(where({ type: "post", id: "00000000-0000-4000-8000-000000000000" })).toBe("/blog");
    expect(where({ type: "category", id: "nope" })).toBe("/products");
  });

  it("has an answer for every entity type", () => {
    for (const type of DRAFT_ENTITY_TYPES) expect(where({ type, id: "x" }), type).toMatch(/^\//);
  });
});
