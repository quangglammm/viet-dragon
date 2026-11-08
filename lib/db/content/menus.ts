import { sql } from "drizzle-orm";
import { bigint, boolean, check, index, pgTable, primaryKey, smallint, text } from "drizzle-orm/pg-core";
import { nonblankCheck, nonblankIfSetCheck, nonNegativeCheck, positiveCheck } from "./columns";
import { localeRef, media } from "./foundations";
import { product } from "./catalog";

// Mega-menu rows: explicit and editable, seeded from today's data/*-menu.ts. Labels, descriptions and images
// are OVERRIDES — only real differences from the target (shape / option / product) are stored.
//
// The two foreign keys from menu_item to shape and option are NOT declared here: they must be
// DEFERRABLE INITIALLY DEFERRED (a shape still in a menu cannot be deleted on its own, yet deleting the whole
// product must work), which Drizzle cannot express. They are added in 0004_content_integrity.sql.

/** One mega-menu group = one product. */
export const menuGroup = pgTable(
  "menu_group",
  {
    productId: bigint("product_id", { mode: "number" }).primaryKey().references(() => product.id, { onDelete: "cascade" }),
    menuColumn: smallint("menu_column").notNull(),
    position: smallint("position").notNull(),
    /** Override; default = product cover. */
    imageMediaId: bigint("image_media_id", { mode: "number" }).references(() => media.id, { onDelete: "restrict" }),
  },
  (t) => [
    positiveCheck("menu_group_column_positive", t.menuColumn),
    nonNegativeCheck("menu_group_position_nonneg", t.position),
    index("menu_group_image_media_idx").on(t.imageMediaId),
  ],
);

export const menuGroupI18n = pgTable(
  "menu_group_i18n",
  {
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => menuGroup.productId, { onDelete: "cascade" }),
    locale: localeRef(),
    /** Override; default = product title. */
    label: text("label"),
    /** Override; default = product description (the Tet category page shows it). */
    description: text("description"),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.locale] }),
    nonblankIfSetCheck("menu_group_i18n_label_nonblank", t.label),
    nonblankIfSetCheck("menu_group_i18n_description_nonblank", t.description),
    check("menu_group_i18n_not_empty", sql`${t.label} is not null or ${t.description} is not null`),
  ],
);

/** Link style follows the target: shape → `#hash`, option → path segment. */
export const menuItem = pgTable(
  "menu_item",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => menuGroup.productId, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    shapeId: bigint("shape_id", { mode: "number" }),
    optionId: bigint("option_id", { mode: "number" }),
    isFast: boolean("is_fast").notNull().default(false),
    imageMediaId: bigint("image_media_id", { mode: "number" }).references(() => media.id, { onDelete: "restrict" }),
  },
  (t) => [
    nonNegativeCheck("menu_item_position_nonneg", t.position),
    check("menu_item_one_target", sql`(${t.shapeId} is not null) <> (${t.optionId} is not null)`),
    index("menu_item_product_position_idx").on(t.productId, t.position),
    index("menu_item_shape_idx").on(t.shapeId),
    index("menu_item_option_idx").on(t.optionId),
    index("menu_item_image_media_idx").on(t.imageMediaId),
  ],
);

export const menuItemI18n = pgTable(
  "menu_item_i18n",
  {
    menuItemId: bigint("menu_item_id", { mode: "number" }).notNull().references(() => menuItem.id, { onDelete: "cascade" }),
    locale: localeRef(),
    /** Override; default = shape name / option name. */
    label: text("label").notNull(),
  },
  (t) => [primaryKey({ columns: [t.menuItemId, t.locale] }), nonblankCheck("menu_item_i18n_label_nonblank", t.label)],
);
