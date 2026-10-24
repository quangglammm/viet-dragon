import { LOCALES, type LocaleCode } from "../schemas";
import type { Catalog, CategoryView, OptionView, ProductView, ShapeView } from "./types";

// Public URLs: `/products/<category>[/<product>[/<shape or option>]]`, every part in the language of the page. A canonical URL renders;
// an old one (an alias, or the slug of another language) answers a redirect to the canonical; anything else — including an archived
// product, which is not in the catalog — is not found. Pure: the pages call `resolveUrl`, every internal link goes through the
// `*Path` functions, so a URL is never built by hand.

/** The fixed word in front of the catalog. Localized in the routing milestone; every link and the resolver read it from here. */
export const PRODUCTS_SEGMENT = "products";

export type SegmentTarget = { shape: ShapeView; option?: undefined } | { option: OptionView; shape?: undefined };

export type Resolved =
  | { status: "ok"; category: CategoryView; product: ProductView | null; target: SegmentTarget | null }
  | { status: "redirect"; to: string }
  | { status: "notFound" };

export interface UrlParts {
  category: string;
  product?: string;
  segment?: string;
}

const ANY = "*";
const key = (...parts: readonly string[]): string => parts.join("\u0000");

interface Index {
  categories: Map<string, CategoryView>;
  products: Map<string, ProductView>;
  segments: Map<string, SegmentTarget>;
  categoryById: Map<string, CategoryView>;
  productByUid: Map<string, ProductView>;
}

const indexes = new WeakMap<Catalog, Index>();

/** Every slug a thing answers to, per language and for "any language" (the first claim wins there): canonical first, then the old ones. */
function indexOf(catalog: Catalog): Index {
  const cached = indexes.get(catalog);
  if (cached) return cached;
  const categories = new Map<string, CategoryView>();
  const products = new Map<string, ProductView>();
  const segments = new Map<string, SegmentTarget>();
  const claim = <V>(map: Map<string, V>, locale: LocaleCode, parts: readonly string[], value: V) => {
    if (!map.has(key(locale, ...parts))) map.set(key(locale, ...parts), value);
    if (!map.has(key(ANY, ...parts))) map.set(key(ANY, ...parts), value);
  };
  for (const locale of LOCALES) {
    for (const category of catalog.categories) claim(categories, locale, [category.slugs[locale].slug], category);
    for (const product of catalog.products) {
      claim(products, locale, [product.category, product.slugs[locale].slug], product);
      for (const target of segmentsOf(product)) claim(segments, locale, [product.uid, target.slugs[locale].slug], target.value);
    }
  }
  for (const locale of LOCALES) {
    for (const category of catalog.categories) for (const alias of category.slugs[locale].aliases) claim(categories, locale, [alias], category);
    for (const product of catalog.products) {
      for (const alias of product.slugs[locale].aliases) claim(products, locale, [alias.category, alias.slug], product);
      for (const target of segmentsOf(product)) for (const alias of target.slugs[locale].aliases) claim(segments, locale, [product.uid, alias], target.value);
    }
  }
  const built: Index = { categories, products, segments, categoryById: new Map(catalog.categories.map((c) => [c.id, c])), productByUid: new Map(catalog.products.map((p) => [p.uid, p])) };
  indexes.set(catalog, built);
  return built;
}

function segmentsOf(product: ProductView): { slugs: ShapeView["slugs"]; value: SegmentTarget }[] {
  return [
    ...product.shapes.map((shape) => ({ slugs: shape.slugs, value: { shape } as SegmentTarget })),
    ...product.options.map((option) => ({ slugs: option.slugs, value: { option } as SegmentTarget })),
  ];
}

// ───────────── building a URL ─────────────

export const categoryPath = (locale: LocaleCode, category: CategoryView): string => `/${PRODUCTS_SEGMENT}/${category.slugs[locale].slug}`;

export function productPath(catalog: Catalog, locale: LocaleCode, product: ProductView): string {
  const category = indexOf(catalog).categoryById.get(product.category);
  return `${category ? categoryPath(locale, category) : `/${PRODUCTS_SEGMENT}/${product.category}`}/${product.slugs[locale].slug}`;
}

/** The page of one shape or option of a product. */
export function segmentPath(catalog: Catalog, locale: LocaleCode, product: ProductView, target: SegmentTarget): string {
  const slugs = (target.shape ?? target.option).slugs;
  return `${productPath(catalog, locale, product)}/${slugs[locale].slug}`;
}

export function productByUid(catalog: Catalog, uid: string): ProductView | undefined {
  return indexOf(catalog).productByUid.get(uid);
}

export function categoryById(catalog: Catalog, id: string): CategoryView | undefined {
  return indexOf(catalog).categoryById.get(id);
}

/** The same page in every language: what `hreflang` and the language switcher need. */
export function alternatePaths(catalog: Catalog, category: CategoryView, product: ProductView | null, target: SegmentTarget | null): Record<LocaleCode, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => {
      const path = product === null ? categoryPath(locale, category) : target === null ? productPath(catalog, locale, product) : segmentPath(catalog, locale, product, target);
      return [locale, path];
    }),
  ) as Record<LocaleCode, string>;
}

// ───────────── reading a URL ─────────────

/**
 * What a request for these parts is. Each part is looked up in the page's language first, then in any language (so an old shared
 * slug, or a link written for another language, still finds its page); whatever it found, a request that is not exactly the canonical
 * URL is answered with a redirect to it.
 */
export function resolveUrl(catalog: Catalog, locale: LocaleCode, parts: UrlParts): Resolved {
  const index = indexOf(catalog);
  const category = index.categories.get(key(locale, parts.category)) ?? index.categories.get(key(ANY, parts.category));
  if (!category) return { status: "notFound" };

  let product: ProductView | null = null;
  let target: SegmentTarget | null = null;
  if (parts.product !== undefined) {
    const found = index.products.get(key(locale, category.id, parts.product)) ?? index.products.get(key(ANY, category.id, parts.product));
    if (!found) return { status: "notFound" };
    product = found;
    if (parts.segment !== undefined) {
      const segment = index.segments.get(key(locale, found.uid, parts.segment)) ?? index.segments.get(key(ANY, found.uid, parts.segment));
      if (!segment) return { status: "notFound" };
      target = segment;
    }
  } else if (parts.segment !== undefined) {
    return { status: "notFound" };
  }

  const canonical = alternatePaths(catalog, category, product, target)[locale];
  const requested = [`/${PRODUCTS_SEGMENT}`, parts.category, parts.product, parts.segment].filter((part) => part !== undefined).join("/");
  return canonical === requested ? { status: "ok", category, product, target } : { status: "redirect", to: canonical };
}
