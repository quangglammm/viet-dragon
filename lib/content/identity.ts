import { DRAFT_ENTITY_TYPES, type DraftEntityType } from "@/lib/db/content/drafts";
import type { EntityRef } from "./compose";
import { SITE_MESSAGE_NAMESPACE_PATTERN, SPEC_ITEM_KEY_PATTERN, isUidEntity, slugSchema, uidSchema, type DocumentIdentity } from "./schemas";

// How an entity is named in a URL and filed in the database. Types are kebab-case in URLs (`spec-item`); a spec item's
// key `technique/offset` travels as `technique.offset` because a slash would split the path (kinds and keys never
// contain a dot).

const urlNameOf = (type: DraftEntityType): string => type.replaceAll("_", "-");

const TYPE_BY_URL_NAME = new Map(DRAFT_ENTITY_TYPES.map((type) => [urlNameOf(type), type]));

export function entityTypeFromUrl(name: string): DraftEntityType | null {
  return TYPE_BY_URL_NAME.get(name) ?? null;
}

export function entityTypeToUrl(type: DraftEntityType): string {
  return urlNameOf(type);
}

/** The id as it appears in a URL path segment. */
export function encodeEntityId(type: DraftEntityType, id: string): string {
  return type === "spec_item" ? id.replace("/", ".") : id;
}

/** Whether `id` can be the id of an entity of this type: a uid for uid entities, otherwise the type's immutable key. */
export function isEntityId(type: DraftEntityType, id: string): boolean {
  if (isUidEntity(type)) return uidSchema.safeParse(id).success;
  if (type === "spec_item") return SPEC_ITEM_KEY_PATTERN.test(id);
  if (type === "site_message") return SITE_MESSAGE_NAMESPACE_PATTERN.test(id);
  return slugSchema.safeParse(id).success;
}

/** The id from a URL path segment, or null when it cannot be an id of that type (the caller answers 404). */
export function decodeEntityId(type: DraftEntityType, raw: string): string | null {
  const id = type === "spec_item" ? raw.replace(".", "/") : isUidEntity(type) ? raw.toLowerCase() : raw;
  return isEntityId(type, id) ? id : null;
}

/** Which of `content_draft` / `content_revision`'s two identity columns holds this entity. */
export function identityOf(ref: EntityRef): DocumentIdentity {
  return isUidEntity(ref.type) ? { entityUid: ref.id, entityKey: null } : { entityUid: null, entityKey: ref.id };
}

/** The entity a document is about: its `uid` or its `key`. */
export function refOfDocument(type: DraftEntityType, document: { uid?: string; key?: string }): EntityRef {
  const id = isUidEntity(type) ? document.uid : document.key;
  if (!id) throw new Error(`a ${type} document has no ${isUidEntity(type) ? "uid" : "key"}`);
  return { type, id };
}
