import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { Db, DbExecutor, Tx } from "@/lib/db/types";
import { composeEntity, type EntityRef } from "./compose";
import { publishChanges, type Change } from "./diff";
import { Conflict, Invalid, NotFound } from "./errors";
import { identityOf, isEntityId } from "./identity";
import { draftReferenceRows } from "./references";
import { DOCUMENT_SCHEMA, isUidEntity } from "./schemas";

// Drafts. A live entity is only ever changed by publishing a draft: a whole-entity document that the editor can save
// as often as they like, however incomplete. Autosave is guarded by `draft_version`; publishing is guarded by it too (what
// was previewed is what is published) and by `base_version` (the live version the draft started from).

export type Snapshot = Record<string, unknown>;

export interface Draft {
  id: number;
  ref: EntityRef;
  /** The live version the draft started from; null = a brand-new entity. */
  baseVersion: number | null;
  /** The lock token: changes with every save. */
  draftVersion: number;
  snapshot: Snapshot;
  note: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type DraftRow = typeof schema.contentDraft.$inferSelect;

function toDraft(row: DraftRow): Draft {
  return {
    id: row.id,
    ref: { type: row.entityType, id: (row.entityUid ?? row.entityKey) as string },
    baseVersion: row.baseVersion,
    draftVersion: row.draftVersion,
    snapshot: row.snapshot as Snapshot,
    note: row.note,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const isSnapshot = (value: unknown): value is Snapshot => typeof value === "object" && value !== null && !Array.isArray(value);

function whereDraft(ref: EntityRef) {
  const { entityUid, entityKey } = identityOf(ref);
  return and(eq(schema.contentDraft.entityType, ref.type), entityUid === null ? eq(schema.contentDraft.entityKey, entityKey) : eq(schema.contentDraft.entityUid, entityUid));
}

export async function getDraft(x: DbExecutor, ref: EntityRef): Promise<Draft | null> {
  const [row] = await x.select().from(schema.contentDraft).where(whereDraft(ref));
  return row ? toDraft(row) : null;
}

/** The draft row, locked until the transaction ends. */
export async function lockDraft(tx: Tx, ref: EntityRef): Promise<Draft | null> {
  const [row] = await tx.select().from(schema.contentDraft).where(whereDraft(ref)).for("update");
  return row ? toDraft(row) : null;
}

/** What an open draft refers to, for "used by": rewritten on every save. */
async function replaceReferences(tx: Tx, draftId: number, type: DraftEntityType, snapshot: Snapshot): Promise<void> {
  await tx.delete(schema.draftReference).where(eq(schema.draftReference.draftId, draftId));
  const rows = draftReferenceRows(type, snapshot);
  if (rows.length > 0) await tx.insert(schema.draftReference).values(rows.map((row) => ({ draftId, ...row })));
}

/** The snapshot must be about the entity the draft is filed under (the database checks this too). */
function assertSnapshotIsAbout(ref: EntityRef, snapshot: Snapshot): void {
  const field = isUidEntity(ref.type) ? "uid" : "key";
  if (snapshot[field] !== ref.id) {
    throw new Invalid([{ path: field, message: "Nội dung này thuộc về một mục khác, không thể lưu vào bản nháp này." }]);
  }
}

export interface NewDraft {
  baseVersion: number | null;
  snapshot: Snapshot;
  note?: string | null;
  author: string | null;
}

/** Inserts the draft, or returns null when the entity already has one. */
export async function insertDraft(tx: Tx, ref: EntityRef, draft: NewDraft): Promise<Draft | null> {
  assertSnapshotIsAbout(ref, draft.snapshot);
  const [row] = await tx
    .insert(schema.contentDraft)
    .values({
      entityType: ref.type,
      ...identityOf(ref),
      baseVersion: draft.baseVersion,
      snapshotSchema: DOCUMENT_SCHEMA,
      snapshot: draft.snapshot,
      note: draft.note ?? null,
      createdBy: draft.author,
      updatedBy: draft.author,
    })
    .onConflictDoNothing()
    .returning();
  if (!row) return null;
  await replaceReferences(tx, row.id, ref.type, draft.snapshot);
  return toDraft(row);
}

const draftExists = (ref: EntityRef) => new Conflict("DRAFT_EXISTS", `Đã có bản nháp đang mở cho ${ref.type} này. Hãy tiếp tục chỉnh sửa, xuất bản hoặc hủy bản nháp đó trước.`);

/** The entity's open draft, or a new one that starts from the live version. */
export async function openDraft(db: Db, ref: EntityRef, author: string | null): Promise<Draft> {
  return db.transaction(async (tx) => {
    const existing = await getDraft(tx, ref);
    if (existing) return existing;
    const live = await composeEntity(tx, ref.type, ref.id);
    if (!live) throw new NotFound("Không tìm thấy nội dung để chỉnh sửa.");
    const created = await insertDraft(tx, ref, { baseVersion: live.version, snapshot: live.document as Snapshot, author });
    // Two editors opening at the same moment: the second one gets the first one's draft.
    return created ?? (await getDraft(tx, ref))!;
  });
}

export interface CreateDraftInput {
  /** Required for entities identified by a key (a category id, a material slug…); uid entities get a generated uid. */
  key?: string;
  /** The starting document, however incomplete. Its identity fields are overwritten. */
  snapshot: Snapshot;
}

/** A draft of an entity that does not exist yet. */
export async function createDraft(db: Db, type: DraftEntityType, input: CreateDraftInput, author: string | null): Promise<Draft> {
  const uidEntity = isUidEntity(type);
  const id = uidEntity ? randomUUID() : input.key;
  if (id === undefined || !isEntityId(type, id)) {
    throw new Invalid([{ path: "key", message: "Khóa không hợp lệ: chỉ gồm chữ thường không dấu, số và dấu gạch ngang." }]);
  }
  const ref: EntityRef = { type, id };
  const snapshot: Snapshot = { ...input.snapshot, schema: DOCUMENT_SCHEMA, [uidEntity ? "uid" : "key"]: id };
  return db.transaction(async (tx) => {
    if (await composeEntity(tx, type, id)) {
      throw new Conflict("ALREADY_EXISTS", "Mục này đã tồn tại. Hãy mở bản nháp từ nội dung hiện có thay vì tạo mới.");
    }
    const created = await insertDraft(tx, ref, { baseVersion: null, snapshot, author });
    if (!created) throw draftExists(ref);
    return created;
  });
}

export interface SaveDraftInput {
  snapshot: unknown;
  /** The `draftVersion` the editor loaded; a different one means somebody else saved in between. */
  expectDraftVersion: number;
  author: string | null;
}

export async function saveDraft(db: Db, ref: EntityRef, input: SaveDraftInput): Promise<Draft> {
  if (!isSnapshot(input.snapshot)) throw new Invalid([{ path: "", message: "Bản nháp phải là một đối tượng JSON." }]);
  const snapshot = input.snapshot;
  assertSnapshotIsAbout(ref, snapshot);
  return db.transaction(async (tx) => {
    const current = await lockDraft(tx, ref);
    if (!current) throw new Conflict("GONE", "Bản nháp không còn nữa (đã xuất bản hoặc đã hủy).");
    if (current.draftVersion !== input.expectDraftVersion) {
      throw new Conflict("DRAFT_CHANGED", "Bản nháp vừa được người khác lưu. Hãy tải lại trước khi lưu tiếp.");
    }
    const [row] = await tx
      .update(schema.contentDraft)
      .set({ snapshot, draftVersion: sql`${schema.contentDraft.draftVersion} + 1`, updatedAt: sql`now()`, updatedBy: input.author })
      .where(eq(schema.contentDraft.id, current.id))
      .returning();
    await replaceReferences(tx, current.id, ref.type, snapshot);
    return toDraft(row);
  });
}

/** Throws the draft away. With `expectDraftVersion`, only if nobody saved after the editor last looked. */
export async function discardDraft(db: Db, ref: EntityRef, expectDraftVersion?: number): Promise<void> {
  await db.transaction(async (tx) => {
    const current = await lockDraft(tx, ref);
    if (!current) throw new NotFound("Không có bản nháp để hủy.");
    if (expectDraftVersion !== undefined && current.draftVersion !== expectDraftVersion) {
      throw new Conflict("DRAFT_CHANGED", "Bản nháp vừa được người khác lưu. Hãy tải lại trước khi hủy.");
    }
    await tx.delete(schema.contentDraft).where(eq(schema.contentDraft.id, current.id));
  });
}

/**
 * Keeps the draft and starts it from the live version as it is now. This is a knowing overwrite: publishing writes the whole
 * document, so anything that changed live in the meantime is replaced by the draft's values (`draftChanges` shows what).
 */
export async function rebaseDraft(db: Db, ref: EntityRef, author: string | null): Promise<Draft> {
  return db.transaction(async (tx) => {
    const current = await lockDraft(tx, ref);
    if (!current) throw new Conflict("GONE", "Bản nháp không còn nữa (đã xuất bản hoặc đã hủy).");
    const live = await composeEntity(tx, ref.type, ref.id);
    if (current.baseVersion === null) {
      if (live) throw new Conflict("ALREADY_EXISTS", "Mục này đã được tạo ở nơi khác; bản nháp mới không thể ghi đè lên nó.");
      return current;
    }
    if (!live) throw new Conflict("GONE", "Nội dung gốc của bản nháp đã bị xóa.");
    const [row] = await tx
      .update(schema.contentDraft)
      .set({ baseVersion: live.version, draftVersion: sql`${schema.contentDraft.draftVersion} + 1`, updatedAt: sql`now()`, updatedBy: author })
      .where(eq(schema.contentDraft.id, current.id))
      .returning();
    return toDraft(row);
  });
}

/** What publishing the draft would change: the live document → the draft. */
export async function draftChanges(x: DbExecutor, ref: EntityRef): Promise<Change[]> {
  const draft = await getDraft(x, ref);
  if (!draft) throw new NotFound("Không có bản nháp.");
  const live = await composeEntity(x, ref.type, ref.id);
  return publishChanges(live?.document ?? null, draft.snapshot);
}
