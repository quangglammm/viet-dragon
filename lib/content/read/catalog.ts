import { LOCALES, type CategoryDocument, type LocaleCode, type MaterialDocument, type ProductDocument, type SpecItemDocument, type TraitDocument } from "../schemas";
import { localize, type Localized } from "./text";
import type { Catalog, CategoryView, FeatureView, MaterialView, OptionView, ProductView, Seo, ShapeView, SizeView, SpecView, TraitView } from "./types";

// Documents → the public site's view of the catalog. Pure: the same function runs in the tests (on documents composed from a seeded
// database) and in the cached loader. Nothing here touches a database, a cache or a request.

export interface CatalogInput {
  categories: readonly CategoryDocument[];
  products: readonly ProductDocument[];
  materials: readonly MaterialDocument[];
  traits: readonly TraitDocument[];
  specItems: readonly SpecItemDocument[];
}

/** A media key (`images/product/a.webp`) as the path the site serves it at. */
export const publicPath = (key: string | null | undefined): string | null => (key ? `/${key}` : null);

const byPosition = <T extends { position: number }>(a: T, b: T): number => a.position - b.position;

const seoOf = (rows: Partial<Record<LocaleCode, { seoTitle?: string; seoDescription?: string }>>): Seo => ({
  title: localize(rows, (row) => row.seoTitle),
  description: localize(rows, (row) => row.seoDescription),
});

function categoryView(category: CategoryDocument): CategoryView {
  return {
    id: category.key,
    slugs: category.slugs,
    icon: category.icon,
    cover: publicPath(category.cover),
    ogImage: publicPath(category.ogImage),
    position: category.position,
    name: localize(category.i18n, (row) => row.name),
    description: localize(category.i18n, (row) => row.description),
    seo: seoOf(category.i18n),
  };
}

function shapeView(shape: ProductDocument["shapes"][number]): ShapeView {
  return {
    uid: shape.uid,
    slugs: shape.slugs,
    position: shape.position,
    image: publicPath(shape.image),
    ogImage: publicPath(shape.ogImage),
    name: localize(shape.i18n, (row) => row.name),
    description: localize(shape.i18n, (row) => row.description),
    badge: localize(shape.i18n, (row) => row.badge),
    seo: seoOf(shape.i18n),
  };
}

function optionView(option: ProductDocument["options"][number], materials: ReadonlyMap<string, MaterialView>): OptionView {
  const material = materials.get(option.material);
  const title: Localized = {};
  for (const locale of LOCALES) {
    const row = option.i18n[locale];
    // The heading is stored only where it differs from the stock's name; a language the option has no authored name in shows nothing here.
    const shown = row?.cardTitle ?? (row?.name ? material?.name[locale] : undefined);
    if (shown) title[locale] = shown;
  }
  const bullets = (kind: "feature" | "best_for") => option.bullets.filter((bullet) => bullet.kind === kind).sort(byPosition);
  return {
    uid: option.uid,
    slugs: option.slugs,
    shape: option.shape,
    material: option.material,
    position: option.position,
    icon: option.icon ?? material?.icon ?? null,
    hideFoil: option.hideFoil,
    hideDoubleSided: option.hideDoubleSided,
    prices: option.prices,
    ogImage: publicPath(option.ogImage),
    name: localize(option.i18n, (row) => row.name),
    title,
    tagline: localize(option.i18n, (row) => row.tagline),
    seo: seoOf(option.i18n),
    features: bullets("feature").map((bullet): FeatureView => ({ trait: bullet.trait, text: localize(bullet.i18n, (text) => text) })),
    bestFor: bullets("best_for").map((bullet) => localize(bullet.i18n, (text) => text)),
    images: option.images.default.map((key) => `/${key}`),
    pureImages: option.images.pure.map((key) => `/${key}`),
  };
}

function sizeView(size: ProductDocument["sizes"][number]): SizeView {
  return { shape: size.shape, tier: size.tier, w: size.w, h: size.h, d: size.d, text: size.text, note: localize(size.i18n, (text) => text) };
}

function productView(product: ProductDocument, materials: ReadonlyMap<string, MaterialView>, specLabels: ReadonlyMap<string, Localized>): ProductView {
  return {
    uid: product.uid,
    category: product.category,
    slugs: product.slugs,
    position: product.position,
    cover: publicPath(product.cover),
    ogImage: publicPath(product.ogImage),
    title: localize(product.i18n, (row) => row.title),
    description: localize(product.i18n, (row) => row.description),
    seo: seoOf(product.i18n),
    shapes: [...product.shapes].sort(byPosition).map(shapeView),
    options: [...product.options].sort(byPosition).map((option) => optionView(option, materials)),
    sizes: product.sizes.map(sizeView),
    specs: [...product.specs].sort(byPosition).map((spec): SpecView => ({ shape: spec.shape, kind: spec.kind, item: spec.item, position: spec.position, label: specLabels.get(`${spec.kind}/${spec.item}`) ?? {} })),
  };
}

export function buildCatalog(input: CatalogInput): Catalog {
  const categories = [...input.categories].sort((a, b) => a.position - b.position || a.key.localeCompare(b.key)).map(categoryView);
  const materials = new Map(input.materials.map((material): [string, MaterialView] => [material.key, { key: material.key, icon: material.icon, name: localize(material.i18n, (row) => row.name) }]));
  const specLabels = new Map(input.specItems.map((item): [string, Localized] => [item.key, localize(item.i18n, (row) => row.label)]));
  const categoryOrder = new Map(categories.map((category, index) => [category.id, index]));

  const products = input.products
    .filter((product) => product.status === "published")
    .sort((a, b) => (categoryOrder.get(a.category) ?? 0) - (categoryOrder.get(b.category) ?? 0) || a.position - b.position)
    .map((product) => productView(product, materials, specLabels));

  return {
    categories,
    products,
    traits: Object.fromEntries(input.traits.map((trait): [string, TraitView] => [trait.key, { key: trait.key, icon: trait.icon, label: localize(trait.i18n, (row) => row.label), description: localize(trait.i18n, (row) => row.description) }])),
    materials: Object.fromEntries(materials),
  };
}
