import type { ShapeItem, SubgroupCategory } from "@/data/subgroups-catalog";
import * as schema from "@/lib/db/schema";
import type { MediaRegistry, ProductRecord, SeedContext, ShapeRecord } from "../context";
import { TRANSLATED_LOCALES, localizedText, translated } from "../localized";
import { KEBAB_SLUG, bump, isBlankText, orNull, uniqueSlug } from "../util";

// Products (the aggregate root) and their shapes. A product's identity is its `uid`; its category/slug live in
// product_slug, and each shape's URL segment in product_segment (every shape has exactly one canonical one).

type ProductI18nRow = typeof schema.productI18n.$inferInsert;
type ShapeI18nRow = typeof schema.shapeI18n.$inferInsert;

/** Which keys of data/translations.ts something consulted, so the report can list the orphans. */
class KeyUse {
  private readonly used = new Map<string, Set<string>>();
  mark(table: string, key: string, exists: boolean): void {
    if (!exists) return;
    (this.used.get(table) ?? this.used.set(table, new Set()).get(table)!).add(key);
  }
  unused(table: string, all: Record<string, unknown>): string[] {
    const used = this.used.get(table) ?? new Set<string>();
    return Object.keys(all).filter((key) => !used.has(key));
  }
}

function productTranslations(ctx: SeedContext, sub: SubgroupCategory, key: string, uses: KeyUse): Omit<ProductI18nRow, "productId">[] {
  const { translations } = ctx.src;
  const rows: Omit<ProductI18nRow, "productId">[] = [
    { locale: "vi", title: sub.titleVi, description: orNull(sub.descriptionVi) },
    { locale: "en", title: sub.titleEn, description: orNull(sub.descriptionEn) },
  ];
  uses.mark("ITEM_NAMES", sub.id, sub.id in translations.ITEM_NAMES);
  uses.mark("ITEM_DESCS", sub.id, sub.id in translations.ITEM_DESCS);
  for (const locale of TRANSLATED_LOCALES) {
    const own = localizedText(sub, "title", "suffixed", locale);
    const external = translated(translations.ITEM_NAMES, sub.id, locale);
    const title = own ?? external;
    const description = localizedText(sub, "description", "suffixed", locale) ?? translated(translations.ITEM_DESCS, sub.id, locale);
    if (title) rows.push({ locale, title, description: orNull(description) });
    else ctx.notes.add("product-no-title", `${key} ${locale}`);
    if (isBlankText(description)) ctx.notes.add("product-no-description", `${key} ${locale}`);
    if (own && external && own !== external) ctx.notes.add("title-precedence-differs", `${key} ${locale}`);
  }
  return rows;
}

function shapeTranslations(sh: ShapeItem, ctx: SeedContext, uses: KeyUse): Omit<ShapeI18nRow, "shapeId">[] {
  const { translations } = ctx.src;
  uses.mark("SHAPE_DESCS", sh.id, sh.id in translations.SHAPE_DESCS);
  const rows: Omit<ShapeI18nRow, "shapeId">[] = [
    { locale: "vi", name: sh.nameVi, description: orNull(sh.descriptionVi), badge: orNull(sh.badgeVi) },
    { locale: "en", name: sh.nameEn, description: orNull(sh.descriptionEn), badge: orNull(sh.badgeEn) },
  ];
  for (const locale of TRANSLATED_LOCALES) {
    const name = localizedText(sh, "name", "suffixed", locale);
    if (!name) continue;
    const description = localizedText(sh, "description", "suffixed", locale) ?? translated(translations.SHAPE_DESCS, sh.id, locale);
    rows.push({ locale, name, description: orNull(description), badge: orNull(translated(translations.BADGE_TRANSLATIONS, sh.badgeVi ?? "", locale)) });
  }
  return rows;
}

async function seedShapes(ctx: SeedContext, product: ProductRecord, media: MediaRegistry, uses: KeyUse): Promise<void> {
  const { tx, notes } = ctx;
  for (const [position, source] of product.source.shapes.entries()) {
    if (!KEBAB_SLUG.test(source.id)) notes.add("slug-invalid", `shape ${source.id}`);
    const slug = uniqueSlug(source.id, product.takenSegments);
    if (slug !== source.id) notes.add("shape-slug-duplicate", `${product.key}: ${source.id}`);
    const [row] = await tx
      .insert(schema.shape)
      .values({ productId: product.id, imageMediaId: media.idOf(source.image), position })
      .returning({ id: schema.shape.id, uid: schema.shape.uid });
    await tx.insert(schema.productSegment).values({ productId: product.id, slug, shapeId: row.id, isCanonical: true });
    await tx.insert(schema.shapeI18n).values(shapeTranslations(source, ctx, uses).map((r) => ({ ...r, shapeId: row.id })));
    product.shapes.push({ source, id: row.id, uid: row.uid, slug } satisfies ShapeRecord);
  }
}

export async function seedProducts(ctx: SeedContext, media: MediaRegistry): Promise<Map<string, ProductRecord>> {
  const { tx, src, notes, stats } = ctx;
  const products = new Map<string, ProductRecord>();
  const uses = new KeyUse();
  const listings = new Map<string, number>();
  for (const sub of src.subgroups) bump(listings, sub.id);
  const nextPosition = new Map<string, number>();

  for (const sub of src.subgroups) {
    const key = `${sub.categoryId}/${sub.id}`;
    const position = nextPosition.get(sub.categoryId) ?? 0;
    nextPosition.set(sub.categoryId, position + 1);
    const [row] = await tx
      .insert(schema.product)
      .values({ categoryId: sub.categoryId, coverMediaId: media.idOf(sub.coverImage), position, status: "published" })
      .returning({ id: schema.product.id, uid: schema.product.uid });
    await tx.insert(schema.productSlug).values({ categoryId: sub.categoryId, slug: sub.id, productId: row.id, isCanonical: true });
    await tx.insert(schema.productI18n).values(productTranslations(ctx, sub, key, uses).map((r) => ({ ...r, productId: row.id })));
    if ((listings.get(sub.id) ?? 0) > 1) {
      notes.add("shared-translation-key", `${key}: one zh/ja/ko text for ${listings.get(sub.id)} listings`);
      (stats.sharedListings[sub.id] ??= []).push(sub.categoryId);
    }

    const product: ProductRecord = { key, id: row.id, uid: row.uid, source: sub, shapes: [], options: [], takenSegments: new Set() };
    products.set(key, product);
    await seedShapes(ctx, product, media, uses);
  }

  const tables = { ITEM_NAMES: src.translations.ITEM_NAMES, ITEM_DESCS: src.translations.ITEM_DESCS, SHAPE_DESCS: src.translations.SHAPE_DESCS };
  for (const [name, table] of Object.entries(tables)) {
    stats.unusedTranslationKeys[name] = uses.unused(name, table);
    stats.translationKeyTotals[name] = Object.keys(table).length;
  }
  return products;
}
