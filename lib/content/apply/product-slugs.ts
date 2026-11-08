import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";
import { LOCALES, type LocaleCode, type ProductDocument } from "../schemas";

// URLs are never lost: a publish keeps, per language, the canonical slug and the aliases the document names, PLUS every
// alias the product already held and its previous canonical slug. Restoring an old revision therefore cannot drop a newer
// URL. An old URL is released only by the explicit `releaseAlias` action.

export interface ProductSlugRow {
  locale: LocaleCode;
  categoryId: string;
  slug: string;
  isCanonical: boolean;
}

/** The `product_slug` rows after a publish. `held` = the rows the product has now (its canonical ones become aliases when they change). */
export function planProductSlugs(doc: Pick<ProductDocument, "category" | "slugs">, held: readonly ProductSlugRow[]): ProductSlugRow[] {
  return LOCALES.flatMap((locale) => {
    const entry = doc.slugs[locale];
    const canonical: ProductSlugRow = { locale, categoryId: doc.category, slug: entry.slug, isCanonical: true };
    const aliases = new Map<string, ProductSlugRow>();
    const keep = (categoryId: string, slug: string) => {
      if (categoryId === doc.category && slug === entry.slug) return;
      aliases.set(`${categoryId}/${slug}`, { locale, categoryId, slug, isCanonical: false });
    };
    for (const alias of entry.aliases) keep(alias.category, alias.slug);
    for (const row of held) if (row.locale === locale) keep(row.categoryId, row.slug);
    return [canonical, ...aliases.values()];
  });
}

export async function writeProductSlugs(tx: DbExecutor, productId: number, doc: Pick<ProductDocument, "category" | "slugs">, existed: boolean): Promise<void> {
  const held: ProductSlugRow[] = existed
    ? (await tx.select().from(schema.productSlug).where(eq(schema.productSlug.productId, productId))).map((r) => ({ locale: r.locale as LocaleCode, categoryId: r.categoryId, slug: r.slug, isCanonical: r.isCanonical }))
    : [];
  await tx.delete(schema.productSlug).where(eq(schema.productSlug.productId, productId));
  await tx.insert(schema.productSlug).values(planProductSlugs(doc, held).map((row) => ({ ...row, productId })));
}

// ───────────── shapes and options: the third URL segment ─────────────

/** `s:<uid>` for a shape, `o:<uid>` for an option. */
export type SegmentKey = string;

export interface SegmentTarget {
  key: SegmentKey;
  slugs: Record<LocaleCode, { slug: string; aliases: string[] }>;
  /** Every slug the target holds now, per language (its canonical one included): kept as aliases when still free. */
  held: Partial<Record<LocaleCode, string[]>>;
}

export interface SegmentRow {
  key: SegmentKey;
  locale: LocaleCode;
  slug: string;
  isCanonical: boolean;
}

/**
 * The `product_segment` rows after a publish. Shapes, options and their aliases share ONE namespace per product, separately in
 * each language, so priority decides who keeps a slug two targets both want: canonical slugs first, then the aliases the
 * document names, then the ones held before. (A shape renamed while an option takes its old slug: the option keeps it.)
 */
export function planSegments(targets: readonly SegmentTarget[]): SegmentRow[] {
  return LOCALES.flatMap((locale) => {
    const used = new Set(targets.map((t) => t.slugs[locale].slug));
    const rows: SegmentRow[] = targets.map((t) => ({ key: t.key, locale, slug: t.slugs[locale].slug, isCanonical: true }));
    const claim = (key: SegmentKey, slug: string) => {
      if (used.has(slug)) return;
      used.add(slug);
      rows.push({ key, locale, slug, isCanonical: false });
    };
    for (const t of targets) t.slugs[locale].aliases.forEach((slug) => claim(t.key, slug));
    for (const t of targets) (t.held[locale] ?? []).forEach((slug) => claim(t.key, slug));
    return rows;
  });
}

export type HeldSegments = Map<SegmentKey, Partial<Record<LocaleCode, string[]>>>;

/** What each shape / option holds now, by `SegmentKey`; read BEFORE the segments are cleared. */
export async function loadHeldSegments(tx: DbExecutor, productId: number): Promise<HeldSegments> {
  const rows = await tx
    .select({ locale: schema.productSegment.locale, slug: schema.productSegment.slug, shapeUid: schema.shape.uid, optionUid: schema.option.uid })
    .from(schema.productSegment)
    .leftJoin(schema.shape, eq(schema.shape.id, schema.productSegment.shapeId))
    .leftJoin(schema.option, eq(schema.option.id, schema.productSegment.optionId))
    .where(eq(schema.productSegment.productId, productId));
  const held: HeldSegments = new Map();
  for (const row of rows) {
    const key = row.shapeUid ? `s:${row.shapeUid}` : `o:${row.optionUid}`;
    const perLocale = held.get(key) ?? held.set(key, {}).get(key)!;
    const locale = row.locale as LocaleCode;
    (perLocale[locale] ??= []).push(row.slug);
  }
  return held;
}
