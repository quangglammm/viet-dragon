import { z } from "zod";
import { routing } from "@/i18n/routing";

// Building blocks for the content documents (docs/data-model.md §9). A document is the unit of editing, drafting,
// publishing and restoring: one whole entity, referring to other records by uid (own children) or by immutable key
// (library and media). `DOCUMENT_SCHEMA` is stored as `snapshot_schema`; an upgrade function migrates old drafts and
// revisions when the format changes.
//
// Messages are Vietnamese because they are shown to editors (the admin is Vietnamese-only).

export const DOCUMENT_SCHEMA = 2;
export const LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

export const MESSAGES = {
  blank: "Không được để trống.",
  slug: "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang (ví dụ: to-roi-a5).",
  icon: "Tên biểu tượng chỉ gồm chữ cái và số.",
  defaultLanguageRequired: "Bắt buộc có nội dung tiếng Việt.",
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
 * One value per language; a missing language is a missing key (never an empty string). Unknown languages are
 * rejected, and the default language is required by `requireDefaultLocale` where the entity has translations.
 */
export const perLocale = <T extends z.ZodType>(value: T) => z.partialRecord(localeSchema, value);

export const seoFields = {
  seoTitle: nonblankText.optional(),
  seoDescription: nonblankText.optional(),
};

/**
 * Adds an issue when the `i18n` map of the entity at `path` lacks the default language (the database checks the
 * same rule at COMMIT, so this only gives the editor an earlier, field-level message).
 */
export function requireDefaultLocale(
  i18n: Partial<Record<string, unknown>>,
  ctx: z.RefinementCtx,
  path: (string | number)[],
): void {
  if (i18n[DEFAULT_LOCALE] === undefined) {
    ctx.addIssue({ code: "custom", message: MESSAGES.defaultLanguageRequired, path: [...path, "i18n", DEFAULT_LOCALE] });
  }
}

/** Prices are whole VND. */
export const nonNegativeInt = z.int().min(0);
