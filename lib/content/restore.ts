import { and, desc, eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { RevisionAction } from "@/lib/db/content/drafts";
import type { Db, DbExecutor } from "@/lib/db/types";
import { composeEntity, type EntityRef } from "./compose";
import { insertDraft, getDraft, type Draft, type Snapshot } from "./drafts";
import { Conflict, Invalid, NotFound } from "./errors";
import { identityOf } from "./identity";
import { DOCUMENT_SCHEMA, isUidEntity } from "./schemas";

// Every publish writes a revision: the document exactly as it was stored. Restoring one never touches live data directly —
// it opens the revision as a new draft (marked in `note`), which goes through the same preview and publish as any edit.

export interface RevisionSummary {
  version: number;
  action: RevisionAction;
  comment: string | null;
  author: string | null;
  createdAt: Date;
}

export interface Revision extends RevisionSummary {
  snapshotSchema: number;
  snapshot: Snapshot;
}

const RESTORE_NOTE = /^restore:(\d+)$/;

const restoreNote = (version: number): string => `restore:${version}`;

/** The revision a draft was opened from, or null when it is an ordinary draft. */
export function restoredVersionOf(note: string | null): number | null {
  const match = note === null ? null : RESTORE_NOTE.exec(note);
  return match ? Number(match[1]) : null;
}

function whereRevision(ref: EntityRef) {
  const { entityUid, entityKey } = identityOf(ref);
  return and(eq(schema.contentRevision.entityType, ref.type), entityUid === null ? eq(schema.contentRevision.entityKey, entityKey) : eq(schema.contentRevision.entityUid, entityUid));
}

/** Newest first. The documents themselves are fetched one at a time with `getRevision`. */
export async function listRevisions(x: DbExecutor, ref: EntityRef): Promise<RevisionSummary[]> {
  return x
    .select({
      version: schema.contentRevision.version,
      action: schema.contentRevision.action,
      comment: schema.contentRevision.comment,
      author: schema.contentRevision.author,
      createdAt: schema.contentRevision.createdAt,
    })
    .from(schema.contentRevision)
    .where(whereRevision(ref))
    .orderBy(desc(schema.contentRevision.version));
}

export async function getRevision(x: DbExecutor, ref: EntityRef, version: number): Promise<Revision | null> {
  const [row] = await x.select().from(schema.contentRevision).where(and(whereRevision(ref), eq(schema.contentRevision.version, version)));
  if (!row) return null;
  return { version: row.version, action: row.action, comment: row.comment, author: row.author, createdAt: row.createdAt, snapshotSchema: row.snapshotSchema, snapshot: row.snapshot as Snapshot };
}

/**
 * Opens revision `version` as a draft of the entity. If the entity has been deleted since, the draft is a new entity (publishing
 * it re-creates it); otherwise it starts from the current live version. Nothing is applied until it is published.
 */
export async function startRestore(db: Db, ref: EntityRef, version: number, author: string | null): Promise<Draft> {
  return db.transaction(async (tx) => {
    if (await getDraft(tx, ref)) {
      throw new Conflict("DRAFT_EXISTS", "Đã có bản nháp đang mở. Hãy xuất bản hoặc hủy bản nháp đó trước khi khôi phục.");
    }
    const revision = await getRevision(tx, ref, version);
    if (!revision) throw new NotFound(`Không tìm thấy phiên bản ${version}.`);
    if (revision.snapshotSchema !== DOCUMENT_SCHEMA) {
      throw new Invalid([{ path: "", message: `Phiên bản ${version} dùng định dạng cũ nên chưa thể khôi phục.` }]);
    }
    const live = await composeEntity(tx, ref.type, ref.id);
    const field = isUidEntity(ref.type) ? "uid" : "key";
    if (revision.snapshot[field] !== ref.id) throw new Invalid([{ path: field, message: "Phiên bản này không thuộc về mục đang khôi phục." }]);
    const draft = await insertDraft(tx, ref, { baseVersion: live?.version ?? null, snapshot: revision.snapshot, note: restoreNote(version), author });
    if (!draft) throw new Conflict("DRAFT_EXISTS", "Đã có bản nháp đang mở.");
    return draft;
  });
}
