import { LOCALES, type LocaleCode } from "../schemas";
import { slugify } from "../slugify";

// URL slugs the editor suggests, and the rules that keep them consistent. Every slug is Latin letters, digits and dashes, in every
// language. Vietnamese and English are made from their own names; zh/ja/ko start as a copy of English (decided with the owner) and
// follow it for as long as nobody edited them. An EXISTING record's slug never changes by itself — renaming a published product
// must not move its URL behind the editor's back — so following applies to what was created in this draft.

export type Slugs = Record<LocaleCode, string>;
export type Names = { vi?: string; en?: string };
export type Taken = Partial<Record<LocaleCode, ReadonlySet<string>>>;

export const PLACEHOLDER = "moi-";

/** A valid slug for a record that has no name yet. */
export const placeholderSlug = (uid: string): string => `${PLACEHOLDER}${uid.replaceAll("-", "").slice(0, 6)}`;

const isPlaceholder = (slug: string): boolean => slug.startsWith(PLACEHOLDER);

const named = (name: string | undefined): string | null => (name && name.trim() !== "" ? slugify(name) : null);

/** `base`, or `base-2`, `base-3`… when it is already taken in that language. */
export function uniqueIn(base: string, taken: ReadonlySet<string> | undefined): string {
  let slug = base;
  for (let n = 2; taken?.has(slug); n += 1) slug = `${base}-${n}`;
  return slug;
}

/** The slugs of a record with these names, in every language: vi from the Vietnamese name, en from the English one, the rest = en. */
export function suggestSlugs(names: Names, taken: Taken = {}): Slugs {
  const vi = named(names.vi) ?? named(names.en) ?? "x";
  const en = named(names.en) ?? named(names.vi) ?? "x";
  const base: Slugs = { vi, en, zh: en, ja: en, ko: en };
  return Object.fromEntries(LOCALES.map((locale) => [locale, uniqueIn(base[locale], taken[locale])])) as Slugs;
}

/**
 * The slugs after a name changed, for a record that is still following its names: a language whose slug was the placeholder or
 * the old name's slug takes the new name's slug (zh/ja/ko follow English). A slug somebody typed by hand is left alone.
 * A blank new name changes nothing.
 */
export function followNames(current: Slugs, before: Names, after: Names, taken: Taken = {}): Slugs {
  const result: Slugs = { ...current };
  const follow = (locale: LocaleCode, oldSlug: string | null, newSlug: string | null) => {
    if (newSlug === null || newSlug === current[locale]) return;
    if (isPlaceholder(current[locale]) || current[locale] === oldSlug) result[locale] = uniqueIn(newSlug, taken[locale]);
  };
  follow("vi", named(before.vi), named(after.vi));
  follow("en", named(before.en), named(after.en));
  // The three that copy English follow the English slug it had BEFORE this change.
  const newEnglish = result.en;
  for (const locale of ["zh", "ja", "ko"] as const) follow(locale, current.en, newEnglish);
  return result;
}

/**
 * A canonical slug cannot also be an alias (a document rule), so typing a slug the record already answers to makes it canonical
 * and removes the alias. Works for plain-string aliases (shapes, options, posts) and for the product's `{ category, slug }` ones.
 */
export function withoutAliasEqualTo<A extends string | { category: string; slug: string }>(aliases: readonly A[], slug: string, category?: string): A[] {
  return aliases.filter((alias) => (typeof alias === "string" ? alias !== slug : !(alias.slug === slug && alias.category === category)));
}

/** What the slug box shows while somebody types: lower case, no diacritics, anything else a dash (a trailing dash is kept: more is coming). */
export function typedSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "");
}

/** What is stored: the same, without a dangling dash. */
export const finishedSlug = (text: string): string => typedSlug(text).replace(/-+$/, "");
