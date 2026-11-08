import { LOCALES, TRANSLATED_LOCALES, type Locale } from "./localized";
import { uniqueSlug } from "./util";

// URLs are localized: every product, shape, option, post and category has a slug in each language. Vietnamese keeps
// the slugs the site has today; English is generated from the English name; Chinese, Japanese and Korean start as a
// copy of the English slug (Latin letters only, in every language) and can be localized by an editor later.

export type SlugsByLocale = Record<Locale, string>;

/** The slugs already used in one namespace (a product's segments, a category's products…), per language. */
export type TakenSlugs = Record<Locale, Set<string>>;

export const emptyTaken = (): TakenSlugs => Object.fromEntries(LOCALES.map((locale) => [locale, new Set<string>()])) as TakenSlugs;

/**
 * Reserve a slug in each language: `vi` and `en` are made unique in their own language; zh/ja/ko take the English one
 * (their namespaces mirror English until an editor localizes them, so it is free there too).
 */
export function claimSlugs(taken: TakenSlugs, vi: string, en: string): SlugsByLocale {
  const viSlug = uniqueSlug(vi, taken.vi);
  const enSlug = uniqueSlug(en, taken.en);
  for (const locale of TRANSLATED_LOCALES) taken[locale].add(enSlug);
  return { vi: viSlug, en: enSlug, zh: enSlug, ja: enSlug, ko: enSlug };
}

const MAX_POST_SLUG_LENGTH = 60;

/** Cut a long slug at a dash so it stays readable in a URL. */
export function clipSlug(slug: string, max: number = MAX_POST_SLUG_LENGTH): string {
  if (slug.length <= max) return slug;
  const cut = slug.slice(0, max);
  const dash = cut.lastIndexOf("-");
  return dash > max / 2 ? cut.slice(0, dash) : cut.replace(/-+$/, "");
}
