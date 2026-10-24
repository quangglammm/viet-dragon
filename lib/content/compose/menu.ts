import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";
import { DOCUMENT_SCHEMA, type MenuDocument } from "../schemas";
import { groupByKey, i18nMap, imageMedia, optional, type Composed } from "./shared";

// Rows → the mega-menu document of ONE category. Positions are the array order (columns, groups within a column,
// items within a group); the version is the category's `menu_version`.

export async function composeMenu(x: DbExecutor, categoryId: string): Promise<Composed<MenuDocument> | null> {
  const [head] = await x.select({ id: schema.category.id, version: schema.category.menuVersion }).from(schema.category).where(eq(schema.category.id, categoryId));
  if (!head) return null;

  const groups = await x
    .select({ productId: schema.menuGroup.productId, productUid: schema.product.uid, column: schema.menuGroup.menuColumn, position: schema.menuGroup.position, image: imageMedia.storageKey })
    .from(schema.menuGroup)
    .innerJoin(schema.product, eq(schema.product.id, schema.menuGroup.productId))
    .leftJoin(imageMedia, eq(imageMedia.id, schema.menuGroup.imageMediaId))
    .where(eq(schema.product.categoryId, categoryId));
  const groupTexts = await x
    .select({ productId: schema.menuGroupI18n.productId, locale: schema.menuGroupI18n.locale, label: schema.menuGroupI18n.label, description: schema.menuGroupI18n.description })
    .from(schema.menuGroupI18n)
    .innerJoin(schema.product, eq(schema.product.id, schema.menuGroupI18n.productId))
    .where(eq(schema.product.categoryId, categoryId));
  const items = await x
    .select({ id: schema.menuItem.id, productId: schema.menuItem.productId, position: schema.menuItem.position, shapeUid: schema.shape.uid, optionUid: schema.option.uid, isFast: schema.menuItem.isFast, image: imageMedia.storageKey })
    .from(schema.menuItem)
    .innerJoin(schema.product, eq(schema.product.id, schema.menuItem.productId))
    .leftJoin(schema.shape, eq(schema.shape.id, schema.menuItem.shapeId))
    .leftJoin(schema.option, eq(schema.option.id, schema.menuItem.optionId))
    .leftJoin(imageMedia, eq(imageMedia.id, schema.menuItem.imageMediaId))
    .where(eq(schema.product.categoryId, categoryId));
  const itemTexts = await x
    .select({ menuItemId: schema.menuItemI18n.menuItemId, locale: schema.menuItemI18n.locale, label: schema.menuItemI18n.label })
    .from(schema.menuItemI18n)
    .innerJoin(schema.menuItem, eq(schema.menuItem.id, schema.menuItemI18n.menuItemId))
    .innerJoin(schema.product, eq(schema.product.id, schema.menuItem.productId))
    .where(eq(schema.product.categoryId, categoryId));

  const groupTextsByProduct = groupByKey(groupTexts, (t) => t.productId);
  const itemsByProduct = groupByKey(items, (i) => i.productId);
  const itemTextsById = groupByKey(itemTexts, (t) => t.menuItemId);
  const columns = [...groupByKey(groups, (g) => g.column)]
    .sort(([a], [b]) => a - b)
    .map(([column, inColumn]) => ({
      column,
      groups: [...inColumn]
        .sort((a, b) => a.position - b.position)
        .map((g) => ({
          product: g.productUid,
          image: g.image,
          i18n: i18nMap(groupTextsByProduct.get(g.productId) ?? [], (t) => ({ ...optional("label", t.label), ...optional("description", t.description) })),
          items: [...(itemsByProduct.get(g.productId) ?? [])]
            .sort((a, b) => a.position - b.position)
            .map((i) => ({
              target: i.shapeUid ? { shape: i.shapeUid } : { option: i.optionUid as string },
              isFast: i.isFast,
              image: i.image,
              i18n: i18nMap(itemTextsById.get(i.id) ?? [], (t) => t.label),
            })),
        })),
    }));
  return { document: { schema: DOCUMENT_SCHEMA, key: categoryId, category: categoryId, columns }, version: head.version };
}
