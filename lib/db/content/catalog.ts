import { sql } from "drizzle-orm";
import { bigint, boolean, check, index, integer, pgTable, primaryKey, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { app_user } from "../auth-schema";
import {
  iconCheck,
  kebabCheck,
  nonblankCheck,
  nonblankIfSetCheck,
  nonNegativeCheck,
  oneOfCheck,
  PUBLICATION_STATUSES,
} from "./columns";
import { localeRef, media } from "./foundations";
import { ogImageColumns, ogImageConstraints, seoTextChecks, seoTextColumns } from "./seo";

// Categories and products. Shapes, options, sizes and specs live in shapes-options.ts / sizes-specs.ts.

/** `id` is an immutable key and never `fast-print` (a static route). `menu_version` versions the category's mega-menu aggregate. */
export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    icon: text("icon").notNull(),
    coverMediaId: bigint("cover_media_id", { mode: "number" }).references(() => media.id, { onDelete: "restrict" }),
    position: smallint("position").notNull(),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    menuVersion: integer("menu_version").notNull().default(1),
    updatedBy: text("updated_by").references(() => app_user.id),
    ...ogImageColumns(),
  },
  (t) => [
    kebabCheck("category_id_format", t.id),
    check("category_id_not_fast_print", sql`${t.id} <> 'fast-print'`),
    iconCheck("category_icon_format", t.icon),
    nonNegativeCheck("category_position_nonneg", t.position),
    index("category_cover_media_idx").on(t.coverMediaId),
    ...ogImageConstraints("category", t),
  ],
);

export const categoryI18n = pgTable(
  "category_i18n",
  {
    categoryId: text("category_id").notNull().references(() => category.id, { onDelete: "cascade" }),
    locale: localeRef(),
    name: text("name").notNull(),
    description: text("description"),
    ...seoTextColumns(),
  },
  (t) => [
    primaryKey({ columns: [t.categoryId, t.locale] }),
    nonblankCheck("category_i18n_name_nonblank", t.name),
    nonblankIfSetCheck("category_i18n_description_nonblank", t.description),
    ...seoTextChecks("category_i18n", t),
  ],
);

/** Aggregate root of the catalog. `uid` is the immutable identity; the slug lives in `product_slug`. */
export const product = pgTable(
  "product",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uid: uuid("uid").notNull().unique().defaultRandom(),
    categoryId: text("category_id").notNull().references(() => category.id, { onDelete: "restrict" }),
    coverMediaId: bigint("cover_media_id", { mode: "number" }).references(() => media.id, { onDelete: "restrict" }),
    position: smallint("position").notNull(),
    status: text("status", { enum: PUBLICATION_STATUSES }).notNull().default("published"),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").references(() => app_user.id),
    ...ogImageColumns(),
  },
  (t) => [
    nonNegativeCheck("product_position_nonneg", t.position),
    oneOfCheck("product_status_valid", t.status, PUBLICATION_STATUSES),
    index("product_category_position_idx").on(t.categoryId, t.position),
    index("product_cover_media_idx").on(t.coverMediaId),
    ...ogImageConstraints("product", t),
  ],
);

export const productI18n = pgTable(
  "product_i18n",
  {
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => product.id, { onDelete: "cascade" }),
    locale: localeRef(),
    title: text("title").notNull(),
    description: text("description"),
    ...seoTextColumns(),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.locale] }),
    nonblankCheck("product_i18n_title_nonblank", t.title),
    nonblankIfSetCheck("product_i18n_description_nonblank", t.description),
    ...seoTextChecks("product_i18n", t),
  ],
);

/**
 * Owns the (category, slug) namespace: the canonical URL AND every old one. A slug can never be both a live
 * product and an alias. A product always has one canonical slug in its own category (commit-time trigger), and
 * `product_id` is frozen (trigger) so that check cannot be sidestepped.
 */
export const productSlug = pgTable(
  "product_slug",
  {
    categoryId: text("category_id").notNull().references(() => category.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    productId: bigint("product_id", { mode: "number" }).notNull().references(() => product.id, { onDelete: "cascade" }),
    isCanonical: boolean("is_canonical").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.categoryId, t.slug] }),
    kebabCheck("product_slug_slug_format", t.slug),
    uniqueIndex("product_slug_one_canonical").on(t.productId).where(sql`${t.isCanonical}`),
    index("product_slug_product_idx").on(t.productId),
  ],
);
