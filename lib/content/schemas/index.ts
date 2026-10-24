import type { z } from "zod";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import {
  categoryDocumentSchema,
  fastPrintItemDocumentSchema,
  materialDocumentSchema,
  postCategoryDocumentSchema,
  showcaseItemDocumentSchema,
  siteMessageDocumentSchema,
  specItemDocumentSchema,
  traitDocumentSchema,
  unitDocumentSchema,
} from "./library";
import { parseOptions } from "./common";
import { menuDocumentSchema } from "./menu";
import { postDocumentSchema } from "./post";
import { productDocumentSchema } from "./product";

export * from "./common";
export * from "./library";
export * from "./menu";
export * from "./post";
export * from "./product";

/** One document schema per entity type that can have a draft (the `content_draft.entity_type` values). */
export const DOCUMENT_SCHEMAS = {
  product: productDocumentSchema,
  post: postDocumentSchema,
  category: categoryDocumentSchema,
  material: materialDocumentSchema,
  trait: traitDocumentSchema,
  unit: unitDocumentSchema,
  spec_item: specItemDocumentSchema,
  fast_print_item: fastPrintItemDocumentSchema,
  showcase_item: showcaseItemDocumentSchema,
  post_category: postCategoryDocumentSchema,
  site_message: siteMessageDocumentSchema,
  menu: menuDocumentSchema,
} as const satisfies Record<DraftEntityType, z.ZodType>;

export type DocumentFor<T extends DraftEntityType> = z.infer<(typeof DOCUMENT_SCHEMAS)[T]>;

/** Entities an editor may rename are identified by `uid`; vocabulary and structural records by an immutable `key`. */
export const UID_ENTITY_TYPES = ["product", "post", "fast_print_item", "showcase_item"] as const satisfies readonly DraftEntityType[];
type UidEntityType = (typeof UID_ENTITY_TYPES)[number];

export function isUidEntity(type: DraftEntityType): type is UidEntityType {
  return (UID_ENTITY_TYPES as readonly string[]).includes(type);
}

export function parseDocument<T extends DraftEntityType>(type: T, input: unknown): z.ZodSafeParseResult<DocumentFor<T>> {
  // The map is indexed by a generic key, so TypeScript can only see the union of all schemas here.
  return DOCUMENT_SCHEMAS[type].safeParse(input, parseOptions) as z.ZodSafeParseResult<DocumentFor<T>>;
}

/** The identity a draft or revision of this document is filed under: exactly one of `entityUid` / `entityKey` (the database re-checks it against the snapshot). */
export type DocumentIdentity = { entityUid: string; entityKey: null } | { entityUid: null; entityKey: string };

export function documentIdentity(type: DraftEntityType, document: { uid?: string; key?: string }): DocumentIdentity {
  if (isUidEntity(type)) {
    if (!document.uid) throw new Error(`a ${type} document has no uid`);
    return { entityUid: document.uid, entityKey: null };
  }
  if (!document.key) throw new Error(`a ${type} document has no key`);
  return { entityUid: null, entityKey: document.key };
}
