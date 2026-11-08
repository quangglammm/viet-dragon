import type { DraftEntityType } from "../entity-types";
import { isEntityId } from "../identity";
import { LOCALES, SPEC_KIND_VALUES } from "../schemas";
import type { Document } from "./api";
import type { Json } from "./paths";
import { suggestSlugs } from "./slugs";

// What "Tạo mới" sends: the smallest document that is a start, not a finished record. Everything else is filled in the editor, where
// the advice says what is still missing. Names are typed in the dialog because they are what the list shows and the key is built from.

export const CREATABLE_TYPES: readonly DraftEntityType[] = ["product", "post", "material", "trait", "unit", "spec_item", "post_category", "fast_print_item", "showcase_item"];

export interface CreateForm {
  nameVi: string;
  nameEn: string;
  /** The immutable key (or, for Fast Print and showcase items, their code). */
  key: string;
  /** Spec items only. */
  specKind?: (typeof SPEC_KIND_VALUES)[number];
  /** Products and posts: the category the record is filed under (a product category, a post category). */
  category?: string;
}

export type CreateRequest = { ok: true; key?: string; snapshot: Document } | { ok: false; message: string };

const texts = (field: string, form: CreateForm): { [language: string]: Json } => ({
  ...(form.nameVi.trim() ? { vi: { [field]: form.nameVi.trim() } } : {}),
  ...(form.nameEn.trim() ? { en: { [field]: form.nameEn.trim() } } : {}),
});

/** Today in Vietnam as `YYYY-MM-DD` (the date a new post is published on; the browser's own zone would be wrong near midnight). */
export const vietnamToday = (): string => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

const BAD_KEY = "Mã chỉ gồm chữ thường không dấu (a-z), số và dấu gạch ngang, ví dụ: giay-kraft.";

function productRequest(form: CreateForm): CreateRequest {
  if (!form.category) return { ok: false, message: "Hãy chọn danh mục." };
  const slugs = suggestSlugs({ vi: form.nameVi, en: form.nameEn });
  return {
    ok: true,
    snapshot: {
      category: form.category,
      slugs: Object.fromEntries(LOCALES.map((locale) => [locale, { slug: slugs[locale], aliases: [] }])),
      status: "published",
      position: 0,
      cover: null,
      ogImage: null,
      i18n: texts("title", form),
      shapes: [],
      options: [],
      sizes: [],
      specs: [],
    },
  };
}

/** A post: its URLs are built from its titles; the text itself is written in the editor (the advice says «Nội dung» is still missing). */
function postRequest(form: CreateForm, today: string): CreateRequest {
  if (!form.category) return { ok: false, message: "Hãy chọn chuyên mục." };
  const slugs = suggestSlugs({ vi: form.nameVi, en: form.nameEn });
  return {
    ok: true,
    snapshot: {
      category: form.category,
      slugs: Object.fromEntries(LOCALES.map((locale) => [locale, { slug: slugs[locale], aliases: [] }])),
      publishedOn: today,
      readTimeMin: null,
      cover: null,
      ogImage: null,
      contentFormat: "plain",
      status: "published",
      i18n: texts("title", form),
    },
  };
}

export function buildCreateRequest(type: DraftEntityType, form: CreateForm, today: string = vietnamToday()): CreateRequest {
  if (!form.nameVi.trim()) return { ok: false, message: "Hãy nhập tên tiếng Việt." };
  // A product or a post is identified by a generated uid and its URLs are built from its names: there is no key to type.
  if (type === "product") return productRequest(form);
  if (type === "post") return postRequest(form, today);
  const key = form.key.trim();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) return { ok: false, message: BAD_KEY };

  switch (type) {
    case "material":
      return { ok: true, key, snapshot: { icon: null, i18n: texts("name", form) } };
    case "trait":
      return { ok: true, key, snapshot: { icon: "Sparkles", i18n: texts("label", form) } };
    case "unit":
    case "post_category":
      return { ok: true, key, snapshot: { i18n: texts("label", form) } };
    case "spec_item": {
      if (!form.specKind) return { ok: false, message: "Hãy chọn loại thông số." };
      const specKey = `${form.specKind}/${key}`;
      return isEntityId("spec_item", specKey) ? { ok: true, key: specKey, snapshot: { isDefault: false, i18n: texts("label", form) } } : { ok: false, message: BAD_KEY };
    }
    case "fast_print_item":
      return { ok: true, snapshot: { key, image: null, icon: "Zap", turnaroundHours: null, fromPrice: null, unit: null, position: 0, status: "published", i18n: texts("name", form) } };
    case "showcase_item":
      return { ok: true, snapshot: { key, media: "", aspect: "square", position: 0, i18n: texts("label", form) } };
    default:
      return { ok: false, message: "Loại nội dung này chưa thể tạo mới ở đây." };
  }
}
