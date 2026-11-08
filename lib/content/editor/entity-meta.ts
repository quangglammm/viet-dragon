import { DRAFT_ENTITY_TYPES, type DraftEntityType } from "../entity-types";
import { entityTypeToUrl } from "../identity";
import type { Vocabulary } from "./vocabulary";

// How each kind of entity is named in the admin, and what its editor needs loaded. Client-safe: used by the list, the editor and the nav.

export interface EntityMeta {
  /** Plural, for page titles and the nav. */
  label: string;
  /** What "Tạo mới" creates. */
  singular: string;
  /** The editor for this type exists. Types are switched on as their milestone ships. */
  editable: boolean;
  /** Has a `status` (published / archived): such records are archived before they can be deleted. */
  hasStatus: boolean;
  /** The editor offers permanent deletion. Structure (a category, its menu) and the UI texts are edited, never deleted. */
  deletable: boolean;
  /** Lists the editor picks from, loaded by the page. */
  vocab: readonly (keyof Vocabulary)[];
  /** What a record is filed under (a product's category, a post's): the list shows it as a column and "Tạo mới" asks for it. */
  group?: { label: string; vocab: keyof Vocabulary };
  /** The language tabs show no "% translated": the texts are overrides that exist only where they differ (a menu's), so a percentage means nothing. */
  noCoverage?: true;
}

export const ENTITY_META: Record<DraftEntityType, EntityMeta> = {
  product: { label: "Sản phẩm", singular: "sản phẩm", editable: true, hasStatus: true, deletable: true, vocab: ["category", "material", "trait", "unit", "spec_item"], group: { label: "Danh mục", vocab: "category" } },
  menu: { label: "Menu", singular: "menu", editable: true, hasStatus: false, deletable: false, vocab: ["product", "shape", "option"], noCoverage: true },
  category: { label: "Danh mục", singular: "danh mục", editable: true, hasStatus: false, deletable: false, vocab: [] },
  post: { label: "Bài viết", singular: "bài viết", editable: true, hasStatus: true, deletable: true, vocab: ["post_category"], group: { label: "Chuyên mục", vocab: "post_category" } },
  material: { label: "Chất liệu", singular: "chất liệu", editable: true, hasStatus: false, deletable: true, vocab: [] },
  trait: { label: "Đặc điểm (biểu tượng)", singular: "đặc điểm", editable: true, hasStatus: false, deletable: true, vocab: [] },
  unit: { label: "Đơn vị tính", singular: "đơn vị", editable: true, hasStatus: false, deletable: true, vocab: [] },
  spec_item: { label: "Thông số in", singular: "thông số", editable: true, hasStatus: false, deletable: true, vocab: [] },
  post_category: { label: "Chuyên mục bài viết", singular: "chuyên mục", editable: true, hasStatus: false, deletable: true, vocab: [] },
  fast_print_item: { label: "In nhanh lấy liền", singular: "mục in nhanh", editable: true, hasStatus: true, deletable: true, vocab: ["unit"] },
  showcase_item: { label: "Ảnh mẫu trang sản phẩm", singular: "ảnh mẫu", editable: true, hasStatus: false, deletable: true, vocab: [] },
  site_message: { label: "Văn bản giao diện", singular: "nhóm văn bản", editable: true, hasStatus: false, deletable: false, vocab: [] },
};

export const listUrl = (type: DraftEntityType): string => `/admin/content/${entityTypeToUrl(type)}`;
export const editorUrl = (type: DraftEntityType, encodedId: string): string => `${listUrl(type)}/${encodedId}`;

export const EDITABLE_TYPES: readonly DraftEntityType[] = DRAFT_ENTITY_TYPES.filter((type) => ENTITY_META[type].editable);
