import type { MenuDocument } from "../schemas";
import { localize, overlay } from "./text";
import type { Catalog, MenuGroupView, MenuItemView, MenuView, ProductView } from "./types";

// The mega-menu of a category as the navigation draws it. A group, item or image the editor did not override shows what its target
// already has: the product's name, image and description; a shape's name and image; an option's name. Pure.

function itemView(item: MenuDocument["columns"][number]["groups"][number]["items"][number], product: ProductView): MenuItemView | null {
  const override = (item.i18n ?? {}) as Partial<Record<string, string>>;
  if ("shape" in item.target) {
    const shape = product.shapes.find((candidate) => candidate.uid === (item.target as { shape: string }).shape);
    if (!shape) return null;
    return { target: { shape: shape.uid }, kind: "shape", label: overlay(override, shape.name), image: item.image ? `/${item.image}` : (shape.image ?? product.cover), isFast: item.isFast };
  }
  const optionUid = item.target.option;
  const option = product.options.find((candidate) => candidate.uid === optionUid);
  if (!option) return null;
  return { target: { option: option.uid }, kind: "material", label: overlay(override, option.name), image: item.image ? `/${item.image}` : product.cover, isFast: item.isFast };
}

/** The menu of one category. Links to a product that is not published, or to a shape or option that is gone, are left out. */
export function buildMenu(catalog: Catalog, menu: MenuDocument): MenuView {
  const products = new Map(catalog.products.map((product) => [product.uid, product]));
  const columns = menu.columns
    .map((column) => ({
      column: column.column,
      groups: column.groups.flatMap((group): MenuGroupView[] => {
        const product = products.get(group.product);
        if (!product) return [];
        return [
          {
            product: product.uid,
            title: overlay(localize(group.i18n, (row) => row.label), product.title),
            description: overlay(localize(group.i18n, (row) => row.description), product.description),
            image: group.image ? `/${group.image}` : product.cover,
            items: group.items.flatMap((item) => itemView(item, product) ?? []),
          },
        ];
      }),
    }))
    .filter((column) => column.groups.length > 0)
    .sort((a, b) => a.column - b.column);
  return { category: menu.category, columns };
}

export function buildMenus(catalog: Catalog, menus: readonly MenuDocument[]): Record<string, MenuView> {
  return Object.fromEntries(menus.map((menu) => [menu.category, buildMenu(catalog, menu)]));
}
