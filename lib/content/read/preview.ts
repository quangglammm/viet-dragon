import type { DbExecutor } from "@/lib/db/types";
import type { EntityRef } from "../compose";
import { listDrafts } from "../drafts";
import { DRAFT_ENTITY_TYPES, type DraftEntityType } from "../entity-types";
import type { Issue } from "../errors";
import { parseDocument, type DocumentFor } from "../schemas";
import { labelOfSnapshot } from "../summaries";
import { validateSnapshot } from "../validate";

// Preview: the published site with every VALID open draft laid over it. The loaders (load.ts) take a `PreviewOverlay` and, per entity
// type, let a draft's document stand in for the live one with the same identity and add the drafts of entities that do not exist
// yet; the pure builders after them cannot tell the difference. A draft that is not valid (zod, or a reference that points at nothing)
// is never partly applied: it is skipped and named, so the banner can say why an edit is not showing.

export type DraftDocuments = { readonly [T in DraftEntityType]: ReadonlyMap<string, DocumentFor<T>> };

export interface AppliedDraft {
  ref: EntityRef;
  label: string;
  /** Not published yet: the page exists only in the preview. */
  isNew: boolean;
}

export interface SkippedDraft {
  ref: EntityRef;
  label: string;
  /** The first thing wrong with it, in the editor's words. */
  issue: string;
}

export interface PreviewOverlay {
  documents: DraftDocuments;
  applied: readonly AppliedDraft[];
  skipped: readonly SkippedDraft[];
}

/** One open draft with the verdict of `validateSnapshot`. */
export interface DraftEntry {
  ref: EntityRef;
  snapshot: unknown;
  isNew: boolean;
  issues: readonly Issue[];
}

const NOT_VALID = "Bản nháp chưa hợp lệ.";

function emptyDocuments(): { [T in DraftEntityType]: Map<string, DocumentFor<T>> } {
  return Object.fromEntries(DRAFT_ENTITY_TYPES.map((type) => [type, new Map()])) as { [T in DraftEntityType]: Map<string, DocumentFor<T>> };
}

/** Sorts the entries into those that are laid over the site and those that are not. Pure. */
export function overlayOf(entries: readonly DraftEntry[]): PreviewOverlay {
  const documents = emptyDocuments();
  const applied: AppliedDraft[] = [];
  const skipped: SkippedDraft[] = [];
  for (const { ref, snapshot, isNew, issues } of entries) {
    const label = labelOfSnapshot(snapshot) ?? ref.id;
    const parsed = issues.length === 0 ? parseDocument(ref.type, snapshot) : null;
    if (parsed?.success) {
      // The map is indexed by a union of types, so TypeScript cannot pair `ref.type` with the document `parseDocument` returned for it.
      (documents[ref.type] as Map<string, unknown>).set(ref.id, parsed.data);
      applied.push({ ref, label, isNew });
    } else {
      skipped.push({ ref, label, issue: issues[0]?.message ?? NOT_VALID });
    }
  }
  return { documents, applied, skipped };
}

/** Every open draft, checked against the live rows it refers to. */
export async function loadPreviewOverlay(x: DbExecutor): Promise<PreviewOverlay> {
  const drafts = await listDrafts(x);
  const entries = await Promise.all(
    drafts.map(async (draft): Promise<DraftEntry> => ({ ref: draft.ref, snapshot: draft.snapshot, isNew: draft.baseVersion === null, issues: await validateSnapshot(x, draft.ref.type, draft.snapshot) })),
  );
  return overlayOf(entries);
}
