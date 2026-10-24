import { sql } from "drizzle-orm";
import { LOCALES, type LocaleCode } from "../schemas";
import type { ApplyContext } from "./types";

/** The `[language, value]` pairs of a per-language map, in the site's language order. */
export function localeEntries<T>(map: Partial<Record<LocaleCode, T>>): [LocaleCode, T][] {
  return LOCALES.flatMap((locale) => {
    const value = map[locale];
    return value === undefined ? [] : [[locale, value] as [LocaleCode, T]];
  });
}

/** The `version` an entity has after this publish: the next one, or where a new entity starts. */
export const versionAfter = (context: ApplyContext): number => (context.baseVersion === null ? context.startVersion : context.baseVersion + 1);

/** Authorship columns of an edited row. */
export const touched = (author: string | null) => ({ updatedAt: sql`now()`, updatedBy: author });
