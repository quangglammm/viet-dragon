import { describe, expect, it } from "vitest";
import { menuDocument, postDocument, productDocument } from "@/tests/fixtures/documents";
import { collectReferences, draftReferenceRows } from "./references";

const keysOf = (refs: ReturnType<typeof collectReferences>, kind: string) => refs.filter((r) => r.kind === kind).map((r) => r.key);

describe("collectReferences", () => {
  it("finds everything a product points at, with the field it was found in", () => {
    const refs = collectReferences("product", productDocument());
    expect(keysOf(refs, "category")).toEqual(["marketing"]);
    expect(keysOf(refs, "material")).toEqual(["giay-loai-c", "giay-loai-c"]);
    expect(keysOf(refs, "unit")).toEqual(["box"]);
    expect(keysOf(refs, "trait")).toEqual(["glossy-coat"]);
    expect(keysOf(refs, "spec_item")).toEqual(["technique/offset", "finishing/matte-lamination"]);
    expect(keysOf(refs, "media")).toEqual(["images/product/to-roi.webp", "images/product/c.webp"]);
    expect(refs.find((r) => r.key === "box")?.path).toBe("options[0].unit");
    expect(refs.find((r) => r.key === "glossy-coat")?.path).toBe("options[0].bullets[0].trait");
    expect(refs.find((r) => r.key === "technique/offset")?.path).toBe("specs[0].item");
  });

  it("marks the slots that take photos only", () => {
    const doc = productDocument();
    doc.ogImage = "images/og.webp";
    doc.options[0].ogImage = "images/og-option.webp";
    const imageOnly = collectReferences("product", doc).filter((r) => r.imageOnly).map((r) => r.path);
    expect(imageOnly).toEqual(["ogImage", "options[0].ogImage", "options[0].images.default[0]"]);
  });

  it("finds the images of a menu and the category it belongs to", () => {
    const refs = collectReferences("menu", menuDocument());
    expect(refs).toEqual([
      { kind: "category", key: "marketing", path: "category" },
      { kind: "media", key: "images/menu/c.webp", path: "columns[0].groups[0].items[1].image" },
    ]);
  });

  it("finds a post's category and covers", () => {
    const post = postDocument();
    post.cover = "images/blog/a.webp";
    expect(collectReferences("post", post).map((r) => [r.kind, r.key])).toEqual([["post_category", "tips"], ["media", "images/blog/a.webp"]]);
  });

  it("covers the other entities that point at media or units", () => {
    expect(collectReferences("category", { cover: "a.webp", ogImage: "b.webp" }).map((r) => r.key)).toEqual(["a.webp", "b.webp"]);
    expect(collectReferences("fast_print_item", { image: "a.webp", unit: "box" }).map((r) => [r.kind, r.key])).toEqual([["media", "a.webp"], ["unit", "box"]]);
    expect(collectReferences("showcase_item", { media: "a.webp" }).map((r) => r.key)).toEqual(["a.webp"]);
  });

  it("finds nothing in vocabulary records", () => {
    for (const type of ["material", "trait", "unit", "spec_item", "post_category", "site_message"] as const) {
      expect(collectReferences(type, { key: "x", icon: "Sparkles" })).toEqual([]);
    }
  });

  it("never throws on an incomplete or malformed draft", () => {
    const malformed: unknown[] = [null, undefined, "text", 7, [], {}, { options: "x" }, { options: [null, 5, "x", []] }, { options: [{ bullets: 3, images: "x", material: 5 }] }, { shapes: [{ image: 4 }], specs: [{ kind: 1 }] }, { columns: [{ groups: [null] }] }];
    for (const doc of malformed) {
      for (const type of ["product", "menu", "post", "category", "fast_print_item", "showcase_item"] as const) {
        expect(() => collectReferences(type, doc)).not.toThrow();
      }
    }
    expect(collectReferences("product", { options: [null, { material: 5, unit: "", bullets: [{ trait: null }] }] })).toEqual([]);
  });
});

describe("draftReferenceRows", () => {
  it("lists each record once, in the shape of the draft_reference table", () => {
    const rows = draftReferenceRows("product", productDocument());
    expect(rows).toContainEqual({ refType: "material", refKey: "giay-loai-c" });
    expect(rows.filter((r) => r.refType === "material")).toHaveLength(1);
    expect(rows).toContainEqual({ refType: "spec_item", refKey: "finishing/matte-lamination" });
    expect(rows).toContainEqual({ refType: "media", refKey: "images/product/c.webp" });
  });

  it("leaves out the kinds the table does not record (categories)", () => {
    expect(draftReferenceRows("product", productDocument()).some((r) => (r.refType as string) === "category")).toBe(false);
    expect(draftReferenceRows("post", postDocument())).toEqual([]);
  });
});
