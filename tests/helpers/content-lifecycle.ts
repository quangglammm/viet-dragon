import { composeEntity, type EntityRef } from "@/lib/content/compose";
import { discardDraft, getDraft, openDraft, saveDraft } from "@/lib/content/drafts";
import { publishDraft, type PublishResult } from "@/lib/content/publish";
import type { DocumentFor } from "@/lib/content/schemas";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { Db } from "@/lib/db/types";

// The editing cycle the admin runs, compressed: open (or resume) the draft, change the document, autosave, publish.

export type RefOf<T extends DraftEntityType> = EntityRef & { type: T };

export interface EditOptions {
  author?: string | null;
  comment?: string;
}

/** Opens the draft, applies `mutate` to a copy of its document, saves it and publishes exactly what was saved. */
export async function editAndPublish<T extends DraftEntityType>(db: Db, ref: RefOf<T>, mutate: (document: DocumentFor<T>) => void, options: EditOptions = {}): Promise<PublishResult> {
  const author = options.author ?? null;
  const draft = await openDraft(db, ref, author);
  const document = structuredClone(draft.snapshot) as unknown as DocumentFor<T>;
  mutate(document);
  const saved = await saveDraft(db, ref, { snapshot: document, expectDraftVersion: draft.draftVersion, author });
  return publishDraft(db, ref, { expectDraftVersion: saved.draftVersion, author, comment: options.comment });
}

/**
 * The same cycle for an edit that must be refused: returns what publish threw (or null), checks the draft was KEPT, then
 * discards it so the next test starts clean.
 */
export async function refusedEdit<T extends DraftEntityType>(db: Db, ref: RefOf<T>, mutate: (document: DocumentFor<T>) => void): Promise<unknown> {
  let error: unknown = null;
  try {
    await editAndPublish(db, ref, mutate);
  } catch (caught) {
    error = caught;
  }
  const kept = await getDraft(db, ref);
  if (error !== null && !kept) throw new Error("a refused publish must keep the draft, but it is gone");
  if (kept) await discardDraft(db, ref);
  return error;
}

/** The live document of an entity (the test expects it to exist). */
export async function liveDocument<T extends DraftEntityType>(db: Db, ref: RefOf<T>): Promise<DocumentFor<T>> {
  const composed = await composeEntity(db, ref.type, ref.id);
  if (!composed) throw new Error(`${ref.type} ${ref.id} does not exist`);
  return composed.document as DocumentFor<T>;
}

export async function liveVersion(db: Db, ref: EntityRef): Promise<number | null> {
  return (await composeEntity(db, ref.type, ref.id))?.version ?? null;
}

/** A deep copy with every `aliases` array emptied: compares what an editor wrote with what was stored, set apart the URLs a publish keeps on its own. */
export function withoutAliases<D>(document: D): D {
  const copy = structuredClone(document);
  const clear = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(clear);
    else if (typeof value === "object" && value !== null) {
      for (const [key, inner] of Object.entries(value)) {
        if (key === "aliases" && Array.isArray(inner)) (value as Record<string, unknown>)[key] = [];
        else clear(inner);
      }
    }
  };
  clear(copy);
  return copy;
}

/** A deep copy with every `aliases` array sorted, so two equal sets compare equal whatever order they were written in. */
export function withSortedAliases<D>(document: D): D {
  const copy = structuredClone(document);
  const sort = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(sort);
    else if (typeof value === "object" && value !== null) {
      for (const [key, inner] of Object.entries(value)) {
        if (key === "aliases" && Array.isArray(inner)) (value as Record<string, unknown>)[key] = [...inner].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
        else sort(inner);
      }
    }
  };
  sort(copy);
  return copy;
}
