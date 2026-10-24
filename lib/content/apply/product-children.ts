import { eq, inArray } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Tx } from "@/lib/db/types";
import { Invalid } from "../errors";
import type { ProductDocument } from "../schemas";
import type { IdMap } from "./lookups";
import { loadHeldSegments, planSegments, type HeldSegments, type SegmentTarget } from "./product-slugs";
import { localeEntries } from "./shared";

// The children of a product: shapes, options (with translations, bullets, photos), sizes, specs, and the URL segments of
// shapes and options. Shapes and options are UPSERTED BY UID, so their database ids survive every publish; everything that
// has no identity of its own (translations, bullets, photos, sizes, specs) is replaced.

export interface ChildLookups {
  media: IdMap;
  materials: IdMap;
  specItems: IdMap;
}

type Shape = ProductDocument["shapes"][number];
type Option = ProductDocument["options"][number];

/** The id of a shape a child points at; a child pointing at a shape that is not in the document is refused. */
function shapeIdOf(shapeIds: ReadonlyMap<string, number>, uid: string, what: string): number {
  const id = shapeIds.get(uid);
  if (id === undefined) throw new Invalid([{ path: "", message: `${what} trỏ tới hình dạng ${uid} không có trong sản phẩm.` }]);
  return id;
}

/** Updates the rows that exist, inserts the new ones, and returns the id of each uid in the document plus the ids to remove. */
async function upsertByUid<Row extends { uid: string }>(
  documents: readonly Row[],
  existing: ReadonlyMap<string, number>,
  update: (id: number, row: Row) => Promise<void>,
  insert: (rows: Row[]) => Promise<{ id: number; uid: string }[]>,
): Promise<{ ids: Map<string, number>; removed: number[] }> {
  const ids = new Map<string, number>();
  const created: Row[] = [];
  for (const row of documents) {
    const id = existing.get(row.uid);
    if (id === undefined) created.push(row);
    else {
      await update(id, row);
      ids.set(row.uid, id);
    }
  }
  if (created.length > 0) for (const { id, uid } of await insert(created)) ids.set(uid, id);
  const kept = new Set(ids.values());
  return { ids, removed: [...existing.values()].filter((id) => !kept.has(id)) };
}

async function upsertShapes(tx: Tx, productId: number, shapes: readonly Shape[], media: IdMap): Promise<{ ids: Map<string, number>; removed: number[] }> {
  const existing = new Map((await tx.select({ id: schema.shape.id, uid: schema.shape.uid }).from(schema.shape).where(eq(schema.shape.productId, productId))).map((r) => [r.uid, r.id]));
  const columns = (s: Shape) => ({ imageMediaId: media.idOrNull(s.image), ogMediaId: media.idOrNull(s.ogImage), position: s.position });
  const result = await upsertByUid(
    shapes,
    existing,
    async (id, s) => void (await tx.update(schema.shape).set(columns(s)).where(eq(schema.shape.id, id))),
    (rows) => tx.insert(schema.shape).values(rows.map((s) => ({ uid: s.uid, productId, ...columns(s) }))).returning({ id: schema.shape.id, uid: schema.shape.uid }),
  );
  const kept = [...result.ids.values()];
  if (kept.length > 0) await tx.delete(schema.shapeI18n).where(inArray(schema.shapeI18n.shapeId, kept));
  const texts = shapes.flatMap((s) =>
    localeEntries(s.i18n).map(([locale, t]) => ({
      shapeId: result.ids.get(s.uid)!,
      locale,
      name: t.name,
      description: t.description ?? null,
      badge: t.badge ?? null,
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
    })),
  );
  if (texts.length > 0) await tx.insert(schema.shapeI18n).values(texts);
  return result;
}

async function upsertOptions(
  tx: Tx,
  productId: number,
  options: readonly Option[],
  shapeIds: ReadonlyMap<string, number>,
  lookups: ChildLookups,
): Promise<{ ids: Map<string, number>; removed: number[] }> {
  const existing = new Map((await tx.select({ id: schema.option.id, uid: schema.option.uid }).from(schema.option).where(eq(schema.option.productId, productId))).map((r) => [r.uid, r.id]));
  const columns = (o: Option) => ({
    shapeId: o.shape === null ? null : shapeIdOf(shapeIds, o.shape, "Tùy chọn"),
    materialId: lookups.materials.id(o.material),
    position: o.position,
    icon: o.icon,
    hideFoil: o.hideFoil,
    hideDoubleSided: o.hideDoubleSided,
    basePrice: o.prices.base,
    doubleSidedPrice: o.prices.doubleSided,
    foilPrice: o.prices.foil,
    foil2Price: o.prices.foil2,
    unitKey: o.unit,
    ogMediaId: lookups.media.idOrNull(o.ogImage),
  });
  const result = await upsertByUid(
    options,
    existing,
    async (id, o) => void (await tx.update(schema.option).set(columns(o)).where(eq(schema.option.id, id))),
    (rows) => tx.insert(schema.option).values(rows.map((o) => ({ uid: o.uid, productId, ...columns(o) }))).returning({ id: schema.option.id, uid: schema.option.uid }),
  );
  await replaceOptionContent(tx, options, result.ids, lookups.media);
  return result;
}

/** Translations, bullets and photos of the options in the document: replaced wholesale (nothing refers to them by id). */
async function replaceOptionContent(tx: Tx, options: readonly Option[], ids: ReadonlyMap<string, number>, media: IdMap): Promise<void> {
  const optionIds = [...ids.values()];
  if (optionIds.length === 0) return;
  await tx.delete(schema.optionI18n).where(inArray(schema.optionI18n.optionId, optionIds));
  await tx.delete(schema.optionBullet).where(inArray(schema.optionBullet.optionId, optionIds));
  await tx.delete(schema.optionImage).where(inArray(schema.optionImage.optionId, optionIds));

  const texts = options.flatMap((o) =>
    localeEntries(o.i18n).map(([locale, t]) => ({
      optionId: ids.get(o.uid)!,
      locale,
      name: t.name ?? null,
      cardTitle: t.cardTitle ?? null,
      tagline: t.tagline ?? null,
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
    })),
  );
  if (texts.length > 0) await tx.insert(schema.optionI18n).values(texts);

  const bullets = options.flatMap((o) => o.bullets.map((b) => ({ optionId: ids.get(o.uid)!, kind: b.kind, position: b.position, traitKey: b.trait, i18n: b.i18n })));
  if (bullets.length > 0) {
    const stored = await tx
      .insert(schema.optionBullet)
      .values(bullets.map((b) => ({ optionId: b.optionId, kind: b.kind, position: b.position, traitKey: b.traitKey })))
      .returning({ id: schema.optionBullet.id, optionId: schema.optionBullet.optionId, kind: schema.optionBullet.kind, position: schema.optionBullet.position });
    const bulletId = new Map(stored.map((r) => [`${r.optionId}|${r.kind}|${r.position}`, r.id]));
    const bulletTexts = bullets.flatMap((b) =>
      localeEntries(b.i18n).map(([locale, text]) => ({ bulletId: bulletId.get(`${b.optionId}|${b.kind}|${b.position}`)!, locale, text })),
    );
    if (bulletTexts.length > 0) await tx.insert(schema.optionBulletI18n).values(bulletTexts);
  }

  const images = options.flatMap((o) =>
    (["default", "pure"] as const).flatMap((variant) =>
      o.images[variant].map((key, position) => ({ optionId: ids.get(o.uid)!, variant, position, mediaId: media.id(key) })),
    ),
  );
  if (images.length > 0) await tx.insert(schema.optionImage).values(images);
}

async function writeSegments(tx: Tx, productId: number, doc: ProductDocument, shapeIds: ReadonlyMap<string, number>, optionIds: ReadonlyMap<string, number>, held: HeldSegments): Promise<void> {
  const targets: SegmentTarget[] = [
    ...doc.shapes.map((s) => ({ key: `s:${s.uid}`, slugs: s.slugs, held: held.get(`s:${s.uid}`) ?? {} })),
    ...doc.options.map((o) => ({ key: `o:${o.uid}`, slugs: o.slugs, held: held.get(`o:${o.uid}`) ?? {} })),
  ];
  const rows = planSegments(targets).map((row) => {
    const isShape = row.key.startsWith("s:");
    const uid = row.key.slice(2);
    return {
      productId,
      locale: row.locale,
      slug: row.slug,
      shapeId: isShape ? shapeIds.get(uid)! : null,
      optionId: isShape ? null : optionIds.get(uid)!,
      isCanonical: row.isCanonical,
    };
  });
  if (rows.length > 0) await tx.insert(schema.productSegment).values(rows);
}

/** Shapes, options and their URL segments. The segments the product holds are read first and rebuilt last (see `planSegments`). */
export async function writeShapesAndOptions(tx: Tx, productId: number, doc: ProductDocument, existed: boolean, lookups: ChildLookups): Promise<ReadonlyMap<string, number>> {
  const held: HeldSegments = existed ? await loadHeldSegments(tx, productId) : new Map();
  await tx.delete(schema.productSegment).where(eq(schema.productSegment.productId, productId));

  const shapes = await upsertShapes(tx, productId, doc.shapes, lookups.media);
  const options = await upsertOptions(tx, productId, doc.options, shapes.ids, lookups);
  // What the document no longer contains goes last: a shape or option a menu still points at fails the COMMIT, by design.
  if (options.removed.length > 0) await tx.delete(schema.option).where(inArray(schema.option.id, options.removed));
  if (shapes.removed.length > 0) await tx.delete(schema.shape).where(inArray(schema.shape.id, shapes.removed));

  await writeSegments(tx, productId, doc, shapes.ids, options.ids, held);
  return shapes.ids;
}

export async function writeSizesAndSpecs(tx: Tx, productId: number, doc: ProductDocument, shapeIds: ReadonlyMap<string, number>, specItems: IdMap): Promise<void> {
  await tx.delete(schema.sizeOption).where(eq(schema.sizeOption.productId, productId));
  await tx.delete(schema.productSpec).where(eq(schema.productSpec.productId, productId));

  const scope = (shape: string | null): number | null => (shape === null ? null : shapeIdOf(shapeIds, shape, "Kích thước hoặc thông số"));
  if (doc.sizes.length > 0) {
    const stored = await tx
      .insert(schema.sizeOption)
      .values(doc.sizes.map((z) => ({ productId, shapeId: scope(z.shape), tier: z.tier, widthMm: z.w, heightMm: z.h, depthMm: z.d, dimsText: z.text })))
      .returning({ id: schema.sizeOption.id, shapeId: schema.sizeOption.shapeId, tier: schema.sizeOption.tier });
    const sizeId = new Map(stored.map((r) => [`${r.shapeId ?? "*"}|${r.tier}`, r.id]));
    const notes = doc.sizes.flatMap((z) => localeEntries(z.i18n).map(([locale, note]) => ({ sizeOptionId: sizeId.get(`${scope(z.shape) ?? "*"}|${z.tier}`)!, locale, note })));
    if (notes.length > 0) await tx.insert(schema.sizeOptionI18n).values(notes);
  }
  if (doc.specs.length > 0) {
    await tx.insert(schema.productSpec).values(doc.specs.map((s) => ({ productId, shapeId: scope(s.shape), specItemId: specItems.id(`${s.kind}/${s.item}`), position: s.position })));
  }
}
