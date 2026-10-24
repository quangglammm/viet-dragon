import { describe, expect, it } from "vitest";
import { DOCUMENT_SCHEMAS, DOCUMENT_SCHEMA } from "../schemas";
import { CREATABLE_TYPES, buildCreateRequest, vietnamToday, type CreateForm } from "./templates";

const form = (overrides: Partial<CreateForm> = {}): CreateForm => ({ nameVi: "Giấy kraft", nameEn: "Kraft paper", key: "giay-kraft", ...overrides });

describe("buildCreateRequest", () => {
  it("builds a starting document for each creatable type that becomes valid once completed", () => {
    for (const type of CREATABLE_TYPES) {
      const request = buildCreateRequest(type, form({ specKind: "technique", category: "marketing" }));
      expect(request.ok, type).toBe(true);
      if (!request.ok) continue;
      // What the API adds on creation, so the document can be judged: identity fields and the schema number.
      const identity = request.key === undefined ? { uid: "11111111-1111-4111-8111-111111111111" } : { key: request.key };
      const texts = request.snapshot.i18n as Record<string, Record<string, string>>;
      // What the editor still has to add: a showcase's image, and the body text of a post (in both master languages).
      const added =
        type === "showcase_item"
          ? { media: "images/a.webp" }
          : type === "post"
            ? { i18n: { vi: { ...texts.vi, content: "Nội dung." }, en: { ...texts.en, content: "Content." } } }
            : {};
      const completed = { schema: DOCUMENT_SCHEMA, ...identity, ...request.snapshot, ...added };
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

  it("builds a post from its titles: a post category, a slug per language, today's date, plain text, no content yet", () => {
    const request = buildCreateRequest("post", form({ nameVi: "Mẹo in nhanh", nameEn: "Quick printing tips", key: "", category: "meo-in" }), "2026-10-24");
    expect(request).toMatchObject({
      ok: true,
      snapshot: { category: "meo-in", publishedOn: "2026-10-24", contentFormat: "plain", status: "published", readTimeMin: null, cover: null, i18n: { vi: { title: "Mẹo in nhanh" }, en: { title: "Quick printing tips" } } },
    });
    expect(request.ok && request.key).toBeUndefined();
    if (request.ok) {
      const slugs = request.snapshot.slugs as Record<string, { slug: string }>;
      expect(Object.values(slugs).map((entry) => entry.slug)).toEqual(["meo-in-nhanh", "quick-printing-tips", "quick-printing-tips", "quick-printing-tips", "quick-printing-tips"]);
      expect(request.snapshot.i18n).not.toHaveProperty("vi.content");
    }
  });

  it("asks a post for a category, and dates it in Vietnam, not in the browser's zone", () => {
    expect(buildCreateRequest("post", form({ key: "", category: "" }))).toEqual({ ok: false, message: "Hãy chọn chuyên mục." });
    expect(vietnamToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("explains what is wrong in Vietnamese", () => {
    expect(buildCreateRequest("material", form({ nameVi: " " }))).toEqual({ ok: false, message: "Hãy nhập tên tiếng Việt." });
    expect(buildCreateRequest("material", form({ key: "Giấy Kraft" }))).toMatchObject({ ok: false, message: expect.stringContaining("chữ thường") });
    expect(buildCreateRequest("spec_item", form())).toEqual({ ok: false, message: "Hãy chọn loại thông số." });
    expect(buildCreateRequest("product", form())).toMatchObject({ ok: false });
  });
});
