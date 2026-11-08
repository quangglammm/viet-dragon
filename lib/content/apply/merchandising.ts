import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Tx } from "@/lib/db/types";
import type { FastPrintItemDocument, ShowcaseItemDocument } from "../schemas";
import { loadDocumentMedia } from "./lookups";
import { localeEntries, touched, versionAfter } from "./shared";
import type { Applier, ApplyContext } from "./types";

// Fast Print items ("In nhanh lấy liền") and the showcase gallery of the products page. Both are identified by a uid; their `key`
// is an ordinary (unique) attribute.

async function applyFastPrintItem(tx: Tx, doc: FastPrintItemDocument, context: ApplyContext): Promise<number> {
  const version = versionAfter(context);
  const media = await loadDocumentMedia(tx, "fast_print_item", doc);
  const columns = {
    key: doc.key,
    imageMediaId: media.idOrNull(doc.image),
    icon: doc.icon,
    turnaroundHours: doc.turnaroundHours,
    fromPrice: doc.fromPrice,
    unitKey: doc.unit,
    position: doc.position,
    status: doc.status,
    version,
  };
  let itemId: number;
  if (context.baseVersion === null) {
    [{ id: itemId }] = await tx.insert(schema.fastPrintItem).values({ uid: doc.uid, ...columns, updatedBy: context.author }).returning({ id: schema.fastPrintItem.id });
  } else {
    [{ id: itemId }] = await tx.update(schema.fastPrintItem).set({ ...columns, ...touched(context.author) }).where(eq(schema.fastPrintItem.uid, doc.uid)).returning({ id: schema.fastPrintItem.id });
  }
  await tx.delete(schema.fastPrintItemI18n).where(eq(schema.fastPrintItemI18n.itemId, itemId));
  await tx.insert(schema.fastPrintItemI18n).values(
    localeEntries(doc.i18n).map(([locale, t]) => ({ itemId, locale, name: t.name, tag: t.tag ?? null, description: t.description ?? null })),
  );
  return version;
}

async function applyShowcaseItem(tx: Tx, doc: ShowcaseItemDocument, context: ApplyContext): Promise<number> {
  const version = versionAfter(context);
  const media = await loadDocumentMedia(tx, "showcase_item", doc);
  const columns = { key: doc.key, mediaId: media.id(doc.media), aspect: doc.aspect, position: doc.position, version };
  let itemId: number;
  if (context.baseVersion === null) {
    [{ id: itemId }] = await tx.insert(schema.showcaseItem).values({ uid: doc.uid, ...columns, updatedBy: context.author }).returning({ id: schema.showcaseItem.id });
  } else {
    [{ id: itemId }] = await tx.update(schema.showcaseItem).set({ ...columns, ...touched(context.author) }).where(eq(schema.showcaseItem.uid, doc.uid)).returning({ id: schema.showcaseItem.id });
  }
  await tx.delete(schema.showcaseItemI18n).where(eq(schema.showcaseItemI18n.itemId, itemId));
  await tx.insert(schema.showcaseItemI18n).values(localeEntries(doc.i18n).map(([locale, t]) => ({ itemId, locale, label: t.label })));
  return version;
}

export const fastPrintItemApplier: Applier<FastPrintItemDocument> = {
  async lock(tx, uid) {
    const [row] = await tx.select({ version: schema.fastPrintItem.version }).from(schema.fastPrintItem).where(eq(schema.fastPrintItem.uid, uid)).for("no key update");
    return row?.version ?? null;
  },
  apply: applyFastPrintItem,
};

export const showcaseItemApplier: Applier<ShowcaseItemDocument> = {
  async lock(tx, uid) {
    const [row] = await tx.select({ version: schema.showcaseItem.version }).from(schema.showcaseItem).where(eq(schema.showcaseItem.uid, uid)).for("no key update");
    return row?.version ?? null;
  },
  apply: applyShowcaseItem,
};
