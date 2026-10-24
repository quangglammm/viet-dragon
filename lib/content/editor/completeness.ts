import { LOCALES, type LocaleCode } from "../schemas";
import type { Json } from "./paths";

// How much of a document is translated. English and Vietnamese are the master languages; every text either of them has is a text
// the other languages are expected to have too. The editor shows the numbers on the language tabs, so a half-translated product
// is visible before it is published (an untranslated text falls back to English on the site).

export interface Completeness {
  filled: number;
  expected: number;
}

const isPlainObject = (value: unknown): value is { [key: string]: Json } => typeof value === "object" && value !== null && !Array.isArray(value);

/** The texts inside one language's value: `""` for a plain string, otherwise the dotted/indexed path of every string. */
function textPaths(value: unknown, prefix = ""): Map<string, string> {
  const found = new Map<string, string>();
  if (typeof value === "string") found.set(prefix, value);
  else if (Array.isArray(value)) value.forEach((item, index) => textPaths(item, `${prefix}[${index}]`).forEach((text, path) => found.set(path, text)));
  else if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) textPaths(item, prefix === "" ? key : `${prefix}.${key}`).forEach((text, path) => found.set(path, text));
  }
  return found;
}

const isLanguageMap = (value: unknown): value is { [key: string]: Json } => isPlainObject(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => (LOCALES as readonly string[]).includes(key));

/** Every `{ vi: …, en: … }` map in the document: the `i18n` of the entity and of its children, and a site message's `data`. */
function languageMaps(node: unknown, found: { [key: string]: Json }[] = []): { [key: string]: Json }[] {
  if (Array.isArray(node)) node.forEach((item) => languageMaps(item, found));
  else if (isPlainObject(node)) {
    for (const [key, child] of Object.entries(node)) {
      if ((key === "i18n" || key === "data") && isLanguageMap(child)) found.push(child);
      else languageMaps(child, found);
    }
  }
  return found;
}

export function completeness(document: unknown): Record<LocaleCode, Completeness> {
  const totals = Object.fromEntries(LOCALES.map((locale) => [locale, { filled: 0, expected: 0 }])) as Record<LocaleCode, Completeness>;
  for (const map of languageMaps(document)) {
    const expected = new Set([...textPaths(map.vi).keys(), ...textPaths(map.en).keys()]);
    for (const locale of LOCALES) {
      const texts = textPaths(map[locale]);
      totals[locale].expected += expected.size;
      for (const path of expected) if ((texts.get(path) ?? "").trim() !== "") totals[locale].filled += 1;
    }
  }
  return totals;
}

/** 0–100, where nothing to translate counts as complete. */
export function percentOf({ filled, expected }: Completeness): number {
  return expected === 0 ? 100 : Math.round((filled / expected) * 100);
}
