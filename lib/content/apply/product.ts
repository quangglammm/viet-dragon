import { eq, inArray, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Tx } from "@/lib/db/types";
import { Invalid } from "../errors";
import { collectReferences, type ReferenceKind } from "../references";
import type { ProductDocument } from "../schemas";
import { loadMaterialIds, loadMediaIds, loadSpecItemIds } from "./lookups";
import { writeShapesAndOptions, writeSizesAndSpecs } from "./product-children";
import { writeProductSlugs } from "./product-slugs";
import { localeEntries } from "./shared";
import type { Applier, ApplyContext } from "./types";

// The product aggregate: the product, its translations and URLs, and everything below it (product-children.ts), written in
// one transaction. A product is identified by its uid; the category and slugs are ordinary editable attributes.

/**
 * Moving a product to another category takes it out of the old category's mega-menu (a menu group belongs to one category)
 * and bumps both categories' menu versions, so a menu draft started before the move cannot publish over it. Both categories
 * are locked in a fixed order, which keeps two simultaneous moves from deadlocking.
 */
async function leaveCategory(tx: Tx, productId: number, from: string, to: string, author: string | null): Promise<void> {
  const ids = [from, to].sort();
  const locked = await tx.select({ id: schema.category.id }).from(schema.category).where(inArray(schema.category.id, ids)).orderBy(schema.category.id).for("no key update");
  if (locked.length !== ids.length) throw new Invalid([{ path: "category", message: `Không tìm thấy danh mục «${to}».` }]);
  await tx.delete(schema.menuGroup).where(eq(schema.menuGroup.productId, productId));
  await tx
    .update(schema.category)
    .set({ menuVersion: sql`${schema.category.menuVersion} + 1`, updatedAt: sql`now()`, updatedBy: author })
    .where(inArray(schema.category.id, ids));
}

async function replaceTranslations(tx: Tx, productId: number, doc: ProductDocument): Promise<void> {
  await tx.delete(schema.productI18n).where(eq(schema.productI18n.productId, productId));
  const rows = localeEntries(doc.i18n).map(([locale, t]) => ({
    productId,
    locale,
    title: t.title,
    description: t.description ?? null,
    seoTitle: t.seoTitle ?? null,
    seoDescription: t.seoDescription ?? null,
  }));
  await tx.insert(schema.productI18n).values(rows);
}

async function applyProduct(tx: Tx, doc: ProductDocument, context: ApplyContext): Promise<number> {
  const [existing] = await tx
    .select({ id: schema.product.id, categoryId: schema.product.categoryId, version: schema.product.version })
    .from(schema.product)
    .where(eq(schema.product.uid, doc.uid));
  if (existing && existing.categoryId !== doc.category) await leaveCategory(tx, existing.id, existing.categoryId, doc.category, context.author);

  const references = collectReferences("product", doc);
  const keysOf = (kind: ReferenceKind) => references.filter((r) => r.kind === kind).map((r) => r.key);
  const media = await loadMediaIds(tx, keysOf("media"));
  const materials = await loadMaterialIds(tx, keysOf("material"));
  const specItems = await loadSpecItemIds(tx, keysOf("spec_item"));

  const columns = {
    categoryId: doc.category,
    coverMediaId: media.idOrNull(doc.cover),
    ogMediaId: media.idOrNull(doc.ogImage),
    position: doc.position,
    status: doc.status,
    updatedBy: context.author,
  };
  let productId: number;
  let version: number;
  if (existing) {
    productId = existing.id;
    version = existing.version + 1;
    await tx.update(schema.product).set({ ...columns, version, updatedAt: sql`now()` }).where(eq(schema.product.id, productId));
  } else {
    const [created] = await tx.insert(schema.product).values({ uid: doc.uid, ...columns }).returning({ id: schema.product.id, version: schema.product.version });
    productId = created.id;
    version = created.version;
  }

  await writeProductSlugs(tx, productId, doc, existing !== undefined);
  await replaceTranslations(tx, productId, doc);
  const shapeIds = await writeShapesAndOptions(tx, productId, doc, existing !== undefined, { media, materials, specItems });
  await writeSizesAndSpecs(tx, productId, doc, shapeIds, specItems);
  return version;
}

export const productApplier: Applier<ProductDocument> = {
  async lock(tx, uid) {
    const [row] = await tx.select({ version: schema.product.version }).from(schema.product).where(eq(schema.product.uid, uid)).for("no key update");
    return row?.version ?? null;
  },
  apply: applyProduct,
};
