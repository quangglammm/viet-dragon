import { inArray, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { DbExecutor } from "@/lib/db/types";
import { Invalid } from "../errors";
import { collectReferences } from "../references";

// Documents refer to media and library records by key; the rows by id. Publish has already checked that every key exists
// (`checkReferences`), so an unknown key here means the check was skipped — refuse instead of writing a wrong id.

export interface IdMap {
  /** The id for a required key. */
  id(key: string): number;
  /** The id for an optional key (null stays null). */
  idOrNull(key: string | null): number | null;
}

function idMap(label: string, found: ReadonlyMap<string, number>): IdMap {
  const id = (key: string): number => {
    const value = found.get(key);
    if (value === undefined) throw new Invalid([{ path: "", message: `Không tìm thấy ${label} «${key}».` }]);
    return value;
  };
  return { id, idOrNull: (key) => (key === null ? null : id(key)) };
}

const distinct = (keys: readonly (string | null)[]): string[] => [...new Set(keys.filter((key): key is string => key !== null))];

export async function loadMediaIds(x: DbExecutor, keys: readonly (string | null)[]): Promise<IdMap> {
  const wanted = distinct(keys);
  const rows = wanted.length === 0 ? [] : await x.select({ key: schema.media.storageKey, id: schema.media.id }).from(schema.media).where(inArray(schema.media.storageKey, wanted));
  return idMap("ảnh hoặc video", new Map(rows.map((row) => [row.key, row.id])));
}

/** Every media file a document points at. */
export async function loadDocumentMedia(x: DbExecutor, type: DraftEntityType, document: unknown): Promise<IdMap> {
  return loadMediaIds(x, collectReferences(type, document).filter((r) => r.kind === "media").map((r) => r.key));
}

export async function loadMaterialIds(x: DbExecutor, slugs: readonly string[]): Promise<IdMap> {
  const wanted = distinct(slugs);
  const rows = wanted.length === 0 ? [] : await x.select({ key: schema.material.slug, id: schema.material.id }).from(schema.material).where(inArray(schema.material.slug, wanted));
  return idMap("chất liệu", new Map(rows.map((row) => [row.key, row.id])));
}

const specItemKey = sql<string>`${schema.specItem.kind} || '/' || ${schema.specItem.key}`;

/** Spec items by their `<kind>/<key>` identity. */
export async function loadSpecItemIds(x: DbExecutor, keys: readonly string[]): Promise<IdMap> {
  const wanted = distinct(keys);
  const rows = wanted.length === 0 ? [] : await x.select({ key: specItemKey, id: schema.specItem.id }).from(schema.specItem).where(inArray(specItemKey, wanted));
  return idMap("thông số", new Map(rows.map((row) => [row.key, row.id])));
}
