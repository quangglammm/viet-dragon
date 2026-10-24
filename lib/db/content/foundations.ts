import { sql } from "drizzle-orm";
import { bigint, boolean, check, integer, pgTable, primaryKey, smallint, text, timestamp, unique, uniqueIndex } from "drizzle-orm/pg-core";
import { app_user } from "../auth-schema";
import { nonblankCheck, nonNegativeCheck, oneOfCheck, positiveCheck } from "./columns";

export const MEDIA_SOURCES = ["static", "upload"] as const;
export const MEDIA_BACKENDS = ["local", "s3"] as const;
export const MEDIA_KINDS = ["image", "video"] as const;

export const locale = pgTable(
  "locale",
  {
    code: text("code").primaryKey(),
    isDefault: boolean("is_default").notNull().default(false),
    position: smallint("position").notNull(),
  },
  (t) => [
    check("locale_code_format", sql`${t.code} ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'`),
    nonNegativeCheck("locale_position_nonneg", t.position),
    uniqueIndex("locale_single_default").on(sql`(true)`).where(sql`${t.isDefault}`),
  ],
);

/** The `locale` column every `*_i18n` table carries. */
export const localeRef = () => text("locale").notNull().references(() => locale.code);

export const media = pgTable(
  "media",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    source: text("source", { enum: MEDIA_SOURCES }).notNull(),
    backend: text("backend", { enum: MEDIA_BACKENDS }).notNull().default("local"),
    // Immutable (trigger): the file's identity on disk and in documents.
    storageKey: text("storage_key").notNull().unique(),
    kind: text("kind", { enum: MEDIA_KINDS }).notNull(),
    mime: text("mime").notNull(),
    width: integer("width"),
    height: integer("height"),
    bytes: bigint("bytes", { mode: "number" }).notNull(),
    sha256: text("sha256"),
    createdBy: text("created_by").references(() => app_user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    oneOfCheck("media_source_valid", t.source, MEDIA_SOURCES),
    oneOfCheck("media_backend_valid", t.backend, MEDIA_BACKENDS),
    oneOfCheck("media_kind_valid", t.kind, MEDIA_KINDS),
    nonblankCheck("media_storage_key_nonblank", t.storageKey),
    positiveCheck("media_width_positive", t.width),
    positiveCheck("media_height_positive", t.height),
    nonNegativeCheck("media_bytes_nonneg", t.bytes),
    // Target of the "images only" composite foreign keys (a photo slot must not point at a video).
    unique("media_id_kind_unique").on(t.id, t.kind),
  ],
);

export const mediaI18n = pgTable(
  "media_i18n",
  {
    mediaId: bigint("media_id", { mode: "number" }).notNull().references(() => media.id, { onDelete: "cascade" }),
    locale: localeRef(),
    alt: text("alt").notNull(),
  },
  (t) => [primaryKey({ columns: [t.mediaId, t.locale] }), nonblankCheck("media_i18n_alt_nonblank", t.alt)],
);
