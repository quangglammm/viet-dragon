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
  /** Lists the editor picks from, loaded by the page. */
  vocab: readonly (keyof Vocabulary)[];
}

export const ENTITY_META: Record<DraftEntityType, EntityMeta> = {
  product: { label: "Sản phẩm", singular: "sản phẩm", editable: false, hasStatus: true, vocab: ["category", "material", "trait", "unit", "spec_item"] },
  menu: { label: "Menu", singular: "menu", editable: false, hasStatus: false, vocab: ["product"] },
  category: { label: "Danh mục", singular: "danh mục", editable: false, hasStatus: false, vocab: [] },
  post: { label: "Bài viết", singular: "bài viết", editable: false, hasStatus: true, vocab: ["post_category"] },
  material: { label: "Chất liệu", singular: "chất liệu", editable: true, hasStatus: false, vocab: [] },
  trait: { label: "Đặc điểm (biểu tượng)", singular: "đặc điểm", editable: true, hasStatus: false, vocab: [] },
  unit: { label: "Đơn vị tính", singular: "đơn vị", editable: true, hasStatus: false, vocab: [] },
  spec_item: { label: "Thông số in", singular: "thông số", editable: true, hasStatus: false, vocab: [] },
  post_category: { label: "Chuyên mục bài viết", singular: "chuyên mục", editable: true, hasStatus: false, vocab: [] },
  fast_print_item: { label: "In nhanh lấy liền", singular: "mục in nhanh", editable: true, hasStatus: true, vocab: ["unit"] },
  showcase_item: { label: "Ảnh mẫu trang sản phẩm", singular: "ảnh mẫu", editable: true, hasStatus: false, vocab: [] },
  site_message: { label: "Văn bản giao diện", singular: "nhóm văn bản", editable: false, hasStatus: false, vocab: [] },
};

export const listUrl = (type: DraftEntityType): string => `/admin/content/${entityTypeToUrl(type)}`;
export const editorUrl = (type: DraftEntityType, encodedId: string): string => `${listUrl(type)}/${encodedId}`;

export const EDITABLE_TYPES: readonly DraftEntityType[] = DRAFT_ENTITY_TYPES.filter((type) => ENTITY_META[type].editable);
