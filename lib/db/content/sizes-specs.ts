import { sql } from "drizzle-orm";
import { bigint, check, foreignKey, index, integer, pgTable, primaryKey, smallint, text, unique } from "drizzle-orm/pg-core";
import { nonblankCheck, nonblankIfSetCheck, nonNegativeCheck, oneOfCheck, positiveCheck } from "./columns";
import { localeRef } from "./foundations";
import { specItem } from "./library";
import { product } from "./catalog";
import { shape } from "./shapes-options";

// Numeric sizes and ordered spec lists, scoped to a product or (overriding it) one of its shapes.

export const SIZE_TIERS = ["large", "medium", "small"] as const;
export type SizeTier = (typeof SIZE_TIERS)[number];

export const sizeOption = pgTable(
  "size_option",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => product.id, { onDelete: "cascade" }),
    shapeId: bigint("shape_id", { mode: "number" }),
    tier: text("tier", { enum: SIZE_TIERS }).notNull(),
    widthMm: integer("width_mm"),
    heightMm: integer("height_mm"),
    depthMm: integer("depth_mm"),
    /** Non-metric sizes: "Size L - XL". Exactly one of (width, height) or this. */
    dimsText: text("dims_text"),
  },
  (t) => [
    oneOfCheck("size_option_tier_valid", t.tier, SIZE_TIERS),
    positiveCheck("size_option_width_positive", t.widthMm),
    positiveCheck("size_option_height_positive", t.heightMm),
    positiveCheck("size_option_depth_positive", t.depthMm),
    nonblankIfSetCheck("size_option_dims_text_nonblank", t.dimsText),
    check("size_option_numeric_xor_text", sql`(${t.widthMm} is not null and ${t.heightMm} is not null) <> (${t.dimsText} is not null)`),
    check("size_option_depth_needs_dims", sql`${t.depthMm} is null or (${t.widthMm} is not null and ${t.heightMm} is not null)`),
    foreignKey({ name: "size_option_shape_fk", columns: [t.shapeId, t.productId], foreignColumns: [shape.id, shape.productId] }).onDelete("cascade"),
    unique("size_option_scope_tier_unique").on(t.productId, t.shapeId, t.tier).nullsNotDistinct(),
    index("size_option_product_shape_idx").on(t.productId, t.shapeId),
  ],
);

export const sizeOptionI18n = pgTable(
  "size_option_i18n",
  {
    sizeOptionId: bigint("size_option_id", { mode: "number" }).notNull().references(() => sizeOption.id, { onDelete: "cascade" }),
    locale: localeRef(),
    note: text("note").notNull(),
  },
  (t) => [primaryKey({ columns: [t.sizeOptionId, t.locale] }), nonblankCheck("size_option_i18n_note_nonblank", t.note)],
);

export const productSpec = pgTable(
  "product_spec",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => product.id, { onDelete: "cascade" }),
    shapeId: bigint("shape_id", { mode: "number" }),
    specItemId: bigint("spec_item_id", { mode: "number" }).notNull().references(() => specItem.id, { onDelete: "restrict" }),
    position: smallint("position").notNull(),
  },
  (t) => [
    nonNegativeCheck("product_spec_position_nonneg", t.position),
    foreignKey({ name: "product_spec_shape_fk", columns: [t.shapeId, t.productId], foreignColumns: [shape.id, shape.productId] }).onDelete("cascade"),
    unique("product_spec_scope_item_unique").on(t.productId, t.shapeId, t.specItemId).nullsNotDistinct(),
    index("product_spec_product_shape_idx").on(t.productId, t.shapeId),
    index("product_spec_item_idx").on(t.specItemId),
  ],
);
