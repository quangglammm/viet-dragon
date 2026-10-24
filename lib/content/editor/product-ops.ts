import type { LocaleCode, ProductDocument } from "../schemas";
import { LOCALES } from "../schemas";
import { moveWithinGroup, nextPosition, renumber } from "./lists";
import { followNames, placeholderSlug, withoutAliasEqualTo, type Names, type Slugs, type Taken } from "./slugs";
import { newUid } from "./uid";

// Every change the product editor makes to the document that is more than "set this field": adding, removing and reordering the
// children, and the rules that tie them together. Pure functions from a product to a new product, so each rule is tested on its own.
//
//   * positions have no gaps inside their group (the options of one shape, the bullets of one kind…): every list change renumbers;
//   * removing a shape takes everything scoped to it along (its options, sizes and spec lists);
//   * a canonical slug is never also an alias, so choosing a slug the record already answers to removes that alias.

export type Product = ProductDocument;
type Shape = Product["shapes"][number];
type Option = Product["options"][number];
type Bullet = Option["bullets"][number];
type Size = Product["sizes"][number];
type Spec = Product["specs"][number];
type SlugEntries<A> = Record<LocaleCode, { slug: string; aliases: A[] }>;

export const SIZE_TIERS = ["large", "medium", "small"] as const;

const scopeOf = (item: { shape: string | null }): string => item.shape ?? "";

function slugEntries(slug: string): SlugEntries<never> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, { slug, aliases: [] }])) as SlugEntries<never>;
}

const isOwnShape = (shape: string | null) => (item: { shape: string | null }) => item.shape === shape;

// ───────────── shapes ─────────────

export function addShape(product: Product): Product {
  const uid = newUid();
  const shape: Shape = { uid, slugs: slugEntries(placeholderSlug(uid)), position: nextPosition(product.shapes), image: null, ogImage: null, i18n: {} };
  return { ...product, shapes: [...product.shapes, shape] };
}

/** Removes a shape and everything scoped to it: its options, its sizes and its spec lists. */
export function removeShape(product: Product, uid: string): Product {
  return {
    ...product,
    shapes: renumber(product.shapes.filter((shape) => shape.uid !== uid)),
    options: product.options.filter((option) => option.shape !== uid),
    sizes: product.sizes.filter((size) => size.shape !== uid),
    specs: product.specs.filter((spec) => spec.shape !== uid),
  };
}

/** What would go with a shape: for the confirmation before removing it. */
export function scopedToShape(product: Product, uid: string): { options: number; sizes: number; specs: number } {
  return {
    options: product.options.filter((option) => option.shape === uid).length,
    sizes: product.sizes.filter((size) => size.shape === uid).length,
    specs: product.specs.filter((spec) => spec.shape === uid).length,
  };
}

export function moveShape(product: Product, uid: string, step: -1 | 1): Product {
  const index = product.shapes.findIndex((shape) => shape.uid === uid);
  return index < 0 ? product : { ...product, shapes: moveWithinGroup(product.shapes, index, step) };
}

// ───────────── options ─────────────

export function addOption(product: Product, shape: string | null): Product {
  const uid = newUid();
  const option: Option = {
    uid,
    slugs: slugEntries(placeholderSlug(uid)),
    shape,
    material: "",
    position: nextPosition(product.options, isOwnShape(shape)),
    icon: null,
    hideFoil: false,
    hideDoubleSided: false,
    prices: { base: null, doubleSided: null, foil: null, foil2: null },
    unit: null,
    ogImage: null,
    i18n: {},
    bullets: [],
    images: { default: [], pure: [] },
  };
  return { ...product, options: [...product.options, option] };
}

export function removeOption(product: Product, uid: string): Product {
  return { ...product, options: renumber(product.options.filter((option) => option.uid !== uid), scopeOf) };
}

export function moveOption(product: Product, uid: string, step: -1 | 1): Product {
  const index = product.options.findIndex((option) => option.uid === uid);
  return index < 0 ? product : { ...product, options: moveWithinGroup(product.options, index, step, scopeOf) };
}

/** An option offered by the whole product, or only by one shape. It goes to the end of its new group; the old group closes up. */
export function setOptionScope(product: Product, uid: string, shape: string | null): Product {
  const option = product.options.find((candidate) => candidate.uid === uid);
  if (!option) return product;
  // Positions follow the array order, so the option moves to the END of the array: that is the end of any group it joins.
  const others = product.options.filter((candidate) => candidate.uid !== uid);
  return { ...product, options: renumber([...others, { ...option, shape }], scopeOf) };
}

// ───────────── bullets ─────────────

const kindOf = (bullet: Bullet): string => bullet.kind;

function changeOption(product: Product, uid: string, change: (option: Option) => Option): Product {
  return { ...product, options: product.options.map((option) => (option.uid === uid ? change(option) : option)) };
}

export function addBullet(product: Product, optionUid: string, kind: Bullet["kind"]): Product {
  return changeOption(product, optionUid, (option) => {
    const bullet: Bullet = { kind, position: nextPosition(option.bullets, (b) => b.kind === kind), trait: null, i18n: {} };
    // Next to the others of its kind: features are listed before "best for" lines.
    const lastOfKind = option.bullets.map(kindOf).lastIndexOf(kind);
    const at = lastOfKind >= 0 ? lastOfKind + 1 : kind === "feature" ? 0 : option.bullets.length;
    return { ...option, bullets: [...option.bullets.slice(0, at), bullet, ...option.bullets.slice(at)] };
  });
}

export function removeBullet(product: Product, optionUid: string, index: number): Product {
  return changeOption(product, optionUid, (option) => ({ ...option, bullets: renumber(option.bullets.filter((_, i) => i !== index), kindOf) }));
}

export function moveBullet(product: Product, optionUid: string, index: number, step: -1 | 1): Product {
  return changeOption(product, optionUid, (option) => ({ ...option, bullets: moveWithinGroup(option.bullets, index, step, kindOf) }));
}

/** Only a feature has an icon, so turning one into a "best for" line drops its trait. */
export function setBulletKind(product: Product, optionUid: string, index: number, kind: Bullet["kind"]): Product {
  return changeOption(product, optionUid, (option) => {
    const bullets = option.bullets.map((bullet, i) => (i === index ? { ...bullet, kind, trait: kind === "feature" ? bullet.trait : null } : bullet));
    const ordered = [...bullets.filter((b) => b.kind === "feature"), ...bullets.filter((b) => b.kind === "best_for")];
    return { ...option, bullets: renumber(ordered, kindOf) };
  });
}

// ───────────── sizes and specs ─────────────

export function addSize(product: Product, shape: string | null): Product {
  const used = new Set(product.sizes.filter(isOwnShape(shape)).map((size) => size.tier));
  const tier = SIZE_TIERS.find((candidate) => !used.has(candidate));
  if (!tier) return product;
  const size: Size = { shape, tier, w: null, h: null, d: null, text: null, i18n: {} };
  return { ...product, sizes: [...product.sizes, size] };
}

export const hasFreeTier = (product: Product, shape: string | null): boolean => product.sizes.filter(isOwnShape(shape)).length < SIZE_TIERS.length;

export function removeSize(product: Product, index: number): Product {
  return { ...product, sizes: product.sizes.filter((_, i) => i !== index) };
}

const specGroup = (spec: Spec): string => `${scopeOf(spec)}|${spec.kind}`;

export function addSpec(product: Product, shape: string | null, kind: Spec["kind"]): Product {
  const spec: Spec = { shape, kind, item: "", position: nextPosition(product.specs, (s) => s.shape === shape && s.kind === kind) };
  return { ...product, specs: [...product.specs, spec] };
}

export function removeSpec(product: Product, index: number): Product {
  return { ...product, specs: renumber(product.specs.filter((_, i) => i !== index), specGroup) };
}

export function moveSpec(product: Product, index: number, step: -1 | 1): Product {
  return { ...product, specs: moveWithinGroup(product.specs, index, step, specGroup) };
}

/** A spec list item belongs to one kind: changing the kind clears the item (it was picked from the old kind's list). */
export function setSpecKind(product: Product, index: number, kind: Spec["kind"]): Product {
  const target = product.specs[index];
  const others = product.specs.filter((_, i) => i !== index);
  const position = nextPosition(others, (s) => s.shape === target.shape && s.kind === kind);
  const specs = product.specs.map((spec, i) => (i === index ? { ...spec, kind, item: "", position } : spec));
  return { ...product, specs: renumber(specs, specGroup) };
}

// ───────────── URLs ─────────────

/** Moving to another category: an old alias that would now equal the canonical URL goes (a canonical URL is never an alias). */
export function moveToCategory(product: Product, category: string): Product {
  const slugs = Object.fromEntries(LOCALES.map((locale) => [locale, { ...product.slugs[locale], aliases: withoutAliasEqualTo(product.slugs[locale].aliases, product.slugs[locale].slug, category) }])) as Product["slugs"];
  return { ...product, category, slugs };
}

export function setProductSlug(product: Product, locale: LocaleCode, slug: string): Product {
  const entry = product.slugs[locale];
  return { ...product, slugs: { ...product.slugs, [locale]: { slug, aliases: withoutAliasEqualTo(entry.aliases, slug, product.category) } } };
}

type ChildKind = "shapes" | "options";

/** Every slug (canonical and old) the shapes and options answer to in each language, except those of one child: what a new slug must avoid. */
export function takenSlugs(product: Product, exceptUid: string): Taken {
  const taken: Record<string, Set<string>> = Object.fromEntries(LOCALES.map((locale) => [locale, new Set<string>()]));
  for (const child of [...product.shapes, ...product.options]) {
    if (child.uid === exceptUid) continue;
    for (const locale of LOCALES) {
      taken[locale].add(child.slugs[locale].slug);
      for (const alias of child.slugs[locale].aliases) taken[locale].add(alias);
    }
  }
  return taken;
}

export function setChildSlug(product: Product, kind: ChildKind, uid: string, locale: LocaleCode, slug: string): Product {
  const change = <C extends Shape | Option>(child: C): C => (child.uid === uid ? { ...child, slugs: { ...child.slugs, [locale]: { slug, aliases: withoutAliasEqualTo(child.slugs[locale].aliases, slug) } } } : child);
  return kind === "shapes" ? { ...product, shapes: product.shapes.map(change) } : { ...product, options: product.options.map(change) };
}

const namesOf = (child: Shape | Option): Names => ({ vi: child.i18n.vi?.name, en: child.i18n.en?.name });

/**
 * A shape or option created in this draft follows its names: its slugs (still the placeholder, or the old name's) are rebuilt from
 * the new names. Call it with the child as it was BEFORE the name changed and as it is after.
 */
export function followChildNames(product: Product, kind: ChildKind, uid: string, before: Shape | Option): Product {
  const current = [...product.shapes, ...product.options].find((child) => child.uid === uid);
  if (!current) return product;
  const slugs = Object.fromEntries(LOCALES.map((locale) => [locale, current.slugs[locale].slug])) as Slugs;
  const next = followNames(slugs, namesOf(before), namesOf(current), takenSlugs(product, uid));
  return LOCALES.reduce((result, locale) => (next[locale] === slugs[locale] ? result : setChildSlug(result, kind, uid, locale, next[locale])), product);
}
