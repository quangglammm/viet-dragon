import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { Tx } from "@/lib/db/types";
import type { DocumentFor } from "../schemas";

/** What the publish step tells an applier about the change it is making. */
export interface ApplyContext {
  /** Account id of the editor; null for the system. */
  author: string | null;
  /** The live version the draft started from; null = a brand-new entity. */
  baseVersion: number | null;
  /**
   * The version a brand-new entity starts at: 1, or after a delete and re-create (or the restore of a deleted entity) the one that
   * follows its last revision — revisions are unique per (entity, version), and they outlive the entity.
   */
  startVersion: number;
}

/**
 * Writes one entity type's document into the live tables. The publish step has already checked the draft (zod, references,
 * base version), so an applier only translates: it upserts children BY UID (database ids survive every publish, so menus and
 * anything else that points at them stay valid) and returns the entity's new version.
 */
export interface Applier<D> {
  /** Locks the live row (FOR NO KEY UPDATE) and returns its version, or null when the entity does not exist yet. */
  lock(tx: Tx, id: string): Promise<number | null>;
  apply(tx: Tx, document: D, context: ApplyContext): Promise<number>;
}

export type Appliers = { [T in DraftEntityType]: Applier<DocumentFor<T>> };
