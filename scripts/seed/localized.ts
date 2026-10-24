import { routing } from "@/i18n/routing";

// The site's data files spell a language into the field name in three different ways. These accessors are the
// only place that knows how; everything else asks for (field, locale).

export type Locale = (typeof routing.locales)[number];
export const LOCALES: readonly Locale[] = routing.locales;
export const DEFAULT_LOCALE: Locale = routing.defaultLocale;
export const TRANSLATED_LOCALES: readonly Locale[] = LOCALES.filter((locale) => locale !== "vi" && locale !== "en");

/**
 * suffixed: titleVi, titleEn, titleZh…   (subgroups, shapes, menus, Fast Print, blog categories)
 * option:   nameVi, name, nameZh…        (product options: Vietnamese suffixed, English bare)
 * post:     title, titleEn, titleZh…     (blog posts: Vietnamese bare)
 */
export type FieldStyle = "suffixed" | "option" | "post";

const SUFFIX: Record<FieldStyle, Record<Locale, string>> = {
  suffixed: { vi: "Vi", en: "En", zh: "Zh", ja: "Ja", ko: "Ko" },
  option: { vi: "Vi", en: "", zh: "Zh", ja: "Ja", ko: "Ko" },
  post: { vi: "", en: "En", zh: "Zh", ja: "Ja", ko: "Ko" },
};

const read = (record: object, key: string): unknown => (record as Record<string, unknown>)[key];

/** The string field for a language, or undefined when absent. */
export function localizedText(record: object, base: string, style: FieldStyle, locale: Locale): string | undefined {
  const value = read(record, base + SUFFIX[style][locale]);
  return typeof value === "string" ? value : undefined;
}

/** The string-list field for a language (bullets), or undefined when absent. */
export function localizedList(record: object, base: string, style: FieldStyle, locale: Locale): string[] | undefined {
  const value = read(record, base + SUFFIX[style][locale]);
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? (value as string[]) : undefined;
}

/** Per-language record of a translated text (undefined where the source has none). */
export function localizedTexts(record: object, base: string, style: FieldStyle): Record<Locale, string | undefined> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, localizedText(record, base, style, locale)])) as Record<Locale, string | undefined>;
}

/** A row of data/translations.ts: the zh/ja/ko text kept outside the records, keyed by id. */
export type TranslatedEntry = { zh: string; ja: string; ko: string };

/** The zh/ja/ko text for an id in one of those tables; undefined for other languages or unknown ids. */
export function translated(table: Record<string, TranslatedEntry>, id: string, locale: Locale): string | undefined {
  const entry: TranslatedEntry | undefined = table[id];
  return locale === "zh" || locale === "ja" || locale === "ko" ? entry?.[locale] : undefined;
}
