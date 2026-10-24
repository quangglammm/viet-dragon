import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { menuDocument, postDocument, productDocument, slugsOf, UID } from "@/tests/fixtures/documents";
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

/** A copy of `record` without `key`. */
const omit = <T extends object>(record: T, key: keyof T): Partial<T> => Object.fromEntries(Object.entries(record).filter(([name]) => name !== key)) as Partial<T>;

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

  it("requires BOTH master languages, Vietnamese and English", () => {
    refuses(edit((d) => { delete d.i18n.vi; }), productDocumentSchema, "i18n.vi");
    refuses(edit((d) => { delete d.i18n.en; }), productDocumentSchema, "i18n.en");
    refuses(edit((d) => { delete d.shapes[0].i18n.vi; }), productDocumentSchema, "shapes.0.i18n.vi");
    refuses(edit((d) => { delete d.shapes[1].i18n.en; }), productDocumentSchema, "shapes.1.i18n.en");
    refuses(edit((d) => { delete d.options[0].i18n.vi?.name; }), productDocumentSchema, "options.0.i18n.vi.name");
    refuses(edit((d) => { delete d.options[0].i18n.en?.name; }), productDocumentSchema, "options.0.i18n.en.name");
  });

  it("does not require zh/ja/ko text: those languages fall back to English until translated", () => {
    expect(productDocumentSchema.safeParse(productDocument()).success).toBe(true);
    expect(Object.keys(productDocument().i18n)).toEqual(["vi", "en"]);
  });

  it("rejects blank text in any script, unknown languages and unknown fields", () => {
    refuses(edit((d) => { d.i18n.vi = { title: String.fromCodePoint(0xa0, 0x20, 0x3000) }; }), productDocumentSchema, "i18n.vi.title");
    refuses({ ...productDocument(), i18n: { ...productDocument().i18n, xx: { title: "x" } } }, productDocumentSchema, "i18n");
    refuses({ ...productDocument(), surprise: true }, productDocumentSchema, "");
    refuses(edit((d) => { d.shapes[0].i18n.vi = { name: "A5", description: "" }; }), productDocumentSchema, "shapes.0.i18n.vi.description");
  });

  it("rejects slugs that are not lowercase Latin kebab-case (in any language), and icon names with punctuation", () => {
    refuses(edit((d) => { d.slugs.vi.slug = "To Roi"; }), productDocumentSchema, "slugs.vi.slug");
    refuses(edit((d) => { d.slugs.zh.slug = "海报"; }), productDocumentSchema, "slugs.zh.slug");
    refuses(edit((d) => { d.shapes[0].slugs.ja.slug = "ポスター"; }), productDocumentSchema, "shapes.0.slugs.ja.slug");
    refuses(edit((d) => { d.options[0].icon = "Layers!"; }), productDocumentSchema, "options.0.icon");
  });

  it("needs a slug in EVERY language, and no language the site does not have", () => {
    refuses(edit((d) => { delete (d.slugs as Partial<typeof d.slugs>).ko; }), productDocumentSchema, "slugs.ko");
    refuses(edit((d) => { delete (d.options[0].slugs as Partial<(typeof d.options)[number]["slugs"]>).en; }), productDocumentSchema, "options.0.slugs.en");
    refuses({ ...productDocument(), slugs: { ...productDocument().slugs, xx: { slug: "x", aliases: [] } } }, productDocumentSchema, "slugs");
  });

  it("keeps ONE URL-segment namespace per language for shapes, options and their aliases", () => {
    refuses(edit((d) => { d.options[0].slugs.vi.slug = "a5"; }), productDocumentSchema, "options.0.slugs.vi.slug");
    refuses(edit((d) => { d.options[1].slugs.vi.aliases = ["kho-a4"]; }), productDocumentSchema, "options.1.slugs.vi.aliases.0");
    refuses(edit((d) => { d.options[0].slugs.en.slug = "a5-flyer"; }), productDocumentSchema, "options.0.slugs.en.slug");
  });

  it("lets the same slug text exist in two languages, and one slug per language differ", () => {
    // 'a5' is the Vietnamese slug of a shape; the same text as an ENGLISH option slug is a different namespace.
    expect(productDocumentSchema.safeParse(edit((d) => { d.options[0].slugs.en.slug = "a5"; })).success).toBe(true);
    expect(productDocumentSchema.safeParse(productDocument()).data?.slugs.vi.slug).not.toBe(productDocument().slugs.en.slug);
  });

  it("rejects duplicate uids and an alias equal to the canonical URL or to another alias, per language", () => {
    refuses(edit((d) => { d.options[0].uid = d.shapes[0].uid; }), productDocumentSchema, "uid");
    refuses(edit((d) => { d.slugs.vi.aliases = [{ category: "marketing", slug: "to-roi" }]; }), productDocumentSchema, "slugs.vi.aliases");
    refuses(edit((d) => { d.slugs.en.aliases = [{ category: "tet", slug: "x" }, { category: "tet", slug: "x" }]; }), productDocumentSchema, "slugs.en.aliases");
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
  it("refuses a column with no groups: a column is stored on its groups, so an empty one would vanish at publish", () => {
    const doc = menuDocument();
    doc.columns.push({ column: 2, groups: [] });
    refuses(doc, menuDocumentSchema, "columns.1");
    expect(menuDocumentSchema.safeParse({ ...doc, columns: [] }).success).toBe(true); // a menu with no column at all is fine
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
  it("requires Vietnamese and English, a real date, a slug per language and a distinct alias", () => {
    refuses({ ...postDocument(), i18n: { en: { title: "x", content: "y" } } }, postDocumentSchema, "i18n.vi");
    refuses({ ...postDocument(), i18n: { vi: { title: "x", content: "y" } } }, postDocumentSchema, "i18n.en");
    refuses({ ...postDocument(), publishedOn: "15/01/2026" }, postDocumentSchema, "publishedOn");
    const doc = postDocument();
    refuses({ ...doc, slugs: { ...doc.slugs, vi: { slug: "huong-dan-in-an", aliases: ["huong-dan-in-an"] } } }, postDocumentSchema, "slugs.vi.aliases");
    refuses({ ...doc, slugs: omit(doc.slugs, "ko") }, postDocumentSchema, "slugs.ko");
  });
});

describe("library documents", () => {
  it("identifies a spec item by kind and key", () => {
    const doc = { schema: 2, key: "technique/offset", isDefault: false, i18n: { vi: { label: "Offset" }, en: { label: "Offset" } } };
    expect(specItemDocumentSchema.safeParse(doc).success).toBe(true);
    refuses({ ...doc, key: "offset" }, specItemDocumentSchema, "key");
    refuses({ ...doc, key: "unknown/offset" }, specItemDocumentSchema, "key");
  });
  it.each([
    ["material", { schema: 2, key: "giay-kraft", icon: null }, { name: "Kraft" }],
    ["trait", { schema: 2, key: "glossy-coat", icon: "Sparkles" }, { label: "Glossy" }],
    ["unit", { schema: 2, key: "box" }, { label: "Box" }],
    ["post_category", { schema: 2, key: "tips" }, { label: "Tips" }],
  ] as const)("requires Vietnamese AND English on a %s (other languages are optional)", (type, base, text) => {
    const doc = (languages: readonly string[]) => ({ ...base, i18n: Object.fromEntries(languages.map((l) => [l, text])) });
    expect(parseDocument(type, doc(["vi", "en"])).success).toBe(true);
    expect(parseDocument(type, doc(["vi", "en", "zh"])).success).toBe(true);
    expect(parseDocument(type, doc(["en"])).success).toBe(false);
    expect(parseDocument(type, doc(["vi"])).success).toBe(false);
    expect(parseDocument(type, doc(["zh"])).success).toBe(false);
  });
  it("accepts a category with a slug in every language, and refuses one without", () => {
    const category = {
      schema: 2, key: "tet", slugs: slugsOf("an-pham-tet", "tet-publications", { vi: ["tet"] }), icon: "Gift", cover: null, ogImage: null, position: 3,
      i18n: { vi: { name: "Ấn phẩm Tết" }, en: { name: "Tet Publications" } },
    };
    expect(parseDocument("category", category).success).toBe(true);
    expect(parseDocument("category", { ...category, slugs: omit(category.slugs, "zh") }).success).toBe(false);
    expect(parseDocument("category", { ...category, slugs: slugsOf("Ấn phẩm", "tet-publications") }).success).toBe(false);
  });
  it("accepts a Fast Print item and a showcase item", () => {
    expect(
      parseDocument("fast_print_item", {
        schema: 2, uid: UID.product, key: "name-card", image: null, icon: "Zap", turnaroundHours: 2, fromPrice: 120000, unit: "box",
        position: 0, status: "published", i18n: { vi: { name: "Danh thiếp", tag: "2 giờ" }, en: { name: "Business cards", tag: "2 hours" } },
      }).success,
    ).toBe(true);
    expect(
      parseDocument("showcase_item", { schema: 2, uid: UID.post, key: "s1", media: "images/a.webp", aspect: "tall", position: 0, i18n: { vi: { label: "Ảnh" }, en: { label: "Photo" } } }).success,
    ).toBe(true);
  });
  it("holds a UI-copy namespace for every language side by side", () => {
    expect(parseDocument("site_message", { schema: 2, key: "hero", data: { vi: { title: "x" }, en: { title: "y" } } }).success).toBe(true);
    expect(parseDocument("site_message", { schema: 2, key: "hero.title", data: {} }).success).toBe(false);
  });

  describe("the texts of a UI-copy namespace", () => {
    const message = (data: Record<string, unknown>) => parseDocument("site_message", { schema: 2, key: "shopCategories", data });
    const issuesOf = (data: Record<string, unknown>) => (message(data).error?.issues ?? []).map((issue) => [issue.path.join("."), issue.message]);
    const base = { vi: { itemCount: "{count} sản phẩm", list: ["a", "b"] }, en: { itemCount: "{count} products", list: ["a", "b"] } };

    it("accepts a translation that keeps the variables of the Vietnamese text, and one that leaves out a variable", () => {
      expect(message({ ...base, zh: { itemCount: "{count} 个产品", list: ["甲", "乙"] } }).success).toBe(true);
      expect(message({ ...base, ja: { itemCount: "商品", list: ["", ""] } }).success).toBe(true);
    });

    it("refuses a variable the Vietnamese text does not have, naming the text and the language", () => {
      const issues = issuesOf({ ...base, zh: { itemCount: "{total} 个产品", list: ["甲", "乙"] } });
      expect(issues).toHaveLength(1);
      expect(issues[0][0]).toBe("data.zh.itemCount");
      expect(issues[0][1]).toContain("{count}");
      expect(issues[0][1]).toContain("{total}");
    });

    it("refuses braces that do not balance, in any language, Vietnamese included", () => {
      expect(issuesOf({ vi: { itemCount: "{count sản phẩm" }, en: { itemCount: "x" } })[0][0]).toBe("data.vi.itemCount");
      expect(issuesOf({ ...base, ko: { itemCount: "{count} 제품}", list: ["a", "b"] } })[0][0]).toBe("data.ko.itemCount");
    });

    it("lets only zh/ja/ko leave a text empty, and names a text in a list by its position", () => {
      expect(message({ ...base, ko: { itemCount: "", list: ["", "b"] } }).success).toBe(true);
      expect(issuesOf({ vi: { ...base.vi, list: ["a", " "] }, en: base.en })).toEqual([["data.vi.list.1", "Không được để trống."]]);
      expect(issuesOf({ vi: base.vi, en: { ...base.en, itemCount: "" } })).toEqual([["data.en.itemCount", "Không được để trống."]]);
    });

    it("does not judge variables of a text the Vietnamese tree does not have", () => {
      expect(message({ vi: { a: "x" }, en: { a: "x", extra: "{anything}" } }).success).toBe(true);
    });
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

describe("a required text that is missing", () => {
  it("says it is required, in Vietnamese, instead of zod's 'expected string, received undefined'", () => {
    const post = postDocument() as unknown as { i18n: { vi: Record<string, unknown> } };
    delete post.i18n.vi.content;
    const result = parseDocument("post", post);
    expect(result.error?.issues.map((issue) => [issue.path.join("."), issue.message])).toEqual([["i18n.vi.content", "Bắt buộc phải nhập."]]);
  });
});
