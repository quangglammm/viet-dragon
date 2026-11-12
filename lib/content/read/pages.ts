import type { LocaleCode } from "../schemas";
import { cardOf, type CardView } from "./card";
import { cardsOf, type ProductCard } from "./navigation";
import { optionsForProduct, optionsForShape } from "./selectors";
import { seoMeta, type Meta } from "./seo";
import { pickText } from "./text";
import type { Catalog, CategoryView, OptionView, ProductView, ShapeView } from "./types";
import { anchorOf, categoryPath, productPath, segmentPath, type Anchor, type SegmentTarget } from "./urls";

// What each catalog page shows, for ONE language, resolved on the server: every text picked, every link built. The pages only lay it
// out. Pure — the same functions answer in the tests, where they are compared with what the old pages computed from the static files.

const TITLE_SUFFIX = " | Viet Dragon";

export interface Link {
  label: string;
  href: string;
}

// ───────────── a category ─────────────

export interface CategoryPageModel {
  meta: Meta;
  name: string;
  description: string;
  icon: string;
  cover: string | null;
  cards: ProductCard[];
  prev: Link | null;
  next: Link | null;
}

export function categoryPageOf(catalog: Catalog, locale: LocaleCode, category: CategoryView): CategoryPageModel {
  const index = catalog.categories.findIndex((candidate) => candidate.id === category.id);
  const link = (target: CategoryView | undefined): Link | null => (target ? { label: pickText(locale, target.name), href: categoryPath(locale, target) } : null);
  const name = pickText(locale, category.name);
  const description = pickText(locale, category.description);
  return {
    meta: seoMeta(locale, category.seo, { title: `${name}${TITLE_SUFFIX}`, description }, category.ogImage ?? category.cover),
    name,
    description,
    icon: category.icon,
    cover: category.cover,
    cards: cardsOf(catalog, locale, category),
    prev: link(catalog.categories[index - 1]),
    next: link(catalog.categories[index + 1]),
  };
}

// ───────────── a product, its shapes, one shape or one material ─────────────

export interface ProductContext {
  category: Link & { icon: string };
  product: Link;
  /** The product's own title and description, in the page's language. */
  title: string;
  description: string;
  cover: string | null;
}

export interface ShapeCardView {
  uid: string;
  anchor: Anchor;
  name: string;
  description: string;
  image: string | null;
  href: string;
}

export interface GlossaryTrait {
  key: string;
  icon: string;
  label: string;
  description: string;
}

interface PageBase {
  meta: Meta;
  context: ProductContext;
}

/** The product page of a product that has shapes: a grid of them. */
export interface ShapesPageModel extends PageBase {
  kind: "shapes";
  shapes: ShapeCardView[];
}

/** The product page of a product without shapes: its materials. */
export interface DetailPageModel extends PageBase {
  kind: "detail";
  cards: CardView[];
  /** The products of the category either side of this one. */
  prev: Link | null;
  next: Link | null;
}

/** One shape of a product, with the materials offered for it. */
export interface ShapePageModel extends PageBase {
  kind: "shape";
  /** `image` is the shape's own picture, else the product's cover: what the page's square frame shows. */
  shape: { name: string; description: string; image: string | null };
  cards: CardView[];
  prev: Link | null;
  next: Link | null;
}

/** The materials of a product, scrolled to one. */
export interface MaterialPageModel extends PageBase {
  kind: "material";
  /** The material the URL named: the last breadcrumb, the card to scroll to and to ring. */
  material: { name: string; anchor: Anchor; uid: string };
  cards: CardView[];
}

export type ProductPageModel = ShapesPageModel | DetailPageModel | ShapePageModel | MaterialPageModel;

function contextOf(catalog: Catalog, locale: LocaleCode, category: CategoryView, product: ProductView): ProductContext {
  const title = pickText(locale, product.title);
  return {
    category: { label: pickText(locale, category.name), href: categoryPath(locale, category), icon: category.icon },
    product: { label: title, href: productPath(catalog, locale, product) },
    title,
    description: pickText(locale, product.description),
    cover: product.cover,
  };
}

const cardsFor = (catalog: Catalog, locale: LocaleCode, product: ProductView, options: readonly OptionView[], shape: string | null, productName: (option: OptionView) => string): CardView[] =>
  options.map((option) => cardOf(catalog, locale, product, option, shape, productName(option)));

function neighbours<T>(items: readonly T[], at: number, link: (item: T) => Link): { prev: Link | null; next: Link | null } {
  return { prev: at > 0 ? link(items[at - 1]) : null, next: at >= 0 && at < items.length - 1 ? link(items[at + 1]) : null };
}

export function productPageOf(catalog: Catalog, locale: LocaleCode, category: CategoryView, product: ProductView, target: SegmentTarget | null): ProductPageModel {
  const context = contextOf(catalog, locale, category, product);
  const shapeCard = (shape: ShapeView): ShapeCardView => ({
    uid: shape.uid,
    anchor: anchorOf(shape.slugs, locale),
    name: pickText(locale, shape.name),
    description: pickText(locale, shape.description),
    image: shape.image,
    href: segmentPath(catalog, locale, product, { shape }),
  });

  if (target?.shape) {
    const shape = target.shape;
    const name = pickText(locale, shape.name);
    const shapes = product.shapes;
    return {
      kind: "shape",
      meta: seoMeta(locale, shape.seo, { title: `${name} - ${context.title}${TITLE_SUFFIX}`, description: pickText(locale, shape.description) }, shape.ogImage ?? shape.image ?? product.ogImage ?? product.cover),
      context,
      shape: { name, description: pickText(locale, shape.description), image: shape.image ?? product.cover },
      cards: cardsFor(catalog, locale, product, optionsForShape(product, shape.uid), shape.uid, (option) => `${name} - ${pickText(locale, option.name)}`),
      ...neighbours(shapes, shapes.findIndex((candidate) => candidate.uid === shape.uid), (item) => ({ label: pickText(locale, item.name), href: shapeCard(item).href })),
    };
  }

  if (target?.option) {
    const option = target.option;
    const name = pickText(locale, option.name);
    return {
      kind: "material",
      meta: seoMeta(locale, option.seo, { title: `${context.title} - ${name}${TITLE_SUFFIX}`, description: context.description }, option.ogImage ?? product.ogImage ?? product.cover),
      context,
      material: { name, anchor: anchorOf(option.slugs, locale), uid: option.uid },
      cards: cardsFor(catalog, locale, product, optionsForProduct(product), null, (candidate) => `${context.title} - ${pickText(locale, candidate.name)}`),
    };
  }

  const meta = seoMeta(locale, product.seo, { title: `${context.title}${TITLE_SUFFIX}`, description: context.description }, product.ogImage ?? product.cover);
  if (product.shapes.length > 0) return { kind: "shapes", meta, context, shapes: product.shapes.map(shapeCard) };

  const siblings = catalog.products.filter((candidate) => candidate.category === product.category);
  return {
    kind: "detail",
    meta,
    context,
    cards: cardsFor(catalog, locale, product, optionsForProduct(product), null, () => context.title),
    ...neighbours(siblings, siblings.findIndex((candidate) => candidate.uid === product.uid), (item) => ({ label: pickText(locale, item.title), href: productPath(catalog, locale, item) })),
  };
}

/** The legend of the card icons: every trait, in the page's language. */
export function glossaryOf(catalog: Catalog, locale: LocaleCode): GlossaryTrait[] {
  return Object.values(catalog.traits)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((trait) => ({ key: trait.key, icon: trait.icon, label: pickText(locale, trait.label), description: pickText(locale, trait.description) }));
}
