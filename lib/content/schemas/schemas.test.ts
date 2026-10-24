import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { menuDocument, postDocument, productDocument, UID } from "@/tests/fixtures/documents";
import { DRAFT_ENTITY_TYPES } from "@/lib/db/content/drafts";
import {
  DOCUMENT_SCHEMAS,
  documentIdentity,
  isUidEntity,
  menuDocumentSchema,
  parseDocument,
  postDocumentSchema,
  productDocumentSchema,
  specItemDocumentSchema,
  type ProductDocument,
} from "./index";

/** Asserts the schema refuses `document` with an issue at the dotted `path` (e.g. `options.0.slug`; "" = the root). */
function refuses(document: unknown, schema: z.ZodType, path: string) {
  const result = schema.safeParse(document);
  expect(result.success, "the document was ACCEPTED").toBe(false);
  if (!result.success) expect(result.error.issues.map((issue) => issue.path.join("."))).toContain(path);
}

const edit = (change: (doc: ProductDocument) => void): ProductDocument => {
  const doc = productDocument();
  change(doc);
  return doc;
};

describe("product document", () => {
  it("accepts a complete document and round-trips it through JSON unchanged", () => {
    const parsed = productDocumentSchema.parse(productDocument());
    expect(JSON.parse(JSON.stringify(parsed))).toEqual(productDocument());
  });

  it("requires the default (Vietnamese) language", () => {
    refuses(edit((d) => { delete d.i18n.vi; }), productDocumentSchema, "i18n.vi");
    refuses(edit((d) => { delete d.shapes[0].i18n.vi; }), productDocumentSchema, "shapes.0.i18n.vi");
    refuses(edit((d) => { delete d.options[0].i18n.vi?.name; }), productDocumentSchema, "options.0.i18n.vi.name");
  });

  it("rejects blank text in any script, unknown languages and unknown fields", () => {
    refuses(edit((d) => { d.i18n.vi = { title: String.fromCodePoint(0xa0, 0x20, 0x3000) }; }), productDocumentSchema, "i18n.vi.title");
    refuses({ ...productDocument(), i18n: { ...productDocument().i18n, xx: { title: "x" } } }, productDocumentSchema, "i18n");
    refuses({ ...productDocument(), surprise: true }, productDocumentSchema, "");
    refuses(edit((d) => { d.shapes[0].i18n.vi = { name: "A5", description: "" }; }), productDocumentSchema, "shapes.0.i18n.vi.description");
  });

  it("rejects slugs that are not lowercase kebab-case, and icon names with punctuation", () => {
    refuses(edit((d) => { d.slug = "To Roi"; }), productDocumentSchema, "slug");
    refuses(edit((d) => { d.options[0].icon = "Layers!"; }), productDocumentSchema, "options.0.icon");
  });

  it("keeps ONE URL-segment namespace for shapes, options and their aliases", () => {
    refuses(edit((d) => { d.options[0].slug = "a5"; }), productDocumentSchema, "options.0.slug");
    refuses(edit((d) => { d.options[1].aliases = ["kho-a4"]; }), productDocumentSchema, "options.1.aliases.0");
  });

  it("rejects duplicate uids and an alias equal to the canonical URL or to another alias", () => {
    refuses(edit((d) => { d.options[0].uid = d.shapes[0].uid; }), productDocumentSchema, "uid");
    refuses(edit((d) => { d.aliases = [{ category: "marketing", slug: "to-roi" }]; }), productDocumentSchema, "aliases");
    refuses(edit((d) => { d.aliases = [{ category: "tet", slug: "x" }, { category: "tet", slug: "x" }]; }), productDocumentSchema, "aliases");
  });

  it("rejects children that point at a shape the document does not contain", () => {
    const missing = "99999999-9999-4999-8999-999999999999";
    refuses(edit((d) => { d.options[1].shape = missing; }), productDocumentSchema, "options.1.shape");
    refuses(edit((d) => { d.sizes[0].shape = missing; }), productDocumentSchema, "sizes.0.shape");
    refuses(edit((d) => { d.specs[0].shape = missing; }), productDocumentSchema, "specs.0.shape");
  });

  it("rejects an option language row that says nothing", () => {
    refuses(edit((d) => { d.options[0].i18n.ja = {}; }), productDocumentSchema, "options.0.i18n.ja");
  });

  it("accepts an option language row that carries only SEO text", () => {
    expect(productDocumentSchema.safeParse(edit((d) => { d.options[0].i18n.ja = { seoTitle: "Giấy C" }; })).success).toBe(true);
  });

  it("allows a trait icon on features only", () => {
    refuses(edit((d) => { d.options[0].bullets[1].trait = "glossy-coat"; }), productDocumentSchema, "options.0.bullets.1.trait");
  });

  it("rejects duplicate positions and duplicate size tiers / specs", () => {
    refuses(edit((d) => { d.shapes[1].position = 0; }), productDocumentSchema, "shapes");
    refuses(edit((d) => { d.options[0].bullets[1] = { ...d.options[0].bullets[0] }; }), productDocumentSchema, "options.0.bullets");
    refuses(edit((d) => { d.sizes.push({ ...d.sizes[0] }); }), productDocumentSchema, "sizes");
    refuses(edit((d) => { d.specs.push({ ...d.specs[0] }); }), productDocumentSchema, "specs");
  });

  it("takes a size as numeric dimensions XOR text, and a depth only with width and height", () => {
    refuses(edit((d) => { d.sizes[0].text = "Size M"; }), productDocumentSchema, "sizes.0.text");
    refuses(edit((d) => { d.sizes[1].text = null; }), productDocumentSchema, "sizes.1.text");
    refuses(edit((d) => { d.sizes[1].d = 5; }), productDocumentSchema, "sizes.1.d");
  });

  it("rejects negative prices and non-integer positions", () => {
    refuses(edit((d) => { d.options[1].prices.base = -1; }), productDocumentSchema, "options.1.prices.base");
    refuses(edit((d) => { d.position = 1.5; }), productDocumentSchema, "position");
  });

  it("explains problems to editors in Vietnamese", () => {
    const result = productDocumentSchema.safeParse(edit((d) => { delete d.i18n.vi; }));
    expect(result.error?.issues[0]?.message).toMatch(/tiếng Việt/);
  });
});

describe("menu document", () => {
  it("accepts a complete document", () => {
    expect(menuDocumentSchema.safeParse(menuDocument()).success).toBe(true);
  });
  it("requires the key to be the category", () => {
    refuses({ ...menuDocument(), key: "tet" }, menuDocumentSchema, "key");
  });
  it("lists a product once, and a column once", () => {
    const doc = menuDocument();
    doc.columns[0].groups.push({ ...doc.columns[0].groups[0] });
    refuses(doc, menuDocumentSchema, "columns.0.groups.1.product");
    const twoColumns = menuDocument();
    twoColumns.columns.push({ column: 1, groups: [] });
    refuses(twoColumns, menuDocumentSchema, "columns.1.column");
  });
  it("needs exactly one target per item", () => {
    const doc = menuDocument();
    (doc.columns[0].groups[0].items[0] as { target: unknown }).target = { shape: UID.shapeA5, option: UID.option };
    expect(menuDocumentSchema.safeParse(doc).success).toBe(false);
  });
  it("rejects a group override that has neither label nor description", () => {
    const doc = menuDocument();
    doc.columns[0].groups[0].i18n = { vi: {} };
    refuses(doc, menuDocumentSchema, "columns.0.groups.0.i18n.vi");
  });
});

describe("post document", () => {
  it("accepts a complete document", () => {
    expect(postDocumentSchema.safeParse(postDocument()).success).toBe(true);
  });
  it("requires Vietnamese, a real date and a distinct alias", () => {
    refuses({ ...postDocument(), i18n: { en: { title: "x", content: "y" } } }, postDocumentSchema, "i18n.vi");
    refuses({ ...postDocument(), publishedOn: "15/01/2026" }, postDocumentSchema, "publishedOn");
    refuses({ ...postDocument(), aliases: ["huong-dan-in-an"] }, postDocumentSchema, "aliases");
  });
});

describe("library documents", () => {
  it("identifies a spec item by kind and key", () => {
    const doc = { schema: 2, key: "technique/offset", isDefault: false, i18n: { vi: { label: "Offset" } } };
    expect(specItemDocumentSchema.safeParse(doc).success).toBe(true);
    refuses({ ...doc, key: "offset" }, specItemDocumentSchema, "key");
    refuses({ ...doc, key: "unknown/offset" }, specItemDocumentSchema, "key");
  });
  it.each([
    ["material", { schema: 2, key: "giay-kraft", icon: null, i18n: { en: { name: "Kraft" } } }],
    ["trait", { schema: 2, key: "glossy-coat", icon: "Sparkles", i18n: {} }],
    ["unit", { schema: 2, key: "box", i18n: { en: { label: "Box" } } }],
    ["post_category", { schema: 2, key: "tips", i18n: { zh: { label: "提示" } } }],
  ] as const)("requires the Vietnamese row on a %s", (type, doc) => {
    expect(parseDocument(type, doc).success).toBe(false);
  });
  it("accepts a Fast Print item and a showcase item", () => {
    expect(
      parseDocument("fast_print_item", {
        schema: 2, uid: UID.product, key: "name-card", image: null, icon: "Zap", turnaroundHours: 2, fromPrice: 120000, unit: "box",
        position: 0, status: "published", i18n: { vi: { name: "Danh thiếp", tag: "2 giờ" } },
      }).success,
    ).toBe(true);
    expect(
      parseDocument("showcase_item", { schema: 2, uid: UID.post, key: "s1", media: "images/a.webp", aspect: "tall", position: 0, i18n: { vi: { label: "Ảnh" } } }).success,
    ).toBe(true);
  });
  it("holds a UI-copy namespace for every language side by side", () => {
    expect(parseDocument("site_message", { schema: 2, key: "hero", data: { vi: { title: "x" }, en: { title: "y" } } }).success).toBe(true);
    expect(parseDocument("site_message", { schema: 2, key: "hero.title", data: {} }).success).toBe(false);
  });
});

describe("dispatch", () => {
  it("has a schema for every entity type that can have a draft, and no other", () => {
    expect(Object.keys(DOCUMENT_SCHEMAS).sort()).toEqual([...DRAFT_ENTITY_TYPES].sort());
  });
  it("files uid entities under their uid and vocabulary under their key", () => {
    expect(documentIdentity("product", productDocument())).toEqual({ entityUid: UID.product, entityKey: null });
    expect(documentIdentity("menu", menuDocument())).toEqual({ entityUid: null, entityKey: "marketing" });
    expect(isUidEntity("post")).toBe(true);
    expect(isUidEntity("material")).toBe(false);
    expect(() => documentIdentity("product", {})).toThrow(/no uid/);
  });
  it("dispatches by entity type", () => {
    expect(parseDocument("product", productDocument()).success).toBe(true);
    expect(parseDocument("menu", productDocument()).success).toBe(false);
  });
});
