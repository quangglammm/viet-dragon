import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Document } from "@/lib/content/editor/api";
import { ENTITY_META } from "@/lib/content/editor/entity-meta";
import type { Vocabulary } from "@/lib/content/editor/vocabulary";
import type { DraftEntityType } from "@/lib/content/entity-types";
import type { Issue } from "@/lib/content/errors";
import { FIELD_REGISTRY } from "@/lib/content/field-registry";
import { DOCUMENT_SCHEMAS, type LocaleCode } from "@/lib/content/schemas";
import { EditorProvider } from "../editor-context";
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

const VOCAB: Vocabulary = { unit: [{ value: "hop", label: "Hộp" }], material: [{ value: "giay-kraft", label: "Giấy kraft" }] };

function render(type: DraftEntityType, options: { document?: Document; language?: LocaleCode; readOnly?: boolean; issues?: Issue[] } = {}): string {
  const Form = FORMS[type];
  if (!Form) throw new Error(`no form for ${type}`);
  return renderToStaticMarkup(
    createElement(EditorProvider, { type, document: options.document ?? SAMPLES[type]!, language: options.language ?? "vi", readOnly: options.readOnly ?? false, issues: options.issues ?? [], vocab: VOCAB, onChange: () => undefined }, createElement(Form)),
  );
}

const FORM_TYPES = Object.keys(FORMS) as DraftEntityType[];

describe("the editors that exist", () => {
  it("are exactly the types marked editable", () => {
    expect(FORM_TYPES.sort()).toEqual(Object.keys(ENTITY_META).filter((type) => ENTITY_META[type as DraftEntityType].editable).sort());
  });

  it.each(FORM_TYPES)("%s: the sample document is a valid document (so the coverage test is about real data)", (type) => {
    expect(DOCUMENT_SCHEMAS[type].safeParse(SAMPLES[type]).success).toBe(true);
  });

  it.each(FORM_TYPES)("%s: draws a control for every field of the registry", (type) => {
    const markup = render(type);
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
