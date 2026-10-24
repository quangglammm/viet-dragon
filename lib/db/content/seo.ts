import { bigint, foreignKey, index, text, type AnyPgColumn } from "drizzle-orm/pg-core";
import { nonblankIfSetCheck, oneOfCheck } from "./columns";
import { media } from "./foundations";

// SEO overrides (docs/data-model.md §11.5a). Every field is optional: when null the page title / description,
// then the cover image, are used. The Open Graph image is an *image-kind* media reference, like option_image.

/** Per-language overrides, added to the `*_i18n` tables of product, category, shape, option and post. */
export const seoTextColumns = () => ({
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
});

export const seoTextChecks = (table: string, t: { seoTitle: AnyPgColumn; seoDescription: AnyPgColumn }) => [
  nonblankIfSetCheck(`${table}_seo_title_nonblank`, t.seoTitle),
  nonblankIfSetCheck(`${table}_seo_description_nonblank`, t.seoDescription),
];

/** Open Graph image of a product, category, shape, option or post. `og_media_kind` is always 'image'. */
export const ogImageColumns = () => ({
  ogMediaId: bigint("og_media_id", { mode: "number" }),
  ogMediaKind: text("og_media_kind").notNull().default("image"),
});

export const ogImageConstraints = (table: string, t: { ogMediaId: AnyPgColumn; ogMediaKind: AnyPgColumn }) => [
  oneOfCheck(`${table}_og_media_kind_image`, t.ogMediaKind, ["image"]),
  foreignKey({ name: `${table}_og_media_fk`, columns: [t.ogMediaId, t.ogMediaKind], foreignColumns: [media.id, media.kind] }).onDelete("restrict"),
  index(`${table}_og_media_idx`).on(t.ogMediaId),
];
