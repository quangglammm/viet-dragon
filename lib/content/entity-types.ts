// The twelve kinds of entity that have a document schema.
export const DRAFT_ENTITY_TYPES = [
  "product",
  "post",
  "category",
  "material",
  "trait",
  "unit",
  "spec_item",
  "fast_print_item",
  "showcase_item",
  "post_category",
  "site_message",
  "menu",
] as const;

export type DraftEntityType = (typeof DRAFT_ENTITY_TYPES)[number];
