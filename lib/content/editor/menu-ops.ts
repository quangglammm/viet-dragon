import type { MenuDocument } from "../schemas";
import { moveItem } from "./lists";
import type { VocabOption, Vocabulary } from "./vocabulary";

// Every change the menu editor makes to the document that is more than "set this field". A menu is columns → groups (one per product)
// → items (a shape or an option of that product); the order of each list IS the position, and a column's number is its place in the
// list (so the numbers stay 1…n whatever is added, removed or moved). Pure functions from a menu to a new menu.

export type Menu = MenuDocument;
export type MenuColumn = Menu["columns"][number];
export type MenuGroup = MenuColumn["groups"][number];
export type MenuItem = MenuGroup["items"][number];
export type MenuTarget = MenuItem["target"];

const withColumns = (menu: Menu, columns: readonly MenuColumn[]): Menu => ({ ...menu, columns: columns.map((column, index) => (column.column === index + 1 ? column : { ...column, column: index + 1 })) });

const inColumn = (menu: Menu, index: number, change: (column: MenuColumn) => MenuColumn): Menu => withColumns(menu, menu.columns.map((column, i) => (i === index ? change(column) : column)));

// ───────────── columns ─────────────

export function addColumn(menu: Menu): Menu {
  return withColumns(menu, [...menu.columns, { column: menu.columns.length + 1, groups: [] }]);
}

export function removeColumn(menu: Menu, index: number): Menu {
  return withColumns(menu, menu.columns.filter((_, i) => i !== index));
}

export function moveColumn(menu: Menu, index: number, step: -1 | 1): Menu {
  return withColumns(menu, moveItem(menu.columns, index, index + step));
}

// ───────────── groups ─────────────

/** Where a product's group is: its column and its place in that column. */
export function locateGroup(menu: Menu, product: string): { column: number; index: number } | null {
  for (const [column, { groups }] of menu.columns.entries()) {
    const index = groups.findIndex((group) => group.product === product);
    if (index !== -1) return { column, index };
  }
  return null;
}

/** Adds a product's group at the end of a column. A product appears once in a menu, so one already there changes nothing. */
export function addGroup(menu: Menu, columnIndex: number, product: string): Menu {
  if (locateGroup(menu, product)) return menu;
  return inColumn(menu, columnIndex, (column) => ({ ...column, groups: [...column.groups, { product, image: null, i18n: {}, items: [] }] }));
}

export function removeGroup(menu: Menu, product: string): Menu {
  return withColumns(menu, menu.columns.map((column) => ({ ...column, groups: column.groups.filter((group) => group.product !== product) })));
}

/** Moves a group one place up or down inside its column. */
export function moveGroup(menu: Menu, product: string, step: -1 | 1): Menu {
  const at = locateGroup(menu, product);
  if (!at) return menu;
  return inColumn(menu, at.column, (column) => ({ ...column, groups: moveItem(column.groups, at.index, at.index + step) }));
}

/** Takes a group out of its column and puts it at the end of another. */
export function moveGroupToColumn(menu: Menu, product: string, columnIndex: number): Menu {
  const at = locateGroup(menu, product);
  if (!at || at.column === columnIndex || columnIndex < 0 || columnIndex >= menu.columns.length) return menu;
  const group = menu.columns[at.column].groups[at.index];
  return withColumns(
    menu,
    menu.columns.map((column, i) => {
      if (i === at.column) return { ...column, groups: column.groups.filter((other) => other.product !== product) };
      return i === columnIndex ? { ...column, groups: [...column.groups, group] } : column;
    }),
  );
}

const inGroup = (menu: Menu, product: string, change: (group: MenuGroup) => MenuGroup): Menu =>
  withColumns(menu, menu.columns.map((column) => ({ ...column, groups: column.groups.map((group) => (group.product === product ? change(group) : group)) })));

// ───────────── items ─────────────

export const targetKey = (target: MenuTarget): string => ("shape" in target ? `shape:${target.shape}` : `option:${target.option}`);

export function targetFromKey(key: string): MenuTarget | null {
  const [kind, uid] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
  if (!uid) return null;
  return kind === "shape" ? { shape: uid } : kind === "option" ? { option: uid } : null;
}

export function addItem(menu: Menu, product: string, target: MenuTarget): Menu {
  return inGroup(menu, product, (group) => ({ ...group, items: [...group.items, { target, isFast: false, image: null, i18n: {} }] }));
}

export function removeItem(menu: Menu, product: string, index: number): Menu {
  return inGroup(menu, product, (group) => ({ ...group, items: group.items.filter((_, i) => i !== index) }));
}

export function moveGroupItem(menu: Menu, product: string, index: number, step: -1 | 1): Menu {
  return inGroup(menu, product, (group) => ({ ...group, items: moveItem(group.items, index, index + step) }));
}

export function setItemTarget(menu: Menu, product: string, index: number, target: MenuTarget): Menu {
  return inGroup(menu, product, (group) => ({ ...group, items: group.items.map((item, i) => (i === index ? { ...item, target } : item)) }));
}

// ───────────── what can be picked ─────────────

/** The products of the category that have no group in the menu yet. */
export function unusedProducts(menu: Menu, products: readonly VocabOption[]): VocabOption[] {
  const used = new Set(menu.columns.flatMap((column) => column.groups.map((group) => group.product)));
  return products.filter((product) => !used.has(product.value));
}

/** The shapes and options of one product that a menu item can point at. */
export function productTargets(vocab: Vocabulary, product: string): { shapes: VocabOption[]; options: VocabOption[] } {
  return {
    shapes: (vocab.shape ?? []).filter((shape) => shape.group === product),
    options: (vocab.option ?? []).filter((option) => option.group === product),
  };
}

/** The first target of the product the group does not link yet (shapes first), else the first one; null when the product has none. */
export function nextTarget(menu: Menu, vocab: Vocabulary, product: string): MenuTarget | null {
  const { shapes, options } = productTargets(vocab, product);
  const all: MenuTarget[] = [...shapes.map((shape) => ({ shape: shape.value })), ...options.map((option) => ({ option: option.value }))];
  const used = new Set(menu.columns.flatMap((column) => column.groups.filter((group) => group.product === product).flatMap((group) => group.items.map((item) => targetKey(item.target)))));
  return all.find((target) => !used.has(targetKey(target))) ?? all[0] ?? null;
}

const GROUP_AT = /^columns\[(\d+)]\.groups\[(\d+)]/;

/** The product of the group a path points into (`columns[1].groups[0].items[2].image`), so a problem in it can open that group. */
export function groupAtPath(menu: Menu, path: string): string | undefined {
  const match = GROUP_AT.exec(path);
  return match ? menu.columns[Number(match[1])]?.groups[Number(match[2])]?.product : undefined;
}
