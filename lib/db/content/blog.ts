import { sql } from "drizzle-orm";
import { bigint, boolean, date, index, integer, pgTable, primaryKey, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { app_user } from "../auth-schema";
import {
  kebabCheck,
  nonblankCheck,
  nonblankIfSetCheck,
  oneOfCheck,
  positiveCheck,
  PUBLICATION_STATUSES,
  versioning,
} from "./columns";
import { localeRef, media } from "./foundations";
import { ogImageColumns, ogImageConstraints, seoTextChecks, seoTextColumns } from "./seo";

export const postCategory = pgTable(
  "post_category",
  { key: text("key").primaryKey(), ...versioning() },
  (t) => [kebabCheck("post_category_key_format", t.key)],
);

export const postCategoryI18n = pgTable(
  "post_category_i18n",
  {
    categoryKey: text("category_key").notNull().references(() => postCategory.key, { onDelete: "cascade" }),
    locale: localeRef(),
    label: text("label").notNull(),
  },
  (t) => [primaryKey({ columns: [t.categoryKey, t.locale] }), nonblankCheck("post_category_i18n_label_nonblank", t.label)],
);

export const CONTENT_FORMATS = ["plain", "markdown"] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export const post = pgTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uid: uuid("uid").notNull().unique().defaultRandom(),
    categoryKey: text("category_key").notNull().references(() => postCategory.key, { onDelete: "restrict" }),
    publishedOn: date("published_on", { mode: "string" }).notNull(),
    readTimeMin: smallint("read_time_min"),
    coverMediaId: bigint("cover_media_id", { mode: "number" }).references(() => media.id, { onDelete: "restrict" }),
    contentFormat: text("content_format", { enum: CONTENT_FORMATS }).notNull().default("plain"),
    status: text("status", { enum: PUBLICATION_STATUSES }).notNull().default("published"),
    version: integer("version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").references(() => app_user.id),
    ...ogImageColumns(),
  },
  (t) => [
    positiveCheck("post_read_time_positive", t.readTimeMin),
    oneOfCheck("post_content_format_valid", t.contentFormat, CONTENT_FORMATS),
    oneOfCheck("post_status_valid", t.status, PUBLICATION_STATUSES),
    index("post_published_on_idx").on(t.publishedOn.desc()),
    index("post_category_idx").on(t.categoryKey),
    index("post_cover_media_idx").on(t.coverMediaId),
    ...ogImageConstraints("post", t),
  ],
);

/** Owns the blog slug namespace per language: the canonical URL and every old one. One canonical slug per post in every language. */
export const postSlug = pgTable(
  "post_slug",
  {
    locale: localeRef(),
    slug: text("slug").notNull(),
    postId: bigint("post_id", { mode: "number" }).notNull().references(() => post.id, { onDelete: "cascade" }),
    isCanonical: boolean("is_canonical").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.locale, t.slug] }),
    kebabCheck("post_slug_slug_format", t.slug),
    uniqueIndex("post_slug_one_canonical").on(t.postId, t.locale).where(sql`${t.isCanonical}`),
    index("post_slug_post_idx").on(t.postId),
  ],
);

export const postI18n = pgTable(
  "post_i18n",
  {
    postId: bigint("post_id", { mode: "number" }).notNull().references(() => post.id, { onDelete: "cascade" }),
    locale: localeRef(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    ...seoTextColumns(),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.locale] }),
    nonblankCheck("post_i18n_title_nonblank", t.title),
    nonblankIfSetCheck("post_i18n_excerpt_nonblank", t.excerpt),
    nonblankCheck("post_i18n_content_nonblank", t.content),
    ...seoTextChecks("post_i18n", t),
  ],
);
