import { and, eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { Db, Tx } from "@/lib/db/types";
import { applierFor } from "./apply";
import { affectedBy, type Affected } from "./cache-tags";
import { composeEntity, type EntityRef } from "./compose";
import { getDraft } from "./drafts";
import { Conflict, Invalid, NotFound } from "./errors";
import { humanize } from "./humanize";
import { identityOf } from "./identity";
import { statusOf } from "./publish";
import { latestRevisionVersion, writeRevision } from "./revision";
import { USED_BY_TYPES, usedBy, type UsedByType } from "./used-by";

// Deleting is permanent, so it is deliberately narrow:
//   * categories and menus are structural and are never deleted here (a menu belongs to its category);
//   * products, posts and Fast Print items are ARCHIVED first (a normal publish with status "archived") and only then deleted;
//   * a record that something still uses is refused — live rows AND open drafts (the foreign keys cannot see drafts);
//   * an entity with an open draft is refused: the draft has to be published or discarded first.
// The deletion is itself a revision (action "delete") that keeps the last document, so it can be restored from.

export interface DeleteInput {
  /** Account id of the admin; null for the system. */
  author: string | null;
  comment?: string;
}

export interface DeleteResult {
  ref: EntityRef;
  /** The version of the "delete" revision. */
  version: number;
  affected: Affected[];
}

const NOT_DELETABLE: readonly DraftEntityType[] = ["category", "menu"];
const ARCHIVE_FIRST: readonly DraftEntityType[] = ["product", "post", "fast_print_item"];

const isUsedByType = (type: DraftEntityType): type is UsedByType => (USED_BY_TYPES as readonly string[]).includes(type);

/** Removes the live rows (their translations, children and URLs go with them). */
const REMOVE: Record<Exclude<DraftEntityType, "category" | "menu">, (tx: Tx, id: string) => Promise<unknown>> = {
  product: (tx, uid) => tx.delete(schema.product).where(eq(schema.product.uid, uid)),
  post: (tx, uid) => tx.delete(schema.post).where(eq(schema.post.uid, uid)),
  fast_print_item: (tx, uid) => tx.delete(schema.fastPrintItem).where(eq(schema.fastPrintItem.uid, uid)),
  showcase_item: (tx, uid) => tx.delete(schema.showcaseItem).where(eq(schema.showcaseItem.uid, uid)),
  material: (tx, slug) => tx.delete(schema.material).where(eq(schema.material.slug, slug)),
  trait: (tx, key) => tx.delete(schema.trait).where(eq(schema.trait.key, key)),
  unit: (tx, key) => tx.delete(schema.unit).where(eq(schema.unit.key, key)),
  spec_item: (tx, key) => {
    const [kind, itemKey] = key.split("/");
    return tx.delete(schema.specItem).where(and(eq(schema.specItem.kind, kind as schema.SpecKind), eq(schema.specItem.key, itemKey)));
  },
  post_category: (tx, key) => tx.delete(schema.postCategory).where(eq(schema.postCategory.key, key)),
  site_message: (tx, namespace) => tx.delete(schema.siteMessage).where(eq(schema.siteMessage.namespace, namespace)),
};

/** Why the record cannot go yet, or null. */
async function blocker(tx: Tx, ref: EntityRef): Promise<string | null> {
  if (isUsedByType(ref.type)) {
    const { live, drafts } = await usedBy(tx, ref.type, ref.id);
    if (live + drafts > 0) return `Vẫn đang được dùng (${live} mục đang hiển thị, ${drafts} bản nháp). Hãy gỡ nó khỏi các mục đó trước.`;
  }
  if (ref.type === "product") {
    const inMenu = await tx.$count(schema.menuGroup, eq(schema.menuGroup.productId, tx.select({ id: schema.product.id }).from(schema.product).where(eq(schema.product.uid, ref.id)).limit(1)));
    if (inMenu > 0) return "Sản phẩm vẫn còn trong menu. Hãy gỡ nó khỏi menu trước.";
  }
  return null;
}

async function deleteInTransaction(tx: Tx, ref: EntityRef, input: DeleteInput): Promise<DeleteResult> {
  if (NOT_DELETABLE.includes(ref.type)) {
    throw new Invalid([{ path: "", message: "Danh mục và menu không thể xóa ở đây: menu thuộc về danh mục, còn danh mục là cấu trúc của trang web." }]);
  }
  if ((await applierFor(ref.type).lock(tx, ref.id)) === null) throw new NotFound("Không tìm thấy nội dung để xóa.");
  const live = await composeEntity(tx, ref.type, ref.id);
  if (!live) throw new NotFound("Không tìm thấy nội dung để xóa.");

  if (await getDraft(tx, ref)) throw new Conflict("DRAFT_EXISTS", "Đang có bản nháp cho mục này. Hãy xuất bản hoặc hủy bản nháp trước khi xóa.");
  if (ARCHIVE_FIRST.includes(ref.type) && statusOf(live.document) !== "archived") {
    throw new Conflict("NOT_ARCHIVED", "Hãy lưu trữ mục này trước, rồi mới xóa hẳn.");
  }
  const blocked = await blocker(tx, ref);
  if (blocked) throw new Conflict("IN_USE", blocked);

  await REMOVE[ref.type as keyof typeof REMOVE](tx, ref.id);
  const version = Math.max(live.version, await latestRevisionVersion(tx, ref)) + 1;
  await writeRevision(tx, { entityType: ref.type, identity: identityOf(ref), version, action: "delete", snapshot: live.document, comment: input.comment, author: input.author });
  return { ref, version, affected: affectedBy(ref, live.document, null) };
}

export async function deleteEntity(db: Db, ref: EntityRef, input: DeleteInput): Promise<DeleteResult> {
  try {
    return await db.transaction((tx) => deleteInTransaction(tx, ref, input));
  } catch (error) {
    throw humanize(error);
  }
}
