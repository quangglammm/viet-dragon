import { z } from "zod";
import { routing } from "@/i18n/routing";

// Building blocks for the content documents (docs/data-model.md §9). A document is the unit of editing, drafting,
// publishing and restoring: one whole entity, referring to other records by uid (own children) or by immutable key
// (library and media). `DOCUMENT_SCHEMA` is stored as `snapshot_schema`; an upgrade function migrates old drafts and
// revisions when the format changes.
//
// Messages are Vietnamese because they are shown to editors (the admin is Vietnamese-only).

export const DOCUMENT_SCHEMA = 2;

/**
 * Passed to `safeParse` so zod's own messages ("Invalid input: expected string…") reach the editor in Vietnamese. Per parse, not
 * `z.config`, so nothing else in the process (env validation, Better Auth) changes language. Messages written in our schemas win.
 */
export const parseOptions = { error: z.locales.vi().localeError };
export const LOCALES = routing.locales;

/**
 * The master languages: complete and owner-reviewed first. Every other language starts as a copy of English and keeps
 * falling back to it until translated. (The database only requires the default language; publishing requires both.)
 */
export const MASTER_LOCALES = ["vi", "en"] as const satisfies readonly LocaleCode[];
export const MASTER_LANGUAGE_NAME: Record<(typeof MASTER_LOCALES)[number], string> = { vi: "tiếng Việt", en: "tiếng Anh" };

export const MESSAGES = {
  blank: "Không được để trống.",
  slug: "Đường dẫn chỉ gồm chữ thường không dấu (a-z), số và dấu gạch ngang (ví dụ: to-roi-a5).",
  icon: "Tên biểu tượng chỉ gồm chữ cái và số.",
  masterLanguageRequired: (locale: (typeof MASTER_LOCALES)[number]) => `Bắt buộc có nội dung ${MASTER_LANGUAGE_NAME[locale]}.`,
} as const;

/** Mirrors the database's `nonblank()` (docs: Unicode-aware): whitespace, NBSP, U+3000, zero-width, BOM… */
const BLANK = /^[\s\u00a0\u1680\u180e\u2000-\u200f\u2028-\u202f\u205f-\u2064\u3000\ufeff]*$/;
export const isBlank = (value: string): boolean => BLANK.test(value);

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ICON = /^[A-Za-z0-9]+$/;

export const uidSchema = z.uuid();
export const slugSchema = z.string().regex(KEBAB, MESSAGES.slug);
export const iconSchema = z.string().regex(ICON, MESSAGES.icon);
export const nonblankText = z.string().refine((value) => !isBlank(value), MESSAGES.blank);
/** Media is referred to by its immutable storage key (`images/hero/a.webp`). */
export const mediaKeySchema = z.string().min(1);
export const positionSchema = z.int().min(0);

export const localeSchema = z.enum(LOCALES);
export type LocaleCode = z.infer<typeof localeSchema>;

/**
 * A value for EVERY language (zod's enum-keyed `record` is exhaustive, and rejects unknown languages). Used for slugs: a URL must
 * exist in every language, so a missing one is an error, unlike translated text where a missing language falls back.
 */
export const everyLocale = <T extends z.ZodType>(value: T) => z.record(localeSchema, value);

/** The slugs of one entity in each language: the canonical slug and the old ones that still resolve (never dropped by a publish). */
export const localizedSlugs = <A extends z.ZodType>(aliasSchema: A) => everyLocale(z.strictObject({ slug: slugSchema, aliases: z.array(aliasSchema) }));

/**
 * One value per language; a missing language is a missing key (never an empty string). Unknown languages are
 * rejected, and the master languages are required by `requireMasterLocales` where the entity has translations.
 */
export const perLocale = <T extends z.ZodType>(value: T) => z.partialRecord(localeSchema, value);

export const seoFields = {
  seoTitle: nonblankText.optional(),
  seoDescription: nonblankText.optional(),
};

/**
 * Adds an issue for each master language (Vietnamese, English) the `i18n` map of the entity at `path` lacks. The database
 * checks the default language at COMMIT; this gives the editor an earlier, field-level message, and also requires English.
 */
export function requireMasterLocales(i18n: Partial<Record<string, unknown>>, ctx: z.RefinementCtx, path: (string | number)[]): void {
  for (const locale of MASTER_LOCALES) {
    if (i18n[locale] === undefined) ctx.addIssue({ code: "custom", message: MESSAGES.masterLanguageRequired(locale), path: [...path, "i18n", locale] });
  }
}

/** Prices are whole VND. */
export const nonNegativeInt = z.int().min(0);
