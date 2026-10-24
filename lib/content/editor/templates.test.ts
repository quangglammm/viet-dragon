import { describe, expect, it } from "vitest";
import { DOCUMENT_SCHEMAS, DOCUMENT_SCHEMA } from "../schemas";
import { CREATABLE_TYPES, buildCreateRequest, type CreateForm } from "./templates";

const form = (overrides: Partial<CreateForm> = {}): CreateForm => ({ nameVi: "Giấy kraft", nameEn: "Kraft paper", key: "giay-kraft", ...overrides });

describe("buildCreateRequest", () => {
  it("builds a starting document for each creatable type that becomes valid once completed", () => {
    for (const type of CREATABLE_TYPES) {
      const request = buildCreateRequest(type, form({ specKind: "technique", category: "marketing" }));
      expect(request.ok, type).toBe(true);
      if (!request.ok) continue;
      // What the API adds on creation, so the document can be judged: identity fields and the schema number.
      const identity = request.key === undefined ? { uid: "11111111-1111-4111-8111-111111111111" } : { key: request.key };
      const completed = { schema: DOCUMENT_SCHEMA, ...identity, ...request.snapshot, ...(type === "showcase_item" ? { media: "images/a.webp" } : {}) };
      const parsed = DOCUMENT_SCHEMAS[type].safeParse(completed);
      expect(parsed.success, `${type}: ${JSON.stringify(parsed.error?.issues)}`).toBe(true);
    }
  });

  it("puts the key where the API wants it: the identity for vocabulary, an attribute for Fast Print and showcase items", () => {
    expect(buildCreateRequest("material", form())).toMatchObject({ ok: true, key: "giay-kraft" });
    expect(buildCreateRequest("spec_item", form({ specKind: "finishing", key: "can-mang" }))).toMatchObject({ ok: true, key: "finishing/can-mang" });
    const fast = buildCreateRequest("fast_print_item", form());
    expect(fast).toMatchObject({ ok: true, snapshot: { key: "giay-kraft" } });
    expect(fast.ok && fast.key).toBeUndefined();
  });

  it("leaves out a language whose name was not typed instead of storing a blank", () => {
    const request = buildCreateRequest("unit", form({ nameEn: "  " }));
    expect(request).toMatchObject({ ok: true, snapshot: { i18n: { vi: { label: "Giấy kraft" } } } });
    expect(request.ok && request.snapshot.i18n).not.toHaveProperty("en");
  });

  it("builds a product from its names: a category, a slug per language (zh/ja/ko = English), nothing else yet", () => {
    const request = buildCreateRequest("product", form({ nameVi: "Tờ rơi", nameEn: "Flyers", key: "", category: "marketing" }));
    expect(request).toMatchObject({ ok: true, snapshot: { category: "marketing", status: "published", shapes: [], options: [], sizes: [], specs: [], i18n: { vi: { title: "Tờ rơi" }, en: { title: "Flyers" } } } });
    expect(request.ok && request.key).toBeUndefined();
    if (request.ok) {
      const slugs = request.snapshot.slugs as Record<string, { slug: string; aliases: string[] }>;
      expect(Object.entries(slugs).map(([locale, entry]) => [locale, entry.slug])).toEqual([["vi", "to-roi"], ["en", "flyers"], ["zh", "flyers"], ["ja", "flyers"], ["ko", "flyers"]]);
    }
  });

  it("asks a product for a category, not for a key", () => {
    expect(buildCreateRequest("product", form({ key: "", category: "" }))).toEqual({ ok: false, message: "Hãy chọn danh mục." });
  });

  it("explains what is wrong in Vietnamese", () => {
    expect(buildCreateRequest("material", form({ nameVi: " " }))).toEqual({ ok: false, message: "Hãy nhập tên tiếng Việt." });
    expect(buildCreateRequest("material", form({ key: "Giấy Kraft" }))).toMatchObject({ ok: false, message: expect.stringContaining("chữ thường") });
    expect(buildCreateRequest("spec_item", form())).toEqual({ ok: false, message: "Hãy chọn loại thông số." });
    expect(buildCreateRequest("product", form())).toMatchObject({ ok: false });
  });
});
