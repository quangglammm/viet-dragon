import * as schema from "@/lib/db/schema";
import type { MediaRegistry, OptionRecord, ProductRecord, SeedContext, ShapeRecord } from "../context";
import { LOCALES, TRANSLATED_LOCALES, localizedText, translated, type Locale } from "../localized";
import { menuSegment, resolveSegment } from "../resolve";
import type { MenuColumn, MenuGroup, MenuItem } from "../sources";
import { isBlankText } from "../util";

// The mega-menus become explicit rows: columns → groups (one per product) → items (a shape or an option).
// A label, description or image is stored ONLY where it differs from what the target already provides — so the
// 100 menu items carry just the 145 real label overrides, 19 image overrides and 15 Fast Print tags.

type GroupI18n = Omit<typeof schema.menuGroupI18n.$inferInsert, "productId">;

function productTitle(product: ProductRecord, locale: Locale, ctx: SeedContext): string | undefined {
  const sub = product.source;
  return locale === "vi" ? sub.titleVi : locale === "en" ? sub.titleEn : (localizedText(sub, "title", "suffixed", locale) ?? translated(ctx.src.translations.ITEM_NAMES, sub.id, locale));
}

/** The Tet category page lists menu GROUPS and shows ITEM_DESCS[group.id] — keyed by the group id, not the product id. */
function tetDescriptionOverrides(group: MenuGroup, product: ProductRecord, ctx: SeedContext, overrides: Map<Locale, GroupI18n>): void {
  const { translations } = ctx.src;
  const fallbackProduct = ctx.src.getSubgroupById(group.id, "tet");
  for (const locale of TRANSLATED_LOCALES) {
    const shown = translated(translations.ITEM_DESCS, group.id, locale) ?? fallbackProduct?.descriptionEn;
    const own = localizedText(product.source, "description", "suffixed", locale) ?? translated(translations.ITEM_DESCS, product.source.id, locale);
    const derived = isBlankText(own) ? product.source.descriptionEn : own;
    if (isBlankText(shown) || shown === derived) continue;
    const row = overrides.get(locale) ?? overrides.set(locale, { locale, label: null, description: null }).get(locale)!;
    row.description = shown as string;
    ctx.stats.menu.groupDescriptionOverrides += 1;
  }
}

async function seedGroupTexts(ctx: SeedContext, categoryId: string, group: MenuGroup, product: ProductRecord): Promise<void> {
  const overrides = new Map<Locale, GroupI18n>();
  for (const locale of LOCALES) {
    const title = localizedText(group, "title", "suffixed", locale);
    if (!isBlankText(title) && title !== productTitle(product, locale, ctx)) overrides.set(locale, { locale, label: title as string, description: null });
  }
  if (categoryId === "tet") tetDescriptionOverrides(group, product, ctx, overrides);
  if (overrides.size === 0) return;
  ctx.stats.menu.groupLabelOverrides += [...overrides.values()].filter((row) => row.label).length;
  await ctx.tx.insert(schema.menuGroupI18n).values([...overrides.values()].map((row) => ({ ...row, productId: product.id })));
}

async function seedItem(ctx: SeedContext, media: MediaRegistry, product: ProductRecord, item: MenuItem, position: number): Promise<void> {
  const { tx, src, notes, stats } = ctx;
  stats.menu.items += 1;
  const segment = menuSegment(item.href);
  const resolution = segment ? resolveSegment(src, product, segment) : null;
  if (!resolution) {
    notes.add("menu-unresolved", `${item.kind ?? "item"} ${item.href}`);
    return;
  }
  const shape: ShapeRecord | undefined = resolution.kind === "shape" ? product.shapes.find((s) => s.slug === resolution.slug) : undefined;
  const option: OptionRecord | undefined = resolution.kind === "option" ? product.options.find((o) => o.slug === resolution.slug) : undefined;
  const derivedImage = shape ? shape.source.image : product.source.coverImage;
  const image = item.image !== derivedImage ? media.idOf(item.image) : null;
  if (image) stats.menu.itemImageOverrides += 1;
  const [row] = await tx
    .insert(schema.menuItem)
    .values({ productId: product.id, position, shapeId: shape?.id ?? null, optionId: option?.id ?? null, isFast: Boolean(item.isFast), imageMediaId: image })
    .returning({ id: schema.menuItem.id });
  if (item.isFast) stats.menu.fastItems += 1;

  const labels: (typeof schema.menuItemI18n.$inferInsert)[] = [];
  for (const locale of LOCALES) {
    const text = localizedText(item, "name", "suffixed", locale);
    const derived = shape ? localizedText(shape.source, "name", "suffixed", locale) : option?.rawName[locale];
    if (!isBlankText(text) && text !== derived) labels.push({ menuItemId: row.id, locale, label: text as string });
  }
  if (labels.length > 0) {
    stats.menu.itemLabelOverrides += labels.length;
    await tx.insert(schema.menuItemI18n).values(labels);
  }
}

async function seedGroup(ctx: SeedContext, media: MediaRegistry, products: Map<string, ProductRecord>, categoryId: string, column: number, position: number, group: MenuGroup): Promise<void> {
  const link = group.href.match(/^\/products\/([^/#]+)\/([^/#]+)/);
  const product = link ? products.get(`${link[1]}/${link[2]}`) : undefined;
  if (!product) {
    ctx.notes.add("menu-unresolved", `group ${group.href}`);
    return;
  }
  ctx.stats.menu.groups += 1;
  const image = group.image !== product.source.coverImage ? media.idOf(group.image) : null;
  if (image) ctx.stats.menu.groupImageOverrides += 1;
  await ctx.tx.insert(schema.menuGroup).values({ productId: product.id, menuColumn: column, position, imageMediaId: image });
  await seedGroupTexts(ctx, categoryId, group, product);
  for (const [index, item] of group.items.entries()) await seedItem(ctx, media, product, item, index);
}

export async function seedMenus(ctx: SeedContext, products: Map<string, ProductRecord>, media: MediaRegistry): Promise<void> {
  for (const [categoryId, columns] of Object.entries(ctx.src.menus) as [string, readonly MenuColumn[]][]) {
    for (const [columnIndex, column] of columns.entries()) {
      for (const [groupIndex, group] of column.groups.entries()) {
        await seedGroup(ctx, media, products, categoryId, columnIndex + 1, groupIndex, group);
      }
    }
  }
}
