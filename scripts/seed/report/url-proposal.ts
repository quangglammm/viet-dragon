import type { Locale } from "../localized";

// The fixed words of the public URLs, PROPOSED for the owner's approval. They are not in the database: Phase 4 puts
// them in i18n/routing.ts as localized `pathnames` and adds a redirect rule so every old URL answers 308 to the new one.
// Chinese, Japanese and Korean copy English (Latin letters only, in every language).

export const FIXED_WORDS = {
  products: { vi: "san-pham", en: "products" },
  fastPrint: { vi: "in-nhanh", en: "fast-print" },
  blog: { vi: "bai-viet", en: "blog" },
} as const;

export type FixedWord = keyof typeof FIXED_WORDS;

export const fixedWord = (word: FixedWord, locale: Locale): string => (locale === "vi" ? FIXED_WORDS[word].vi : FIXED_WORDS[word].en);

/** Vietnamese is the unprefixed default language; every other language has its code in front. */
export const languagePrefix = (locale: Locale): string => (locale === "vi" ? "" : `/${locale}`);

export const productUrl = (locale: Locale, categorySlug: string, productSlug: string): string =>
  `${languagePrefix(locale)}/${fixedWord("products", locale)}/${categorySlug}/${productSlug}`;

export const postUrl = (locale: Locale, slug: string): string => `${languagePrefix(locale)}/${fixedWord("blog", locale)}/${slug}`;

/** Today's URL of a product: the same slug in every language, only the prefix differs. */
export const todayProductUrl = (locale: Locale, categoryKey: string, productId: string): string => `${languagePrefix(locale)}/products/${categoryKey}/${productId}`;
