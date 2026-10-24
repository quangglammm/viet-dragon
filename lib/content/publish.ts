import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { RevisionAction } from "@/lib/db/content/drafts";
import type { Db, Tx } from "@/lib/db/types";
import { applierFor } from "./apply";
import { affectedBy, type Affected } from "./cache-tags";
import { composeEntity, type EntityRef } from "./compose";
import { diffDocuments } from "./diff";
import { lockDraft, type Draft } from "./drafts";
import { Conflict, Invalid, zodIssues } from "./errors";
import { humanize } from "./humanize";
import { identityOf } from "./identity";
import { checkReferences, collectReferences } from "./references";
import { restoredVersionOf } from "./restore";
import { latestRevisionVersion, writeRevision } from "./revision";
import { parseDocument } from "./schemas";

// Publishing: the draft becomes the live entity, in ONE transaction. Lock order is draft → live row (→ categories, in a
// fixed order, when a product moves). Any failure rolls everything back and the draft is kept, untouched, for the editor to fix.

export interface PublishInput {
  /** The `draftVersion` the editor previewed: a draft saved after that is refused. */
  expectDraftVersion: number;
  /** Account id of the publisher; null for the system. */
  author: string | null;
  comment?: string;
}

export interface PublishResult {
  ref: EntityRef;
  /** The entity's version after the publish. */
  version: number;
  action: RevisionAction;
  /** Everything whose rendering changed: the entity itself, and for a product the menus it left and joined. */
  affected: Affected[];
}

/** The live version must be the one the draft started from, and a new entity must not exist yet. */
async function assertBase(tx: Tx, ref: EntityRef, draft: Draft, liveVersion: number | null): Promise<void> {
  if (draft.baseVersion === null) {
    if (liveVersion !== null) throw new Conflict("ALREADY_EXISTS", "Mục này đã tồn tại, nên bản nháp tạo mới không thể xuất bản.");
    return;
  }
  if (liveVersion === null) throw new Conflict("GONE", "Nội dung gốc của bản nháp đã bị xóa.");
  if (liveVersion === draft.baseVersion) return;
  const live = await composeEntity(tx, ref.type, ref.id);
  throw new Conflict(
    "STALE_BASE",
    `Nội dung đã được người khác sửa (phiên bản ${liveVersion}) sau khi bản nháp bắt đầu từ phiên bản ${draft.baseVersion}.`,
    diffDocuments(live?.document ?? null, draft.snapshot),
  );
}

export const statusOf = (document: unknown): unknown => (typeof document === "object" && document !== null ? (document as { status?: unknown }).status : undefined);

function actionFor(draft: Draft, before: unknown, after: unknown): RevisionAction {
  if (restoredVersionOf(draft.note) !== null) return "restore";
  if (draft.baseVersion === null) return "create";
  return statusOf(before) !== "archived" && statusOf(after) === "archived" ? "archive" : "update";
}

async function publishInTransaction(tx: Tx, ref: EntityRef, input: PublishInput): Promise<PublishResult> {
  const draft = await lockDraft(tx, ref);
  if (!draft) throw new Conflict("GONE", "Bản nháp không còn nữa (đã xuất bản hoặc đã hủy).");
  if (draft.draftVersion !== input.expectDraftVersion) {
    throw new Conflict("DRAFT_CHANGED", "Bản nháp đã thay đổi sau khi bạn xem trước. Hãy xem lại bản mới nhất rồi xuất bản.");
  }

  const parsed = parseDocument(ref.type, draft.snapshot);
  if (!parsed.success) throw new Invalid(zodIssues(parsed.error));
  const applier = applierFor(ref.type);

  const liveVersion = await applier.lock(tx, ref.id);
  await assertBase(tx, ref, draft, liveVersion);

  const missing = await checkReferences(tx, collectReferences(ref.type, parsed.data));
  if (missing.length > 0) throw new Invalid(missing);

  const before = liveVersion === null ? null : (await composeEntity(tx, ref.type, ref.id))?.document;
  const startVersion = draft.baseVersion === null ? (await latestRevisionVersion(tx, ref)) + 1 : 1;
  const version = await applier.apply(tx, parsed.data, { author: input.author, baseVersion: draft.baseVersion, startVersion });

  // The revision records what was STORED (it includes the aliases a publish keeps automatically), not what was sent.
  const stored = await composeEntity(tx, ref.type, ref.id);
  if (!stored) throw new Error(`published ${ref.type} ${ref.id} cannot be read back`);
  const action = actionFor(draft, before, stored.document);
  const restored = restoredVersionOf(draft.note);
  await writeRevision(tx, {
    entityType: ref.type,
    identity: identityOf(ref),
    version,
    action,
    snapshot: stored.document,
    comment: input.comment ?? (restored === null ? undefined : `Khôi phục phiên bản ${restored}`),
    author: input.author,
  });
  await tx.delete(schema.contentDraft).where(eq(schema.contentDraft.id, draft.id));
  return { ref, version, action, affected: affectedBy(ref, before, stored.document) };
}

export async function publishDraft(db: Db, ref: EntityRef, input: PublishInput): Promise<PublishResult> {
  try {
    return await db.transaction((tx) => publishInTransaction(tx, ref, input));
  } catch (error) {
    throw humanize(error);
  }
}
