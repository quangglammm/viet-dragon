import { and, eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";
import {
  DOCUMENT_SCHEMA,
  type CategoryDocument,
  type FastPrintItemDocument,
  type MaterialDocument,
  type PostCategoryDocument,
  type ShowcaseItemDocument,
  type SpecItemDocument,
  type TraitDocument,
  type UnitDocument,
} from "../schemas";
import { coverMedia, i18nMap, imageMedia, ogMedia, optional, seoOf, type Composed } from "./shared";

// Rows → the documents of categories and the library (materials, traits, units, spec items), Fast Print, showcase
// and blog categories. Vocabulary is identified by its immutable key; Fast Print and showcase items by uid.

const one = <T>(rows: T[]): T | undefined => rows[0];

export async function composeCategory(x: DbExecutor, id: string): Promise<Composed<CategoryDocument> | null> {
  const head = one(
    await x
      .select({ id: schema.category.id, icon: schema.category.icon, position: schema.category.position, version: schema.category.version, cover: coverMedia.storageKey, ogImage: ogMedia.storageKey })
      .from(schema.category)
      .leftJoin(coverMedia, eq(coverMedia.id, schema.category.coverMediaId))
      .leftJoin(ogMedia, eq(ogMedia.id, schema.category.ogMediaId))
      .where(eq(schema.category.id, id)),
  );
  if (!head) return null;
  const texts = await x.select().from(schema.categoryI18n).where(eq(schema.categoryI18n.categoryId, id));
  return {
    document: {
      schema: DOCUMENT_SCHEMA,
      key: head.id,
      icon: head.icon,
      cover: head.cover,
      ogImage: head.ogImage,
      position: head.position,
      i18n: i18nMap(texts, (t) => ({ name: t.name, ...optional("description", t.description), ...seoOf(t) })),
    },
    version: head.version,
  };
}

export async function composeMaterial(x: DbExecutor, slug: string): Promise<Composed<MaterialDocument> | null> {
  const head = one(await x.select().from(schema.material).where(eq(schema.material.slug, slug)));
  if (!head) return null;
  const texts = await x.select().from(schema.materialI18n).where(eq(schema.materialI18n.materialId, head.id));
  return { document: { schema: DOCUMENT_SCHEMA, key: head.slug, icon: head.icon, i18n: i18nMap(texts, (t) => ({ name: t.name })) }, version: head.version };
}

export async function composeTrait(x: DbExecutor, key: string): Promise<Composed<TraitDocument> | null> {
  const head = one(await x.select().from(schema.trait).where(eq(schema.trait.key, key)));
  if (!head) return null;
  const texts = await x.select().from(schema.traitI18n).where(eq(schema.traitI18n.traitKey, key));
  return { document: { schema: DOCUMENT_SCHEMA, key: head.key, icon: head.icon, i18n: i18nMap(texts, (t) => ({ label: t.label, ...optional("description", t.description) })) }, version: head.version };
}

export async function composeUnit(x: DbExecutor, key: string): Promise<Composed<UnitDocument> | null> {
  const head = one(await x.select().from(schema.unit).where(eq(schema.unit.key, key)));
  if (!head) return null;
  const texts = await x.select().from(schema.unitI18n).where(eq(schema.unitI18n.unitKey, key));
  return { document: { schema: DOCUMENT_SCHEMA, key: head.key, i18n: i18nMap(texts, (t) => ({ label: t.label })) }, version: head.version };
}

/** The key of a spec item is `<kind>/<item key>`, e.g. `technique/offset`. */
export async function composeSpecItem(x: DbExecutor, key: string): Promise<Composed<SpecItemDocument> | null> {
  const [kind, itemKey] = key.split("/");
  const head = one(await x.select().from(schema.specItem).where(and(eq(schema.specItem.kind, kind as schema.SpecKind), eq(schema.specItem.key, itemKey ?? ""))));
  if (!head) return null;
  const texts = await x.select().from(schema.specItemI18n).where(eq(schema.specItemI18n.specItemId, head.id));
  return { document: { schema: DOCUMENT_SCHEMA, key: `${head.kind}/${head.key}`, isDefault: head.isDefault, i18n: i18nMap(texts, (t) => ({ label: t.label })) }, version: head.version };
}

export async function composePostCategory(x: DbExecutor, key: string): Promise<Composed<PostCategoryDocument> | null> {
  const head = one(await x.select().from(schema.postCategory).where(eq(schema.postCategory.key, key)));
  if (!head) return null;
  const texts = await x.select().from(schema.postCategoryI18n).where(eq(schema.postCategoryI18n.categoryKey, key));
  return { document: { schema: DOCUMENT_SCHEMA, key: head.key, i18n: i18nMap(texts, (t) => ({ label: t.label })) }, version: head.version };
}

export async function composeFastPrintItem(x: DbExecutor, uid: string): Promise<Composed<FastPrintItemDocument> | null> {
  const head = one(
    await x
      .select({
        id: schema.fastPrintItem.id, key: schema.fastPrintItem.key, icon: schema.fastPrintItem.icon, turnaroundHours: schema.fastPrintItem.turnaroundHours, fromPrice: schema.fastPrintItem.fromPrice,
        unit: schema.fastPrintItem.unitKey, position: schema.fastPrintItem.position, status: schema.fastPrintItem.status, version: schema.fastPrintItem.version, image: imageMedia.storageKey,
      })
      .from(schema.fastPrintItem)
      .leftJoin(imageMedia, eq(imageMedia.id, schema.fastPrintItem.imageMediaId))
      .where(eq(schema.fastPrintItem.uid, uid)),
  );
  if (!head) return null;
  const texts = await x.select().from(schema.fastPrintItemI18n).where(eq(schema.fastPrintItemI18n.itemId, head.id));
  return {
    document: {
      schema: DOCUMENT_SCHEMA,
      uid,
      key: head.key,
      image: head.image,
      icon: head.icon,
      turnaroundHours: head.turnaroundHours,
      fromPrice: head.fromPrice,
      unit: head.unit,
      position: head.position,
      status: head.status,
      i18n: i18nMap(texts, (t) => ({ name: t.name, ...optional("tag", t.tag), ...optional("description", t.description) })),
    },
    version: head.version,
  };
}

export async function composeShowcaseItem(x: DbExecutor, uid: string): Promise<Composed<ShowcaseItemDocument> | null> {
  const head = one(
    await x
      .select({ id: schema.showcaseItem.id, key: schema.showcaseItem.key, aspect: schema.showcaseItem.aspect, position: schema.showcaseItem.position, version: schema.showcaseItem.version, media: imageMedia.storageKey })
      .from(schema.showcaseItem)
      .innerJoin(imageMedia, eq(imageMedia.id, schema.showcaseItem.mediaId))
      .where(eq(schema.showcaseItem.uid, uid)),
  );
  if (!head) return null;
  const texts = await x.select().from(schema.showcaseItemI18n).where(eq(schema.showcaseItemI18n.itemId, head.id));
  return {
    document: { schema: DOCUMENT_SCHEMA, uid, key: head.key, media: head.media, aspect: head.aspect, position: head.position, i18n: i18nMap(texts, (t) => ({ label: t.label })) },
    version: head.version,
  };
}
