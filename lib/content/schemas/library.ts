import { z } from "zod";
import {
  DOCUMENT_SCHEMA,
  iconSchema,
  mediaKeySchema,
  nonblankText,
  nonNegativeInt,
  perLocale,
  positionSchema,
  requireDefaultLocale,
  seoFields,
  slugSchema,
  uidSchema,
  localeSchema,
} from "./common";
import { PRODUCT_STATUSES, SPEC_KIND_VALUES } from "./product";

// Documents for everything that is not a product, menu or post (docs/data-model.md §4). Vocabulary records are
// identified by an IMMUTABLE `key`; Fast Print and showcase items by `uid` (their `key` is an editable attribute).
// Each carries `schema` like every document and has the default-language rule.

const schema = z.literal(DOCUMENT_SCHEMA);
const label = perLocale(z.strictObject({ label: nonblankText }));

function withDefaultLanguage<T extends z.ZodType<{ i18n: Partial<Record<string, unknown>> }>>(document: T) {
  return document.superRefine((value, ctx) => requireDefaultLocale(value.i18n, ctx, []));
}

export const materialDocumentSchema = withDefaultLanguage(
  z.strictObject({ schema, key: slugSchema, icon: iconSchema.nullable(), i18n: perLocale(z.strictObject({ name: nonblankText })) }),
);

export const traitDocumentSchema = withDefaultLanguage(
  z.strictObject({
    schema,
    key: slugSchema,
    icon: iconSchema,
    i18n: perLocale(z.strictObject({ label: nonblankText, description: nonblankText.optional() })),
  }),
);

export const unitDocumentSchema = withDefaultLanguage(z.strictObject({ schema, key: slugSchema, i18n: label }));

export const postCategoryDocumentSchema = withDefaultLanguage(z.strictObject({ schema, key: slugSchema, i18n: label }));

/** `key` is `<kind>/<item key>` (the pair is the immutable identity), e.g. `technique/offset`. */
const SPEC_ITEM_KEY = new RegExp(`^(${SPEC_KIND_VALUES.join("|")})/[a-z0-9]+(-[a-z0-9]+)*$`);
export const specItemDocumentSchema = withDefaultLanguage(
  z.strictObject({
    schema,
    key: z.string().regex(SPEC_ITEM_KEY, "Khóa phải có dạng loại/mã, ví dụ technique/offset."),
    isDefault: z.boolean(),
    i18n: label,
  }),
);

export const categoryDocumentSchema = withDefaultLanguage(
  z.strictObject({
    schema,
    key: slugSchema,
    icon: iconSchema,
    cover: mediaKeySchema.nullable(),
    ogImage: mediaKeySchema.nullable(),
    position: positionSchema,
    i18n: perLocale(z.strictObject({ name: nonblankText, description: nonblankText.optional(), ...seoFields })),
  }),
);

export const fastPrintItemDocumentSchema = withDefaultLanguage(
  z.strictObject({
    schema,
    uid: uidSchema,
    key: slugSchema,
    image: mediaKeySchema.nullable(),
    icon: iconSchema,
    turnaroundHours: z.int().positive().nullable(),
    /** Whole VND, shown with the unit ("Chỉ từ 120.000đ/Hộp"). */
    fromPrice: nonNegativeInt.nullable(),
    unit: slugSchema.nullable(),
    position: positionSchema,
    status: z.enum(PRODUCT_STATUSES),
    i18n: perLocale(z.strictObject({ name: nonblankText, tag: nonblankText.optional(), description: nonblankText.optional() })),
  }),
);

export const SHOWCASE_ASPECT_VALUES = ["tall", "square", "wide"] as const;
export const showcaseItemDocumentSchema = withDefaultLanguage(
  z.strictObject({
    schema,
    uid: uidSchema,
    key: slugSchema,
    media: mediaKeySchema,
    aspect: z.enum(SHOWCASE_ASPECT_VALUES),
    position: positionSchema,
    i18n: label,
  }),
);

/** `key` is the namespace; the document holds that namespace for every language (one draft edits them side by side). */
export const siteMessageDocumentSchema = z.strictObject({
  schema,
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/, "Tên nhóm chỉ gồm chữ cái và số, bắt đầu bằng chữ cái."),
  data: z.partialRecord(localeSchema, z.record(z.string(), z.unknown())),
});

export type MaterialDocument = z.infer<typeof materialDocumentSchema>;
export type TraitDocument = z.infer<typeof traitDocumentSchema>;
export type UnitDocument = z.infer<typeof unitDocumentSchema>;
export type SpecItemDocument = z.infer<typeof specItemDocumentSchema>;
export type CategoryDocument = z.infer<typeof categoryDocumentSchema>;
export type FastPrintItemDocument = z.infer<typeof fastPrintItemDocumentSchema>;
export type ShowcaseItemDocument = z.infer<typeof showcaseItemDocumentSchema>;
export type PostCategoryDocument = z.infer<typeof postCategoryDocumentSchema>;
export type SiteMessageDocument = z.infer<typeof siteMessageDocumentSchema>;
