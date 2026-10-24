import type { LocaleCode } from "../schemas";
import { pickText } from "./text";
import type { Catalog, CategoryView, MenuGroupView, MenuItemView, MenuView, ProductView } from "./types";
import { categoryPath, productPath, segmentPath } from "./urls";

// The site's navigation for ONE language, resolved on the server: plain strings and ready hrefs, so the client components that draw
// the mega-menu, the footer and the shop strips need no translation or URL logic of their own. Pure.

export interface NavMenuItem {
  /** Stable key: the shape or option uid. */
  id: string;
  label: string;
  /** A shape links to its anchor on the product page, an option to its own page. */
  href: string;
  image: string | null;
  isFast: boolean;
}

export interface NavMenuGroup {
  id: string;
  title: string;
  href: string;
  image: string | null;
  items: NavMenuItem[];
}

export interface NavMenu {
  /** What the desktop menu shows behind the links until one is hovered: the first group's picture. */
  defaultImage: string | null;
  columns: { id: string; groups: NavMenuGroup[] }[];
}

/** One product as a card on a category page, the home shop strip or the products index. */
export interface ProductCard {
  id: string;
  title: string;
  description: string;
  image: string | null;
  href: string;
  /** The picture the gallery strip under the cards shows for it. */
  referenceImage: string | null;
}

export interface NavCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  cover: string | null;
  href: string;
  cards: ProductCard[];
  menu: NavMenu;
}

export interface Navigation {
  categories: NavCategory[];
}

const productOf = (catalog: Catalog, uid: string): ProductView | undefined => catalog.products.find((product) => product.uid === uid);

function menuItemOf(catalog: Catalog, locale: LocaleCode, product: ProductView, item: MenuItemView): NavMenuItem {
  if ("shape" in item.target) {
    const uid = item.target.shape;
    const shape = product.shapes.find((candidate) => candidate.uid === uid)!;
    return { id: uid, label: pickText(locale, item.label), href: `${productPath(catalog, locale, product)}#${shape.slugs[locale].slug}`, image: item.image, isFast: item.isFast };
  }
  const uid = item.target.option;
  const option = product.options.find((candidate) => candidate.uid === uid)!;
  return { id: uid, label: pickText(locale, item.label), href: segmentPath(catalog, locale, product, { option }), image: item.image, isFast: item.isFast };
}

function menuGroupOf(catalog: Catalog, locale: LocaleCode, group: MenuGroupView): NavMenuGroup {
  const product = productOf(catalog, group.product)!;
  return {
    id: product.uid,
    title: pickText(locale, group.title),
    href: productPath(catalog, locale, product),
    image: group.image,
    items: group.items.map((item) => menuItemOf(catalog, locale, product, item)),
  };
}

export function menuOf(catalog: Catalog, locale: LocaleCode, menu: MenuView | undefined): NavMenu {
  const columns = (menu?.columns ?? []).map((column) => ({ id: `column-${column.column}`, groups: column.groups.map((group) => menuGroupOf(catalog, locale, group)) }));
  return { defaultImage: columns[0]?.groups[0]?.image ?? null, columns };
}

/**
 * The picture under a product card in the gallery strip: the first shape picture that is not the card's own; for a product with no
 * shape pictures, the second photo of its own options (else the first), else the card's picture.
 */
export function referenceImageOf(product: ProductView, image: string | null): string | null {
  const pictures = [image, ...product.shapes.map((shape) => shape.image)].filter((path): path is string => path !== null);
  if (pictures.length > 1) return pictures.find((path) => path !== image) ?? image;
  const optionImages = product.options.filter((option) => option.shape === null).flatMap((option) => [...option.images, ...option.pureImages]).filter((path) => path !== image);
  if (optionImages.length >= 2) return optionImages[1];
  return optionImages[0] ?? image;
}

/**
 * The cards of a category: its published products in position order, each with its own title, description and cover — the words and
 * picture of the product page the card leads to. (The mega-menu has wording of its own; it is not the products'.)
 */
export function cardsOf(catalog: Catalog, locale: LocaleCode, category: CategoryView): ProductCard[] {
  return catalog.products
    .filter((product) => product.category === category.id)
    .map((product) => ({
      id: product.uid,
      title: pickText(locale, product.title),
      description: pickText(locale, product.description),
      image: product.cover,
      href: productPath(catalog, locale, product),
      referenceImage: referenceImageOf(product, product.cover),
    }));
}

export function navigationOf(catalog: Catalog, menus: Readonly<Record<string, MenuView>>, locale: LocaleCode): Navigation {
  return {
    categories: catalog.categories.map((category) => ({
      id: category.id,
      name: pickText(locale, category.name),
      description: pickText(locale, category.description),
      icon: category.icon,
      cover: category.cover,
      href: categoryPath(locale, category),
      cards: cardsOf(catalog, locale, category),
      menu: menuOf(catalog, locale, menus[category.id]),
    })),
  };
}
