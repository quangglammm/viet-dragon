import { sql } from "drizzle-orm";
import { bigint, boolean, check, foreignKey, index, integer, pgTable, primaryKey, smallint, text, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { iconIfSetCheck, kebabCheck, nonblankCheck, nonblankIfSetCheck, nonNegativeCheck, oneOfCheck } from "./columns";
import { localeRef, media } from "./foundations";
import { material, unit, trait } from "./library";
import { product } from "./catalog";
import { ogImageColumns, ogImageConstraints, seoTextChecks, seoTextColumns } from "./seo";

// Shapes and options of a product. The composite foreign keys (id, product_id) make "an option of a shape of
// ANOTHER product" impossible by construction.

export const shape = pgTable(
  "shape",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uid: uuid("uid").notNull().unique().defaultRandom(),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => product.id, { onDelete: "cascade" }),
    imageMediaId: bigint("image_media_id", { mode: "number" }).references(() => media.id, { onDelete: "restrict" }),
    position: smallint("position").notNull(),
    ...ogImageColumns(),
  },
  (t) => [
    nonNegativeCheck("shape_position_nonneg", t.position),
    unique("shape_id_product_id_unique").on(t.id, t.productId),
    index("shape_product_position_idx").on(t.productId, t.position),
    index("shape_image_media_idx").on(t.imageMediaId),
    ...ogImageConstraints("shape", t),
  ],
);

export const shapeI18n = pgTable(
  "shape_i18n",
  {
    shapeId: bigint("shape_id", { mode: "number" }).notNull().references(() => shape.id, { onDelete: "cascade" }),
    locale: localeRef(),
    name: text("name").notNull(),
    description: text("description"),
    /** Plain text per language (was a 71-row library nobody displays). */
    badge: text("badge"),
    ...seoTextColumns(),
  },
  (t) => [
    primaryKey({ columns: [t.shapeId, t.locale] }),
    nonblankCheck("shape_i18n_name_nonblank", t.name),
    nonblankIfSetCheck("shape_i18n_description_nonblank", t.description),
    nonblankIfSetCheck("shape_i18n_badge_nonblank", t.badge),
    ...seoTextChecks("shape_i18n", t),
  ],
);

/** One offer of a material by a product, optionally only for one shape. NOT unique per material (`tet/to-roi` offers one stock three times). */
export const option = pgTable(
  "option",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uid: uuid("uid").notNull().unique().defaultRandom(),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => product.id, { onDelete: "cascade" }),
    shapeId: bigint("shape_id", { mode: "number" }),
    materialId: bigint("material_id", { mode: "number" }).notNull().references(() => material.id, { onDelete: "restrict" }),
    position: smallint("position").notNull(),
    icon: text("icon"),
    // Dormant: the product card declares but does not use these today (docs/data-model.md §8 item 11).
    hideFoil: boolean("hide_foil").notNull().default(false),
    hideDoubleSided: boolean("hide_double_sided").notNull().default(false),
    basePrice: integer("base_price"),
    doubleSidedPrice: integer("double_sided_price"),
    foilPrice: integer("foil_price"),
    foil2Price: integer("foil2_price"),
    unitKey: text("unit_key").references(() => unit.key, { onDelete: "restrict" }),
    ...ogImageColumns(),
  },
  (t) => [
    nonNegativeCheck("option_position_nonneg", t.position),
    iconIfSetCheck("option_icon_format", t.icon),
    nonNegativeCheck("option_base_price_nonneg", t.basePrice),
    nonNegativeCheck("option_double_sided_price_nonneg", t.doubleSidedPrice),
    nonNegativeCheck("option_foil_price_nonneg", t.foilPrice),
    nonNegativeCheck("option_foil2_price_nonneg", t.foil2Price),
    foreignKey({ name: "option_shape_product_fk", columns: [t.shapeId, t.productId], foreignColumns: [shape.id, shape.productId] }).onDelete("cascade"),
    unique("option_id_product_id_unique").on(t.id, t.productId),
    index("option_product_shape_idx").on(t.productId, t.shapeId),
    index("option_material_idx").on(t.materialId),
    index("option_unit_idx").on(t.unitKey),
    ...ogImageConstraints("option", t),
  ],
);

export const optionI18n = pgTable(
  "option_i18n",
  {
    optionId: bigint("option_id", { mode: "number" }).notNull().references(() => option.id, { onDelete: "cascade" }),
    locale: localeRef(),
    /** The offer's own full name: page <title>, breadcrumb, alt text, lead message. */
    name: text("name"),
    /** Card heading override. Card heading = card_title ?? material name ?? name. */
    cardTitle: text("card_title"),
    tagline: text("tagline"),
    ...seoTextColumns(),
  },
  (t) => [
    primaryKey({ columns: [t.optionId, t.locale] }),
    nonblankIfSetCheck("option_i18n_name_nonblank", t.name),
    nonblankIfSetCheck("option_i18n_card_title_nonblank", t.cardTitle),
    nonblankIfSetCheck("option_i18n_tagline_nonblank", t.tagline),
    ...seoTextChecks("option_i18n", t),
    // A row must say something. (The reference DDL listed name/card_title/tagline; the SEO overrides count too,
    // so a language may carry only its SEO text.)
    check(
      "option_i18n_not_empty",
      sql`${t.name} is not null or ${t.cardTitle} is not null or ${t.tagline} is not null or ${t.seoTitle} is not null or ${t.seoDescription} is not null`,
    ),
  ],
);

export const BULLET_KINDS = ["feature", "best_for"] as const;
export type BulletKind = (typeof BULLET_KINDS)[number];

/** One bullet = one icon (a trait, features only) + N language texts. */
export const optionBullet = pgTable(
  "option_bullet",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    optionId: bigint("option_id", { mode: "number" }).notNull().references(() => option.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: BULLET_KINDS }).notNull(),
    position: smallint("position").notNull(),
    traitKey: text("trait_key").references(() => trait.key, { onDelete: "restrict" }),
  },
  (t) => [
    oneOfCheck("option_bullet_kind_valid", t.kind, BULLET_KINDS),
    nonNegativeCheck("option_bullet_position_nonneg", t.position),
    check("option_bullet_trait_only_features", sql`${t.kind} = 'feature' or ${t.traitKey} is null`),
    unique("option_bullet_option_kind_position_unique").on(t.optionId, t.kind, t.position),
    index("option_bullet_option_idx").on(t.optionId),
    index("option_bullet_trait_idx").on(t.traitKey),
  ],
);

export const optionBulletI18n = pgTable(
  "option_bullet_i18n",
  {
    bulletId: bigint("bullet_id", { mode: "number" }).notNull().references(() => optionBullet.id, { onDelete: "cascade" }),
    locale: localeRef(),
    text: text("text").notNull(),
  },
  (t) => [primaryKey({ columns: [t.bulletId, t.locale] }), nonblankCheck("option_bullet_i18n_text_nonblank", t.text)],
);

export const IMAGE_VARIANTS = ["default", "pure"] as const;

export const optionImage = pgTable(
  "option_image",
  {
    optionId: bigint("option_id", { mode: "number" }).notNull().references(() => option.id, { onDelete: "cascade" }),
    variant: text("variant", { enum: IMAGE_VARIANTS }).notNull(),
    position: smallint("position").notNull(),
    mediaId: bigint("media_id", { mode: "number" }).notNull(),
    // Always 'image': with the composite foreign key below a video cannot fill a photo slot.
    mediaKind: text("media_kind").notNull().default("image"),
  },
  (t) => [
    primaryKey({ columns: [t.optionId, t.variant, t.position] }),
    oneOfCheck("option_image_variant_valid", t.variant, IMAGE_VARIANTS),
    nonNegativeCheck("option_image_position_nonneg", t.position),
    oneOfCheck("option_image_media_kind_image", t.mediaKind, ["image"]),
    foreignKey({ name: "option_image_media_fk", columns: [t.mediaId, t.mediaKind], foreignColumns: [media.id, media.kind] }).onDelete("restrict"),
    index("option_image_media_idx").on(t.mediaId),
  ],
);

/**
 * Owns the third URL segment / `#hash` namespace of one product, per language: every shape and option slug AND every
 * alias. PK (product_id, locale, slug) makes "a shape and an option with the same slug" or "an alias shadowing a live
 * slug" impossible within a language. Every shape and option has one canonical row in EVERY language (commit-time
 * trigger); the target columns and the language are frozen.
 */
export const productSegment = pgTable(
  "product_segment",
  {
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => product.id, { onDelete: "cascade" }),
    locale: localeRef(),
    slug: text("slug").notNull(),
    shapeId: bigint("shape_id", { mode: "number" }),
    optionId: bigint("option_id", { mode: "number" }),
    isCanonical: boolean("is_canonical").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.locale, t.slug] }),
    kebabCheck("product_segment_slug_format", t.slug),
    check("product_segment_one_target", sql`(${t.shapeId} is not null) <> (${t.optionId} is not null)`),
    foreignKey({ name: "product_segment_shape_fk", columns: [t.shapeId, t.productId], foreignColumns: [shape.id, shape.productId] }).onDelete("cascade"),
    foreignKey({ name: "product_segment_option_fk", columns: [t.optionId, t.productId], foreignColumns: [option.id, option.productId] }).onDelete("cascade"),
    uniqueIndex("product_segment_one_canonical_shape").on(t.shapeId, t.locale).where(sql`${t.isCanonical} and ${t.shapeId} is not null`),
    uniqueIndex("product_segment_one_canonical_option").on(t.optionId, t.locale).where(sql`${t.isCanonical} and ${t.optionId} is not null`),
    index("product_segment_shape_idx").on(t.shapeId),
    index("product_segment_option_idx").on(t.optionId),
  ],
);
