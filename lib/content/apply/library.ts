import { and, eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Tx } from "@/lib/db/types";
import type { MaterialDocument, PostCategoryDocument, SpecItemDocument, TraitDocument, UnitDocument } from "../schemas";
import { localeEntries, touched, versionAfter } from "./shared";
import type { Applier, ApplyContext } from "./types";

// The vocabulary shared by products and posts: materials, traits (bullet icons), units, spec items and blog categories.
// Each is identified by an immutable key and has no status, so there is nothing to archive — a record that nothing uses is deleted
// (delete.ts). Their translations are replaced wholesale.

const MATERIAL_SLUG = schema.material.slug;

export const materialApplier: Applier<MaterialDocument> = {
  async lock(tx, slug) {
    const [row] = await tx.select({ version: schema.material.version }).from(schema.material).where(eq(MATERIAL_SLUG, slug)).for("no key update");
    return row?.version ?? null;
  },
  async apply(tx, doc, context) {
    const version = versionAfter(context);
    const [existing] = await tx.select({ id: schema.material.id }).from(schema.material).where(eq(MATERIAL_SLUG, doc.key));
    let materialId: number;
    if (existing) {
      materialId = existing.id;
      await tx.update(schema.material).set({ icon: doc.icon, version, ...touched(context.author) }).where(eq(schema.material.id, materialId));
    } else {
      [{ id: materialId }] = await tx.insert(schema.material).values({ slug: doc.key, icon: doc.icon, version, updatedBy: context.author }).returning({ id: schema.material.id });
    }
    await tx.delete(schema.materialI18n).where(eq(schema.materialI18n.materialId, materialId));
    await tx.insert(schema.materialI18n).values(localeEntries(doc.i18n).map(([locale, t]) => ({ materialId, locale, name: t.name })));
    return version;
  },
};

export const traitApplier: Applier<TraitDocument> = {
  async lock(tx, key) {
    const [row] = await tx.select({ version: schema.trait.version }).from(schema.trait).where(eq(schema.trait.key, key)).for("no key update");
    return row?.version ?? null;
  },
  async apply(tx, doc, context) {
    const version = versionAfter(context);
    const columns = { icon: doc.icon, version, ...touched(context.author) };
    if (context.baseVersion === null) await tx.insert(schema.trait).values({ key: doc.key, icon: doc.icon, version, updatedBy: context.author });
    else await tx.update(schema.trait).set(columns).where(eq(schema.trait.key, doc.key));
    await tx.delete(schema.traitI18n).where(eq(schema.traitI18n.traitKey, doc.key));
    await tx.insert(schema.traitI18n).values(localeEntries(doc.i18n).map(([locale, t]) => ({ traitKey: doc.key, locale, label: t.label, description: t.description ?? null })));
    return version;
  },
};

export const unitApplier: Applier<UnitDocument> = {
  async lock(tx, key) {
    const [row] = await tx.select({ version: schema.unit.version }).from(schema.unit).where(eq(schema.unit.key, key)).for("no key update");
    return row?.version ?? null;
  },
  async apply(tx, doc, context) {
    const version = versionAfter(context);
    if (context.baseVersion === null) await tx.insert(schema.unit).values({ key: doc.key, version, updatedBy: context.author });
    else await tx.update(schema.unit).set({ version, ...touched(context.author) }).where(eq(schema.unit.key, doc.key));
    await tx.delete(schema.unitI18n).where(eq(schema.unitI18n.unitKey, doc.key));
    await tx.insert(schema.unitI18n).values(localeEntries(doc.i18n).map(([locale, t]) => ({ unitKey: doc.key, locale, label: t.label })));
    return version;
  },
};

export const postCategoryApplier: Applier<PostCategoryDocument> = {
  async lock(tx, key) {
    const [row] = await tx.select({ version: schema.postCategory.version }).from(schema.postCategory).where(eq(schema.postCategory.key, key)).for("no key update");
    return row?.version ?? null;
  },
  async apply(tx, doc, context) {
    const version = versionAfter(context);
    if (context.baseVersion === null) await tx.insert(schema.postCategory).values({ key: doc.key, version, updatedBy: context.author });
    else await tx.update(schema.postCategory).set({ version, ...touched(context.author) }).where(eq(schema.postCategory.key, doc.key));
    await tx.delete(schema.postCategoryI18n).where(eq(schema.postCategoryI18n.categoryKey, doc.key));
    await tx.insert(schema.postCategoryI18n).values(localeEntries(doc.i18n).map(([locale, t]) => ({ categoryKey: doc.key, locale, label: t.label })));
    return version;
  },
};

/** A spec item's identity is `<kind>/<key>`. */
function splitSpecKey(key: string): { kind: schema.SpecKind; itemKey: string } {
  const [kind, itemKey] = key.split("/");
  return { kind: kind as schema.SpecKind, itemKey };
}

const whereSpecItem = (key: string) => {
  const { kind, itemKey } = splitSpecKey(key);
  return and(eq(schema.specItem.kind, kind), eq(schema.specItem.key, itemKey));
};

async function writeSpecItem(tx: Tx, doc: SpecItemDocument, context: ApplyContext): Promise<number> {
  const version = versionAfter(context);
  const { kind, itemKey } = splitSpecKey(doc.key);
  let specItemId: number;
  if (context.baseVersion === null) {
    [{ id: specItemId }] = await tx.insert(schema.specItem).values({ kind, key: itemKey, isDefault: doc.isDefault, version, updatedBy: context.author }).returning({ id: schema.specItem.id });
  } else {
    [{ id: specItemId }] = await tx.update(schema.specItem).set({ isDefault: doc.isDefault, version, ...touched(context.author) }).where(whereSpecItem(doc.key)).returning({ id: schema.specItem.id });
  }
  await tx.delete(schema.specItemI18n).where(eq(schema.specItemI18n.specItemId, specItemId));
  await tx.insert(schema.specItemI18n).values(localeEntries(doc.i18n).map(([locale, t]) => ({ specItemId, locale, label: t.label })));
  return version;
}

export const specItemApplier: Applier<SpecItemDocument> = {
  async lock(tx, key) {
    const [row] = await tx.select({ version: schema.specItem.version }).from(schema.specItem).where(whereSpecItem(key)).for("no key update");
    return row?.version ?? null;
  },
  apply: writeSpecItem,
};
