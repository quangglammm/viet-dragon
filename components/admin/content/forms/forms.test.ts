import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Document } from "@/lib/content/editor/api";
import { ENTITY_META } from "@/lib/content/editor/entity-meta";
import type { Vocabulary } from "@/lib/content/editor/vocabulary";
import type { DraftEntityType } from "@/lib/content/entity-types";
import type { Issue } from "@/lib/content/errors";
import { FIELD_REGISTRY } from "@/lib/content/field-registry";
import { PRODUCT_SECTIONS, type ProductSection } from "@/lib/content/editor/product-sections";
import { DOCUMENT_SCHEMAS, type LocaleCode } from "@/lib/content/schemas";
import { UID as FIXTURE_UID, menuDocument, postDocument, productDocument, slugsOf } from "@/tests/fixtures/documents";
import { EditorProvider, type FocusRequest } from "../editor-context";
import { FORMS } from ".";

// "Every field of every document has a control": each editor is rendered on a fully populated document, and every path of the
// field registry must show up as a `data-field` in what it draws. Together with the registry test (which ties the registry to the
// zod schemas) this means a field cannot exist in a document without an editor control.

const UID = "11111111-1111-4111-8111-111111111111";
const LABELS = (vi: string, en: string) => ({ vi: { label: vi }, en: { label: en }, zh: { label: "标签" } });

const SAMPLES: Partial<Record<DraftEntityType, Document>> = {
  material: { schema: 2, key: "giay-kraft", icon: "Leaf", i18n: { vi: { name: "Giấy kraft" }, en: { name: "Kraft paper" } } },
  trait: { schema: 2, key: "glossy-coat", icon: "Sparkles", i18n: { vi: { label: "Bóng", description: "Mặt bóng" }, en: { label: "Glossy", description: "Shiny" } } },
  unit: { schema: 2, key: "hop", i18n: LABELS("Hộp", "Box") },
  spec_item: { schema: 2, key: "technique/offset", isDefault: true, i18n: LABELS("Offset", "Offset") },
  post_category: { schema: 2, key: "meo-in", i18n: LABELS("Mẹo in", "Tips") },
  fast_print_item: {
    schema: 2,
    uid: UID,
    key: "name-card",
    image: "images/product/a.webp",
    icon: "Zap",
    turnaroundHours: 24,
    fromPrice: 120000,
    unit: "hop",
    position: 1,
    status: "published",
    i18n: { vi: { name: "Danh thiếp", tag: "Nhanh", description: "In trong ngày" }, en: { name: "Name cards", tag: "Fast", description: "Same day" } },
  },
  showcase_item: { schema: 2, uid: UID, key: "mau-1", media: "images/product/a.webp", aspect: "wide", position: 0, i18n: LABELS("Mẫu 1", "Sample 1") },
};

/** The fixture product with every optional field filled and an old URL at each level, so every control has something to draw. */
function fullProduct(): Document {
  const product = productDocument();
  product.ogImage = "images/product/og.webp";
  product.i18n.vi = { title: "Tờ rơi", description: "Mô tả", seoTitle: "SEO", seoDescription: "Mô tả SEO" };
  product.shapes[0].ogImage = "images/product/og-shape.webp";
  product.shapes[0].i18n.vi = { name: "A5", description: "Khổ A5", badge: "Mới", seoTitle: "SEO", seoDescription: "Mô tả" };
  product.shapes[1].slugs.vi.aliases = ["kho-a4"];
  const option = product.options[0];
  option.slugs.vi.aliases = ["chat-lieu-cu"];
  option.unit = "hop";
  option.ogImage = "images/product/og-option.webp";
  option.images = { default: ["images/product/a.webp"], pure: ["images/product/b.webp"] };
  option.i18n.vi = { name: "Giấy loại C", cardTitle: "Loại C", tagline: "Bóng đẹp", seoTitle: "SEO", seoDescription: "Mô tả" };
  product.sizes[0].w = 210;
  product.sizes[0].h = 297;
  return product as unknown as Document;
}

/** The fixture post with every optional field filled (an excerpt and SEO texts in each master language, an og image). */
function fullPost(): Document {
  const post = postDocument();
  post.ogImage = "images/blog/og.webp";
  post.cover = "images/blog/a.webp";
  post.i18n.vi = { title: "Hướng dẫn in ấn", excerpt: "Tóm tắt", content: "Nội dung bài viết.", seoTitle: "SEO", seoDescription: "Mô tả SEO" };
  post.i18n.en = { title: "Printing guide", excerpt: "Short", content: "Body.", seoTitle: "SEO", seoDescription: "SEO text" };
  return post as unknown as Document;
}

const SAMPLE_CATEGORY: Document = {
  schema: 2,
  key: "marketing",
  slugs: slugsOf("tiep-thi", "marketing", { vi: ["marketing-cu"] }),
  icon: "Megaphone",
  cover: "images/category/a.webp",
  ogImage: "images/category/og.webp",
  position: 0,
  i18n: { vi: { name: "Tiếp thị", description: "Ấn phẩm tiếp thị", seoTitle: "SEO", seoDescription: "Mô tả" }, en: { name: "Marketing", description: "Marketing prints" } },
} as unknown as Document;

/** A UI-copy namespace in three languages: a top-level text, a list of objects, a plain list, a text with a variable, and a gap in zh. */
const SAMPLE_MESSAGE: Document = {
  schema: 2,
  key: "faq",
  data: {
    vi: { title: "Câu hỏi thường gặp", count: "{count} câu hỏi", items: [{ q: "In bao lâu?", a: "Từ 24 giờ." }], checklist: ["Miễn phí thiết kế"] },
    en: { title: "FAQ", count: "{count} questions", items: [{ q: "How long?", a: "From 24 hours." }], checklist: ["Free design"] },
    zh: { title: "常见问题", count: "{count} 个问题", items: [{ q: "多久?", a: "" }], checklist: [""] },
  },
};

/** The fixture menu with every optional field filled: a label and description on the group, an image, a label on the first item. */
function fullMenu(): Document {
  const menu = menuDocument();
  const group = menu.columns[0].groups[0];
  group.image = "images/menu/group.webp";
  group.i18n.vi = { label: "Tờ rơi & Flyers", description: "In tờ rơi nhanh" };
  group.items[0].i18n = { vi: "Khổ A5" };
  return menu as unknown as Document;
}

const SAMPLES_WITH_PRODUCT: Partial<Record<DraftEntityType, Document>> = { ...SAMPLES, product: fullProduct(), post: fullPost(), category: SAMPLE_CATEGORY, site_message: SAMPLE_MESSAGE, menu: fullMenu() };

const VOCAB: Vocabulary = {
  unit: [{ value: "hop", label: "Hộp" }],
  material: [{ value: "giay-kraft", label: "Giấy kraft" }, { value: "giay-loai-c", label: "Giấy loại C" }],
  category: [{ value: "marketing", label: "Tiếp thị" }, { value: "tet", label: "Ấn phẩm Tết" }],
  post_category: [{ value: "tips", label: "Mẹo in" }, { value: "news", label: "Tin tức" }],
  // A menu picks among the products of its category and their shapes and options (the fixture's uids).
  product: [{ value: FIXTURE_UID.product, label: "Tờ rơi" }, { value: "22222222-2222-4222-8222-222222222222", label: "Danh thiếp" }],
  shape: [{ value: FIXTURE_UID.shapeA5, label: "A5", group: FIXTURE_UID.product }, { value: "s-other", label: "A4", group: FIXTURE_UID.product }, { value: "s-foreign", label: "Hộp", group: "22222222-2222-4222-8222-222222222222" }],
  option: [{ value: FIXTURE_UID.option, label: "Giấy C", group: FIXTURE_UID.product }],
  trait: [{ value: "glossy-coat", label: "Bóng" }],
  spec_item: [{ value: "technique/offset", label: "Offset" }, { value: "finishing/matte-lamination", label: "Cán màng mờ" }],
};

type RenderOptions = {
  document?: Document;
  baseline?: Document | null;
  language?: LocaleCode;
  readOnly?: boolean;
  issues?: Issue[];
  onReleaseAlias?: () => void;
  focus?: FocusRequest;
  formProps?: { section?: ProductSection; expandAll?: boolean };
};

function render(type: DraftEntityType, options: RenderOptions = {}): string {
  const Form = FORMS[type] as ComponentType<Record<string, unknown>> | undefined;
  if (!Form) throw new Error(`no form for ${type}`);
  return renderToStaticMarkup(
    createElement(
      EditorProvider,
      { type, document: options.document ?? SAMPLES_WITH_PRODUCT[type]!, baseline: options.baseline ?? null, language: options.language ?? "vi", readOnly: options.readOnly ?? false, issues: options.issues ?? [], vocab: VOCAB, focus: options.focus, onReleaseAlias: options.onReleaseAlias, onChange: () => undefined },
      createElement(Form, options.formProps),
    ),
  );
}

/** Every part of a form: the product is drawn tab by tab, with all its cards open. */
function renderEverything(type: DraftEntityType): string {
  if (type === "menu") return render(type, { formProps: { expandAll: true } });
  if (type !== "product") return render(type);
  return PRODUCT_SECTIONS.map(({ id }) => render(type, { formProps: { section: id, expandAll: true } })).join("\n");
}

const FORM_TYPES = Object.keys(FORMS) as DraftEntityType[];

describe("the editors that exist", () => {
  it("are exactly the types marked editable", () => {
    expect(FORM_TYPES.sort()).toEqual(Object.keys(ENTITY_META).filter((type) => ENTITY_META[type as DraftEntityType].editable).sort());
  });

  it.each(FORM_TYPES)("%s: the sample document is a valid document (so the coverage test is about real data)", (type) => {
    const parsed = DOCUMENT_SCHEMAS[type].safeParse(SAMPLES_WITH_PRODUCT[type]);
    expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
  });

  it.each(FORM_TYPES)("%s: draws a control for every field of the registry", (type) => {
    const markup = renderEverything(type);
    const missing = FIELD_REGISTRY[type].filter((field) => !markup.includes(`data-field="${field.path}"`)).map((field) => field.path);
    expect(missing).toEqual([]);
  });
});

describe("a control", () => {
  it("shows the stored value", () => {
    expect(render("material")).toContain('value="Giấy kraft"');
  });

  it("is disabled while the live document is shown instead of a draft", () => {
    const markup = render("material", { readOnly: true });
    expect(markup).toMatch(/<input[^>]*disabled/);
    expect(render("material")).not.toMatch(/<input[^>]*disabled/);
  });

  it("shows the document's complaint next to the field it is about", () => {
    const markup = render("material", { issues: [{ path: "i18n.vi.name", message: "Không được để trống." }] });
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Không được để trống.");
    expect(markup).toContain('aria-invalid="true"');
  });

  it("offers the English text to a language that has none (zh/ja/ko fall back to English)", () => {
    const markup = render("material", { language: "zh" });
    expect(markup).toContain('placeholder="Kraft paper"');
    expect(markup).toContain("Sao chép từ tiếng Anh");
  });

  it("does not offer the English fallback to Vietnamese or English themselves, nor once the text exists", () => {
    expect(render("material", { language: "vi" })).not.toContain("Sao chép từ tiếng Anh");
    expect(render("material", { language: "en" })).not.toContain("Sao chép từ tiếng Anh");
    const translated = { ...SAMPLES.material!, i18n: { ...(SAMPLES.material!.i18n as object), zh: { name: "牛皮纸" } } } as Document;
    expect(render("material", { language: "zh", document: translated })).not.toContain("Sao chép từ tiếng Anh");
  });

  it("keeps a choice whose record no longer exists visible instead of silently clearing it", () => {
    const document = { ...SAMPLES.fast_print_item!, unit: "da-xoa" } as Document;
    expect(render("fast_print_item", { document })).toContain("da-xoa (không còn tồn tại)");
  });

  it("names the key of a record as context it cannot change", () => {
    expect(render("material")).toContain("giay-kraft");
    expect(render("material")).toContain("không đổi được");
  });
});

describe("the product editor", () => {
  const section = (id: ProductSection, options: RenderOptions = {}) => render("product", { ...options, formProps: { section: id, expandAll: options.formProps?.expandAll ?? false } });

  it("has one tab per part, the current one selected", () => {
    const markup = section("options");
    for (const { label } of PRODUCT_SECTIONS) expect(markup).toContain(label.replace("&", "&amp;")); // the markup is HTML-escaped
    expect(markup).toMatch(/aria-selected="true"[^>]*>[^<]*Chất liệu/);
  });

  it("shows how many problems a tab holds", () => {
    const markup = section("general", { issues: [{ path: "options[0].material", message: "x" }, { path: "options[1].shape", message: "y" }, { path: "sizes[0].tier", message: "z" }] });
    expect(markup).toContain(">2</span>"); // two in the options tab
    expect(markup).toContain(">1</span>"); // one in sizes
  });

  it("keeps the cards of shapes and options closed until opened (a product has dozens)", () => {
    expect(section("options")).not.toContain('data-field="options[].prices.base"');
    expect(section("options", { formProps: { expandAll: true } })).toContain('data-field="options[].prices.base"');
    expect(section("shapes")).not.toContain('data-field="shapes[].i18n.*.name"');
  });

  it("opens the card a problem points into, and only that one", () => {
    const priceFields = (markup: string) => markup.match(/data-field="options\[\]\.prices\.base"/g)?.length ?? 0;
    expect(priceFields(section("options", { focus: { path: "options[0].prices.base", nonce: 1 } }))).toBe(1);
    expect(priceFields(section("options", { focus: { path: "shapes[0].i18n.en", nonce: 1 } }))).toBe(0); // a problem of another list opens no option
    expect(section("shapes", { focus: { path: "shapes[0].i18n.en", nonce: 1 } })).toContain('data-field="shapes[].i18n.*.name"');
  });

  it("groups the materials by where they are offered: the whole product, then each shape", () => {
    const markup = section("options");
    expect(markup).toContain("Cả sản phẩm");
    expect(markup).toContain("Hình thức: A5");
  });

  it("warns that moving a published product to another category takes it out of the old menu", () => {
    const published = { ...(fullProduct() as Record<string, unknown>), category: "marketing" } as Document;
    const draft = { ...(fullProduct() as Record<string, unknown>), category: "tet" } as Document;
    expect(section("general", { document: draft, baseline: published })).toContain("rời khỏi menu của danh mục cũ");
    expect(section("general", { document: published, baseline: published })).not.toContain("rời khỏi menu");
  });

  it("offers to let an old URL go only when asked to (the live product, no draft open)", () => {
    expect(section("urls", { onReleaseAlias: () => undefined })).toMatch(/>Gỡ</);
    expect(section("urls")).not.toMatch(/>Gỡ</);
  });

  it("lists a product's old URLs with their category, and a shape's as plain slugs", () => {
    expect(section("urls")).toContain("marketing");
    expect(section("shapes", { formProps: { expandAll: true } })).toContain("kho-a4");
  });

  it("lists only the spec items of the chosen kind", () => {
    const markup = section("specs");
    expect(markup).toContain("Offset");
    expect(markup).toContain("Cán màng mờ");
  });

  it("is read-only while the live document is shown: no add, remove or reorder buttons", () => {
    const markup = section("options", { readOnly: true });
    expect(markup).not.toContain("Thêm chất liệu");
    expect(markup).not.toContain("Xóa chất liệu");
    expect(markup).not.toContain("Lên trên");
  });

  it("knows the fixture's uids (the sample is the shared fixture, not a copy)", () => {
    expect(JSON.stringify(fullProduct())).toContain(FIXTURE_UID.product);
  });
});

describe("the post editor", () => {
  const post = (overrides: Record<string, unknown> = {}, options: RenderOptions = {}) => render("post", { ...options, document: { ...fullPost(), ...overrides } as Document });

  it("offers the text boxes of the language being edited, with the content box tall and the format choice beside it", () => {
    const markup = post();
    expect(markup).toContain('data-path="i18n.vi.content"');
    expect(markup).toMatch(/<textarea[^>]*rows="18"/);
    expect(markup).toContain("Markdown");
  });

  it("files the post under a post category and draws the publication date as a date box", () => {
    const markup = post();
    expect(markup).toContain("Mẹo in");
    expect(markup).toMatch(/type="date"[^>]*value="2026-01-15"|value="2026-01-15"[^>]*type="date"/);
  });

  it("lists the old URLs of the language being edited, never offering to release one", () => {
    expect(post()).toContain("in-an-co-ban");
    expect(post({}, { onReleaseAlias: () => undefined })).not.toMatch(/>Gỡ</);
  });

  it("is read-only while the live post is shown", () => {
    expect(post({}, { readOnly: true })).not.toMatch(/<input(?![^>]*disabled)[^>]*value="Hướng dẫn in ấn"/);
  });
});

describe("the category editor", () => {
  const category = (document: Document = SAMPLE_CATEGORY, options: RenderOptions = {}) => render("category", { ...options, document });
  const renamed = { ...(SAMPLE_CATEGORY as Record<string, unknown>), slugs: slugsOf("tiep-thi-moi", "marketing") } as Document;

  it("shows the code that cannot change", () => {
    expect(category()).toContain("marketing");
    expect(category()).toContain("không đổi được");
  });

  it("warns that a new slug moves the address of every product in the category — only when the slug was changed", () => {
    expect(category(renamed, { baseline: SAMPLE_CATEGORY })).toContain("mọi sản phẩm trong danh mục");
    expect(category(SAMPLE_CATEGORY, { baseline: SAMPLE_CATEGORY })).not.toContain("mọi sản phẩm trong danh mục");
    expect(category(renamed)).not.toContain("mọi sản phẩm trong danh mục"); // a new category has no published address to move
  });
});

describe("the UI-copy editor", () => {
  const message = (options: RenderOptions = {}) => render("site_message", { ...options, document: options.document ?? SAMPLE_MESSAGE });

  it("draws one box per text the namespace has, whatever the language — the structure is the site's", () => {
    for (const language of ["vi", "zh"] as const) {
      const markup = message({ language });
      for (const path of ["title", "count", "items[0].q", "items[0].a", "checklist[0]"]) expect(markup, `${language} ${path}`).toContain(`data-path="data.${language}.${path}"`);
    }
  });

  it("groups the boxes: top-level texts first, then each list", () => {
    const markup = message();
    expect(markup.indexOf("Nội dung chung")).toBeLessThan(markup.indexOf(">items<"));
    expect(markup.indexOf(">items<")).toBeLessThan(markup.indexOf(">checklist<"));
  });

  it("shows the Vietnamese text to translate from on every other language, and the variables to keep", () => {
    expect(message({ language: "zh" })).toContain("Tiếng Việt: Câu hỏi thường gặp");
    expect(message({ language: "vi" })).not.toContain("Tiếng Việt: Câu hỏi thường gặp");
    expect(message({ language: "zh" })).toContain("Giữ nguyên {count} trong câu.");
  });

  it("offers the English text as the fallback for a line a language has not translated yet", () => {
    const markup = message({ language: "zh" });
    expect(markup).toContain('placeholder="How long?"'); // items[0].q is translated; items[0].a is not
    expect(markup).toContain('placeholder="From 24 hours."');
    expect(markup).toContain("Sao chép từ tiếng Anh");
  });

  it("calls a line by its place, not by an internal name", () => {
    const markup = message();
    expect(markup).toContain("items › 1 › q");
    expect(markup).toContain("checklist › 1");
  });
});

describe("the menu editor", () => {
  const menu = (options: RenderOptions = {}) => render("menu", { ...options, document: options.document ?? fullMenu() });
  const open = { formProps: { expandAll: true } };

  it("numbers the columns and names each group by its product", () => {
    const markup = menu(open);
    expect(markup).toContain("Cột 1");
    expect(markup).toContain("Tờ rơi");
    expect(markup).toContain("1 sản phẩm");
  });

  it("keeps the groups closed until opened: a menu has dozens of links", () => {
    expect(menu()).not.toContain('data-field="columns[].groups[].image"');
    expect(menu(open)).toContain('data-field="columns[].groups[].image"');
  });

  it("opens the group a problem points into", () => {
    const markup = menu({ focus: { path: "columns[0].groups[0].items[1].image", nonce: 1 } });
    expect(markup).toContain('data-field="columns[].groups[].items[].image"');
  });

  it("offers a link only to the shapes and options of the group's own product, shapes and options apart", () => {
    const markup = menu(open);
    expect(markup).toContain('<optgroup label="Hình thức">');
    expect(markup).toContain('<optgroup label="Chất liệu">');
    expect(markup).toContain(`value="shape:${FIXTURE_UID.shapeA5}"`);
    expect(markup).toContain('value="shape:s-other"');
    expect(markup).not.toContain("s-foreign"); // a shape of another product
  });

  it("says what a link points at, and tags the fast ones", () => {
    const markup = menu(open);
    expect(markup).toContain("Hình thức: A5");
    expect(markup).toContain("Chất liệu: Giấy C");
    expect(markup).toContain("In nhanh");
  });

  it("keeps a link whose target no longer exists visible instead of silently clearing it", () => {
    const stale = fullMenu() as unknown as { columns: { groups: { items: { target: unknown }[] }[] }[] };
    stale.columns[0].groups[0].items[0].target = { shape: "gone" };
    expect(menu({ ...open, document: stale as unknown as Document })).toContain("(không còn tồn tại)");
  });

  it("shows the column number but does not let it be typed, and does not let a group's product be changed", () => {
    const markup = menu(open);
    expect(markup).toMatch(/<input[^>]*disabled=""[^>]*value="1"|<input[^>]*value="1"[^>]*disabled=""/);
    expect(markup).toMatch(/<select[^>]*disabled=""[^>]*>[^]*?Tờ rơi/);
  });

  it("offers the products that have no group yet, and to move a group to another column", () => {
    const two = fullMenu() as unknown as { columns: unknown[] };
    two.columns.push({ column: 2, groups: [] });
    const markup = menu({ ...open, document: two as unknown as Document });
    expect(markup).toContain("Danh thiếp"); // not in the menu yet
    expect(markup).toContain("Chuyển sang cột khác");
    expect(markup).toContain("Cột 2");
  });

  it("is read-only while the live menu is shown: nothing to add, remove, move or reorder", () => {
    const markup = menu({ ...open, readOnly: true });
    expect(markup).not.toContain("Thêm cột");
    expect(markup).not.toContain("Thêm mục");
    expect(markup).not.toContain("Thêm sản phẩm vào cột này");
    expect(markup).not.toContain('aria-label="Xóa cột"');
  });
});
