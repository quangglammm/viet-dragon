import { eq, inArray, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Tx } from "@/lib/db/types";
import { Invalid, type Issue } from "../errors";
import type { MenuDocument } from "../schemas";
import { loadDocumentMedia } from "./lookups";
import { localeEntries } from "./shared";
import type { Applier, ApplyContext } from "./types";

// The mega-menu of ONE category. Its groups are the category's products, its items shapes and options of those products.
// The whole menu is rebuilt on every publish (nothing refers to a menu row); its version is the category's `menu_version`.

type Group = MenuDocument["columns"][number]["groups"][number];
type Targets = Awaited<ReturnType<typeof targetsOf>>;

interface GroupLookups {
  imageId: (key: string | null) => number | null;
  targets: Targets;
}

function refuse(path: string, message: string): never {
  throw new Invalid([{ path, message }] satisfies Issue[]);
}

/** The products of the category, by uid. A group for any other product is refused. */
async function categoryProducts(tx: Tx, categoryId: string): Promise<Map<string, number>> {
  const rows = await tx.select({ id: schema.product.id, uid: schema.product.uid }).from(schema.product).where(eq(schema.product.categoryId, categoryId));
  return new Map(rows.map((r) => [r.uid, r.id]));
}

/** `shape uid → id` and `option uid → id` for the products that have a group in this menu. */
async function targetsOf(tx: Tx, productIds: readonly number[]): Promise<{ shapes: Map<string, { id: number; productId: number }>; options: Map<string, { id: number; productId: number }> }> {
  if (productIds.length === 0) return { shapes: new Map(), options: new Map() };
  const shapes = await tx.select({ id: schema.shape.id, uid: schema.shape.uid, productId: schema.shape.productId }).from(schema.shape).where(inArray(schema.shape.productId, [...productIds]));
  const options = await tx.select({ id: schema.option.id, uid: schema.option.uid, productId: schema.option.productId }).from(schema.option).where(inArray(schema.option.productId, [...productIds]));
  return {
    shapes: new Map(shapes.map((r) => [r.uid, { id: r.id, productId: r.productId }])),
    options: new Map(options.map((r) => [r.uid, { id: r.id, productId: r.productId }])),
  };
}

async function writeGroup(tx: Tx, productId: number, place: { column: number; position: number; path: string }, group: Group, { imageId, targets }: GroupLookups): Promise<void> {
  await tx.insert(schema.menuGroup).values({ productId, menuColumn: place.column, position: place.position, imageMediaId: imageId(group.image) });
  const labels = localeEntries(group.i18n).map(([locale, t]) => ({ productId, locale, label: t.label ?? null, description: t.description ?? null }));
  if (labels.length > 0) await tx.insert(schema.menuGroupI18n).values(labels);
  if (group.items.length === 0) return;

  const items = group.items.map((item, i) => {
    const shape = "shape" in item.target ? targets.shapes.get(item.target.shape) : undefined;
    const option = "option" in item.target ? targets.options.get(item.target.option) : undefined;
    const target = shape ?? option;
    if (!target || target.productId !== productId) refuse(`${place.path}.items[${i}].target`, "Mục menu trỏ tới hình dạng hoặc tùy chọn không thuộc sản phẩm của nhóm.");
    return { productId, position: i, shapeId: shape ? shape.id : null, optionId: option ? option.id : null, isFast: item.isFast, imageMediaId: imageId(item.image) };
  });
  const stored = await tx.insert(schema.menuItem).values(items).returning({ id: schema.menuItem.id, position: schema.menuItem.position });
  const idByPosition = new Map(stored.map((r) => [r.position, r.id]));
  const itemLabels = group.items.flatMap((item, i) => localeEntries(item.i18n).map(([locale, label]) => ({ menuItemId: idByPosition.get(i)!, locale, label })));
  if (itemLabels.length > 0) await tx.insert(schema.menuItemI18n).values(itemLabels);
}

async function applyMenu(tx: Tx, doc: MenuDocument, context: ApplyContext): Promise<number> {
  const products = await categoryProducts(tx, doc.category);
  const media = await loadDocumentMedia(tx, "menu", doc);

  const groupProductIds = doc.columns.flatMap((column) => column.groups.map((group) => products.get(group.product)));
  doc.columns.forEach((column, c) =>
    column.groups.forEach((group, g) => {
      if (!products.has(group.product)) refuse(`columns[${c}].groups[${g}].product`, `Sản phẩm này không thuộc danh mục «${doc.category}».`);
    }),
  );
  const targets = await targetsOf(tx, groupProductIds.filter((id): id is number => id !== undefined));

  // The whole menu of the category is rebuilt; menu_group_i18n, menu_item and menu_item_i18n go with their group.
  await tx.delete(schema.menuGroup).where(inArray(schema.menuGroup.productId, [...products.values()]));
  for (const [c, column] of doc.columns.entries()) {
    for (const [g, group] of column.groups.entries()) {
      await writeGroup(tx, products.get(group.product)!, { column: column.column, position: g, path: `columns[${c}].groups[${g}]` }, group, { imageId: media.idOrNull, targets });
    }
  }

  const [updated] = await tx
    .update(schema.category)
    .set({ menuVersion: sql`${schema.category.menuVersion} + 1`, updatedAt: sql`now()`, updatedBy: context.author })
    .where(eq(schema.category.id, doc.category))
    .returning({ version: schema.category.menuVersion });
  return updated.version;
}

export const menuApplier: Applier<MenuDocument> = {
  async lock(tx, categoryId) {
    const [row] = await tx.select({ version: schema.category.menuVersion }).from(schema.category).where(eq(schema.category.id, categoryId)).for("no key update");
    return row?.version ?? null;
  },
  apply: applyMenu,
};
