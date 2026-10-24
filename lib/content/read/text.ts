import { LOCALES, type LocaleCode } from "../schemas";

// What the public site reads from the content database: a text in each language that has one. Missing languages are simply absent;
// the reader falls back per text — requested language → English → Vietnamese (docs/data-model.md §5), and per bullet for lists.
// Client-safe: components use it to pick what to draw.

export type Localized = Partial<Record<LocaleCode, string>>;

/** The text for a language, falling back to English, then Vietnamese; "" when the text has nothing at all. */
export function pickText(locale: LocaleCode, text: Localized | undefined): string {
  if (!text) return "";
  return text[locale] ?? text.en ?? text.vi ?? "";
}

const present = (value: string | undefined): value is string => value !== undefined && value.trim() !== "";

/** A document's per-language rows (`i18n`) read through `pick` into one text per language; languages with no text are left out. */
export function localize<R>(rows: Partial<Record<LocaleCode, R>> | undefined, pick: (row: R) => string | undefined): Localized {
  const text: Localized = {};
  for (const locale of LOCALES) {
    const row = rows?.[locale];
    const value = row === undefined ? undefined : pick(row);
    if (present(value)) text[locale] = value;
  }
  return text;
}

/** Layers texts: for each language the first layer that has one wins (a menu's own label over the shape's name). */
export function overlay(...layers: readonly Localized[]): Localized {
  const text: Localized = {};
  for (const locale of LOCALES) {
    const value = layers.map((layer) => layer[locale]).find(present);
    if (value !== undefined) text[locale] = value;
  }
  return text;
}
