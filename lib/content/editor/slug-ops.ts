import { LOCALES, type LocaleCode } from "../schemas";
import { followNames, withoutAliasEqualTo, type Names, type Slugs, type Taken } from "./slugs";

// The URL rules for a record whose slugs sit at the top of its document (a post, a category): the same rules the product editor applies
// to a product's slugs, on any document with `slugs: { <language>: { slug, aliases: string[] } }`.

export type RootSlugs = Record<LocaleCode, { slug: string; aliases: string[] }>;
type WithSlugs = { slugs: RootSlugs };

/** Chooses the slug of one language; an old URL equal to it stops being an alias (a canonical URL is never also an alias). */
export function setRootSlug<D extends WithSlugs>(document: D, locale: LocaleCode, slug: string): D {
  const entry = document.slugs[locale];
  return { ...document, slugs: { ...document.slugs, [locale]: { slug, aliases: withoutAliasEqualTo(entry.aliases, slug) } } };
}

/**
 * A record created in this draft follows its names: its slugs (still the placeholder, or the old name's) are rebuilt from the new
 * names, zh/ja/ko following English. Call it with the document as it is AFTER the name changed and the names as they were BEFORE.
 */
export function followRootNames<D extends WithSlugs>(document: D, before: Names, after: Names, taken: Taken = {}): D {
  const current = Object.fromEntries(LOCALES.map((locale) => [locale, document.slugs[locale].slug])) as Slugs;
  const next = followNames(current, before, after, taken);
  return LOCALES.reduce((result, locale) => (next[locale] === current[locale] ? result : setRootSlug(result, locale, next[locale])), document);
}
