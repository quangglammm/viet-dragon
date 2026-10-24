import { LOCALES } from "./schemas";
import type { DraftEntityType } from "./entity-types";

// The editors' contract: every editable leaf of every document schema has a Vietnamese label and a control. Three tests keep it honest:
//   * field-registry.test.ts: the registry and the zod document schemas list exactly the same leaves (a new field cannot ship
//     without an editor control, and a removed one cannot linger here);
//   * each editor's server-rendered markup carries a `data-field` for every registered path of its type (a registered field
//     that the editor forgot to draw fails);
//   * the column registry (column-registry.ts) already ties every database column to a document path.
//
// Paths use the column-registry syntax: `a.b` property, `a[]` element of a list, `*` a language (or record key).

export type Control = "text" | "textarea" | "number" | "switch" | "select" | "media" | "icon" | "slug" | "aliases" | "date" | "tree";

export interface FieldDef {
  path: string;
  /** Vietnamese, as an editor reads it. */
  label: string;
  control: Control;
}

const f = (path: string, label: string, control: Control): FieldDef => ({ path, label, control });

const SEO = (prefix: string): FieldDef[] => [f(`${prefix}.seoTitle`, "Tiêu đề SEO", "text"), f(`${prefix}.seoDescription`, "Mô tả SEO", "textarea")];
const OWN_SLUGS = (prefix: string): FieldDef[] => [f(`${prefix}slugs.*.slug`, "Đường dẫn", "slug"), f(`${prefix}slugs.*.aliases[]`, "Đường dẫn cũ", "aliases")];

export const FIELD_REGISTRY: Record<DraftEntityType, readonly FieldDef[]> = {
  product: [
    f("category", "Danh mục", "select"),
    f("slugs.*.slug", "Đường dẫn", "slug"),
    f("slugs.*.aliases[].category", "Danh mục của đường dẫn cũ", "aliases"),
    f("slugs.*.aliases[].slug", "Đường dẫn cũ", "aliases"),
    f("status", "Trạng thái", "select"),
    f("position", "Thứ tự", "number"),
    f("cover", "Ảnh bìa", "media"),
    f("ogImage", "Ảnh chia sẻ (Open Graph)", "media"),
    f("i18n.*.title", "Tên sản phẩm", "text"),
    f("i18n.*.description", "Mô tả", "textarea"),
    ...SEO("i18n.*"),
    ...OWN_SLUGS("shapes[]."),
    f("shapes[].position", "Thứ tự hình thức", "number"),
    f("shapes[].image", "Ảnh hình thức", "media"),
    f("shapes[].ogImage", "Ảnh chia sẻ của hình thức", "media"),
    f("shapes[].i18n.*.name", "Tên hình thức", "text"),
    f("shapes[].i18n.*.description", "Mô tả hình thức", "textarea"),
    f("shapes[].i18n.*.badge", "Nhãn", "text"),
    ...SEO("shapes[].i18n.*"),
    ...OWN_SLUGS("options[]."),
    f("options[].shape", "Chỉ dành cho hình thức", "select"),
    f("options[].material", "Chất liệu", "select"),
    f("options[].position", "Thứ tự chất liệu", "number"),
    f("options[].icon", "Biểu tượng", "icon"),
    f("options[].hideFoil", "Ẩn lựa chọn ép kim", "switch"),
    f("options[].hideDoubleSided", "Ẩn lựa chọn in hai mặt", "switch"),
    f("options[].prices.base", "Giá cơ bản (đ)", "number"),
    f("options[].prices.doubleSided", "Giá in hai mặt (đ)", "number"),
    f("options[].prices.foil", "Giá ép kim (đ)", "number"),
    f("options[].prices.foil2", "Giá ép kim hai mặt (đ)", "number"),
    f("options[].unit", "Đơn vị tính", "select"),
    f("options[].ogImage", "Ảnh chia sẻ của chất liệu", "media"),
    f("options[].i18n.*.name", "Tên đầy đủ", "text"),
    f("options[].i18n.*.cardTitle", "Tiêu đề thẻ", "text"),
    f("options[].i18n.*.tagline", "Câu giới thiệu", "text"),
    ...SEO("options[].i18n.*"),
    f("options[].bullets[].kind", "Loại gạch đầu dòng", "select"),
    f("options[].bullets[].position", "Thứ tự gạch đầu dòng", "number"),
    f("options[].bullets[].trait", "Biểu tượng đặc điểm", "select"),
    f("options[].bullets[].i18n.*", "Nội dung gạch đầu dòng", "text"),
    f("options[].images.default[]", "Ảnh mẫu", "media"),
    f("options[].images.pure[]", "Ảnh nền trắng", "media"),
    f("sizes[].shape", "Kích thước của hình thức", "select"),
    f("sizes[].tier", "Hạng kích thước", "select"),
    f("sizes[].w", "Rộng (mm)", "number"),
    f("sizes[].h", "Cao (mm)", "number"),
    f("sizes[].d", "Sâu (mm)", "number"),
    f("sizes[].text", "Kích thước bằng chữ", "text"),
    f("sizes[].i18n.*", "Ghi chú kích thước", "text"),
    f("specs[].shape", "Thông số của hình thức", "select"),
    f("specs[].kind", "Loại thông số", "select"),
    f("specs[].item", "Thông số", "select"),
    f("specs[].position", "Thứ tự thông số", "number"),
  ],
  menu: [
    f("columns[].column", "Số cột", "number"),
    f("columns[].groups[].product", "Sản phẩm của nhóm", "select"),
    f("columns[].groups[].image", "Ảnh của nhóm", "media"),
    f("columns[].groups[].i18n.*.label", "Tên nhóm", "text"),
    f("columns[].groups[].i18n.*.description", "Mô tả nhóm", "textarea"),
    f("columns[].groups[].items[].target.shape", "Hình thức được liên kết", "select"),
    f("columns[].groups[].items[].target.option", "Chất liệu được liên kết", "select"),
    f("columns[].groups[].items[].isFast", "Nhãn «In nhanh»", "switch"),
    f("columns[].groups[].items[].image", "Ảnh của mục", "media"),
    f("columns[].groups[].items[].i18n.*", "Tên mục", "text"),
  ],
  post: [
    ...OWN_SLUGS(""),
    f("category", "Chuyên mục", "select"),
    f("publishedOn", "Ngày đăng", "date"),
    f("readTimeMin", "Thời gian đọc (phút)", "number"),
    f("cover", "Ảnh bìa", "media"),
    f("ogImage", "Ảnh chia sẻ (Open Graph)", "media"),
    f("contentFormat", "Định dạng nội dung", "select"),
    f("status", "Trạng thái", "select"),
    f("i18n.*.title", "Tiêu đề", "text"),
    f("i18n.*.excerpt", "Tóm tắt", "textarea"),
    f("i18n.*.content", "Nội dung", "textarea"),
    ...SEO("i18n.*"),
  ],
  category: [
    ...OWN_SLUGS(""),
    f("icon", "Biểu tượng", "icon"),
    f("cover", "Ảnh bìa", "media"),
    f("ogImage", "Ảnh chia sẻ (Open Graph)", "media"),
    f("position", "Thứ tự", "number"),
    f("i18n.*.name", "Tên danh mục", "text"),
    f("i18n.*.description", "Mô tả", "textarea"),
    ...SEO("i18n.*"),
  ],
  material: [f("icon", "Biểu tượng", "icon"), f("i18n.*.name", "Tên chất liệu", "text")],
  trait: [f("icon", "Biểu tượng", "icon"), f("i18n.*.label", "Tên đặc điểm", "text"), f("i18n.*.description", "Giải thích", "textarea")],
  unit: [f("i18n.*.label", "Tên đơn vị", "text")],
  spec_item: [f("isDefault", "Gợi ý mặc định", "switch"), f("i18n.*.label", "Tên thông số", "text")],
  post_category: [f("i18n.*.label", "Tên chuyên mục", "text")],
  fast_print_item: [
    f("key", "Mã mục", "text"),
    f("image", "Ảnh", "media"),
    f("icon", "Biểu tượng", "icon"),
    f("turnaroundHours", "Thời gian lấy hàng (giờ)", "number"),
    f("fromPrice", "Giá từ (đ)", "number"),
    f("unit", "Đơn vị tính", "select"),
    f("position", "Thứ tự", "number"),
    f("status", "Trạng thái", "select"),
    f("i18n.*.name", "Tên", "text"),
    f("i18n.*.tag", "Nhãn", "text"),
    f("i18n.*.description", "Mô tả", "textarea"),
  ],
  showcase_item: [
    f("key", "Mã ảnh", "text"),
    f("media", "Ảnh", "media"),
    f("aspect", "Khung ảnh", "select"),
    f("position", "Thứ tự", "number"),
    f("i18n.*.label", "Chú thích", "text"),
  ],
  // `data` is { language: { …any nested texts } }: the leaf is "a text somewhere in a language's tree".
  site_message: [f("data.*.*", "Văn bản giao diện", "tree")],
};

/** Leaves the system fills in or that identify the document: shown as context, never typed. */
export const SYSTEM_PATHS: Record<DraftEntityType, readonly string[]> = {
  product: ["schema", "uid", "shapes[].uid", "options[].uid"],
  menu: ["schema", "key", "category"],
  post: ["schema", "uid"],
  category: ["schema", "key"],
  material: ["schema", "key"],
  trait: ["schema", "key"],
  unit: ["schema", "key"],
  spec_item: ["schema", "key"],
  post_category: ["schema", "key"],
  fast_print_item: ["schema", "uid"],
  showcase_item: ["schema", "uid"],
  site_message: ["schema", "key"],
};

const LOCALE_SEGMENT = new RegExp(`\\.(${LOCALES.join("|")})(?=\\.|$)`, "g");

/** `options[3f2a…].i18n.vi.name` (a concrete path from a diff or an issue) → `options[].i18n.*.name` (a registry path). */
export function registryPathOf(concretePath: string): string {
  return concretePath.replace(/\[[^\]]*\]/g, "[]").replace(LOCALE_SEGMENT, ".*");
}

/** The editor's label for a concrete path, with the language when the path names one: «Tên sản phẩm (en)». */
export function fieldLabel(type: DraftEntityType, concretePath: string): string {
  const field = FIELD_REGISTRY[type].find((candidate) => candidate.path === registryPathOf(concretePath));
  if (!field) return concretePath;
  const language = new RegExp(`\\.(${LOCALES.join("|")})(?=\\.|$)`).exec(concretePath)?.[1];
  return language ? `${field.label} (${language})` : field.label;
}
