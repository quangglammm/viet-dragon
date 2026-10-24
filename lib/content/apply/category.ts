import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Tx } from "@/lib/db/types";
import type { CategoryDocument, LocaleCode } from "../schemas";
import { loadDocumentMedia } from "./lookups";
import { planSegments } from "./product-slugs";
import { localeEntries, touched, versionAfter } from "./shared";
import type { Applier, ApplyContext } from "./types";

// A category: its icon, images, position, texts and the URL segment it has in each language (`tiep-thi`, `tet-publications`). Its
// id is the immutable key; the segments keep every old one as an alias, like any other slug. The mega-menu is a separate document.

type Slugs = CategoryDocument["slugs"];

/** Canonical segment + named aliases + every segment held now, per language (one target for `planSegments`). */
async function writeSlugs(tx: Tx, categoryId: string, slugs: Slugs, existed: boolean): Promise<void> {
  const held: Partial<Record<LocaleCode, string[]>> = {};
  if (existed) {
    for (const row of await tx.select().from(schema.categorySlug).where(eq(schema.categorySlug.categoryId, categoryId))) (held[row.locale as LocaleCode] ??= []).push(row.slug);
  }
  await tx.delete(schema.categorySlug).where(eq(schema.categorySlug.categoryId, categoryId));
  const rows = planSegments([{ key: categoryId, slugs, held }]);
  await tx.insert(schema.categorySlug).values(rows.map((row) => ({ categoryId, locale: row.locale, slug: row.slug, isCanonical: row.isCanonical })));
}

async function applyCategory(tx: Tx, doc: CategoryDocument, context: ApplyContext): Promise<number> {
  const version = versionAfter(context);
  const media = await loadDocumentMedia(tx, "category", doc);
  const columns = { icon: doc.icon, coverMediaId: media.idOrNull(doc.cover), ogMediaId: media.idOrNull(doc.ogImage), position: doc.position, version };
  const existed = context.baseVersion !== null;
  if (existed) await tx.update(schema.category).set({ ...columns, ...touched(context.author) }).where(eq(schema.category.id, doc.key));
  else await tx.insert(schema.category).values({ id: doc.key, ...columns, updatedBy: context.author });

  await writeSlugs(tx, doc.key, doc.slugs, existed);
  await tx.delete(schema.categoryI18n).where(eq(schema.categoryI18n.categoryId, doc.key));
  await tx.insert(schema.categoryI18n).values(
    localeEntries(doc.i18n).map(([locale, t]) => ({
      categoryId: doc.key,
      locale,
      name: t.name,
      description: t.description ?? null,
      seoTitle: t.seoTitle ?? null,
      seoDescription: t.seoDescription ?? null,
    })),
  );
  return version;
}

export const categoryApplier: Applier<CategoryDocument> = {
  async lock(tx, id) {
    const [row] = await tx.select({ version: schema.category.version }).from(schema.category).where(eq(schema.category.id, id)).for("no key update");
    return row?.version ?? null;
  },
  apply: applyCategory,
};
