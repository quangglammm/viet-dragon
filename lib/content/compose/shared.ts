import { alias } from "drizzle-orm/pg-core";
import { media } from "@/lib/db/schema";
import { routing } from "@/i18n/routing";

// Helpers for turning rows into documents (lib/content/schemas). `compose` and `apply` are inverses: whatever an
// editor saves must come back out of the rows unchanged, so everything here is deterministic.

export type LocaleCode = (typeof routing.locales)[number];

/** A document and the `version` of the live rows it was composed from (the optimistic-lock token). */
export interface Composed<T> {
  document: T;
  version: number;
}

/** Aliased joins of the media table: the cover image and the Open Graph image of the same row. */
export const coverMedia = alias(media, "cover_media");
export const ogMedia = alias(media, "og_media");
export const imageMedia = alias(media, "image_media");

/** Per-language map built from `*_i18n` rows, in the site's language order; languages the site does not know are skipped. */
export function i18nMap<R extends { locale: string }, T>(rows: readonly R[], build: (row: R) => T): Partial<Record<LocaleCode, T>> {
  const map: Partial<Record<LocaleCode, T>> = {};
  for (const locale of routing.locales) {
    const row = rows.find((r) => r.locale === locale);
    if (row) map[locale] = build(row);
  }
  return map;
}

/** A value for every language, built by `build(locale)` — for slugs, which exist in all of them. */
export function everyLocale<T>(build: (locale: LocaleCode) => T): Record<LocaleCode, T> {
  return Object.fromEntries(routing.locales.map((locale) => [locale, build(locale)])) as Record<LocaleCode, T>;
}

/** `{ [key]: value }`, or nothing when the value is null — optional document fields are absent, never null. */
export function optional<K extends string>(key: K, value: string | null | undefined): { [P in K]?: string } {
  return value == null ? {} : ({ [key]: value } as { [P in K]?: string });
}

/** The SEO overrides of an `*_i18n` row, as document fields. */
export const seoOf = (row: { seoTitle: string | null; seoDescription: string | null }) => ({
  ...optional("seoTitle", row.seoTitle),
  ...optional("seoDescription", row.seoDescription),
});

export function groupByKey<T, K>(rows: readonly T[], keyOf: (row: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const row of rows) {
    const key = keyOf(row);
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }
  return groups;
}

export const byText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
