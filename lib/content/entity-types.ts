// The twelve kinds of entity that have a document, a draft and revisions. A plain module (no database imports) so the admin's
// browser code can share it with the schema in lib/db/content/drafts.ts, which re-exports it.

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
