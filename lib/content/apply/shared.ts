import { LOCALES, type LocaleCode } from "../schemas";

/** The `[language, value]` pairs of a per-language map, in the site's language order. */
export function localeEntries<T>(map: Partial<Record<LocaleCode, T>>): [LocaleCode, T][] {
  return LOCALES.flatMap((locale) => {
    const value = map[locale];
    return value === undefined ? [] : [[locale, value] as [LocaleCode, T]];
  });
}
