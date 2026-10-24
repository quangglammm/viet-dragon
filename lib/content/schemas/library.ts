import { z } from "zod";
import {
  DOCUMENT_SCHEMA,
  iconSchema,
  mediaKeySchema,
  nonblankText,
  nonNegativeInt,
  perLocale,
  positionSchema,
  localizedSlugs,
  requireMasterLocales,
  seoFields,
  slugSchema,
  uidSchema,
  localeSchema,
} from "./common";
import { PRODUCT_STATUSES, SPEC_KIND_VALUES } from "./product";

// Documents for everything that is not a product, menu or post (docs/data-model.md §4). Vocabulary records are
// identified by an IMMUTABLE `key`; Fast Print and showcase items by `uid` (their `key` is an editable attribute).
// Each carries `schema` like every document and has the master-language rule (Vietnamese and English).

const schema = z.literal(DOCUMENT_SCHEMA);
const label = perLocale(z.strictObject({ label: nonblankText }));

function withMasterLanguages<T extends z.ZodType<{ i18n: Partial<Record<string, unknown>> }>>(document: T) {
  return document.superRefine((value, ctx) => requireMasterLocales(value.i18n, ctx, []));
}

export const materialDocumentSchema = withMasterLanguages(
  z.strictObject({ schema, key: slugSchema, icon: iconSchema.nullable(), i18n: perLocale(z.strictObject({ name: nonblankText })) }),
);

export const traitDocumentSchema = withMasterLanguages(
  z.strictObject({
    schema,
    key: slugSchema,
    icon: iconSchema,
    i18n: perLocale(z.strictObject({ label: nonblankText, description: nonblankText.optional() })),
  }),
);

export const unitDocumentSchema = withMasterLanguages(z.strictObject({ schema, key: slugSchema, i18n: label }));

export const postCategoryDocumentSchema = withMasterLanguages(z.strictObject({ schema, key: slugSchema, i18n: label }));

/** `key` is `<kind>/<item key>` (the pair is the immutable identity), e.g. `technique/offset`. */
export const SPEC_ITEM_KEY_PATTERN = new RegExp(`^(${SPEC_KIND_VALUES.join("|")})/[a-z0-9]+(-[a-z0-9]+)*$`);
export const specItemDocumentSchema = withMasterLanguages(
  z.strictObject({
    schema,
    key: z.string().regex(SPEC_ITEM_KEY_PATTERN, "Khóa phải có dạng loại/mã, ví dụ technique/offset."),
    isDefault: z.boolean(),
    i18n: label,
  }),
);

export const categoryDocumentSchema = withMasterLanguages(
  z.strictObject({
    schema,
    key: slugSchema,
    /** The category segment of every URL in each language (`tiep-thi`, `tet-publications`), and the old ones that still resolve. */
    slugs: localizedSlugs(slugSchema),
    icon: iconSchema,
    cover: mediaKeySchema.nullable(),
    ogImage: mediaKeySchema.nullable(),
    position: positionSchema,
    i18n: perLocale(z.strictObject({ name: nonblankText, description: nonblankText.optional(), ...seoFields })),
  }),
);

export const fastPrintItemDocumentSchema = withMasterLanguages(
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
export const showcaseItemDocumentSchema = withMasterLanguages(
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

export const SITE_MESSAGE_NAMESPACE_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

/** `key` is the namespace; the document holds that namespace for every language (one draft edits them side by side). */
export const siteMessageDocumentSchema = z.strictObject({
  schema,
  key: z.string().regex(SITE_MESSAGE_NAMESPACE_PATTERN, "Tên nhóm chỉ gồm chữ cái và số, bắt đầu bằng chữ cái."),
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
