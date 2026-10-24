import { bigint, index, integer, pgTable, primaryKey, smallint, text, uuid } from "drizzle-orm/pg-core";
import {
  iconCheck,
  kebabCheck,
  nonblankCheck,
  nonblankIfSetCheck,
  nonNegativeCheck,
  oneOfCheck,
  positiveCheck,
  PUBLICATION_STATUSES,
  versioning,
} from "./columns";
import { localeRef, media } from "./foundations";
import { unit } from "./library";

// Fast Print items (the "In nhanh lấy liền" page) and the products-page showcase gallery.

export const fastPrintItem = pgTable(
  "fast_print_item",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uid: uuid("uid").notNull().unique().defaultRandom(),
    key: text("key").notNull().unique(),
    imageMediaId: bigint("image_media_id", { mode: "number" }).references(() => media.id, { onDelete: "restrict" }),
    icon: text("icon").notNull(),
    turnaroundHours: smallint("turnaround_hours"),
    /** VND; rendered with the unit, e.g. "Chỉ từ 120.000đ/Hộp". No product link: the page renders none. */
    fromPrice: integer("from_price"),
    unitKey: text("unit_key").references(() => unit.key, { onDelete: "restrict" }),
    position: smallint("position").notNull(),
    status: text("status", { enum: PUBLICATION_STATUSES }).notNull().default("published"),
    ...versioning(),
  },
  (t) => [
    kebabCheck("fast_print_item_key_format", t.key),
    iconCheck("fast_print_item_icon_format", t.icon),
    positiveCheck("fast_print_item_turnaround_positive", t.turnaroundHours),
    nonNegativeCheck("fast_print_item_price_nonneg", t.fromPrice),
    nonNegativeCheck("fast_print_item_position_nonneg", t.position),
    oneOfCheck("fast_print_item_status_valid", t.status, PUBLICATION_STATUSES),
    index("fast_print_item_image_media_idx").on(t.imageMediaId),
    index("fast_print_item_unit_idx").on(t.unitKey),
  ],
);

export const fastPrintItemI18n = pgTable(
  "fast_print_item_i18n",
  {
    itemId: bigint("item_id", { mode: "number" }).notNull().references(() => fastPrintItem.id, { onDelete: "cascade" }),
    locale: localeRef(),
    name: text("name").notNull(),
    tag: text("tag"),
    description: text("description"),
  },
  (t) => [
    primaryKey({ columns: [t.itemId, t.locale] }),
    nonblankCheck("fast_print_item_i18n_name_nonblank", t.name),
    nonblankIfSetCheck("fast_print_item_i18n_tag_nonblank", t.tag),
    nonblankIfSetCheck("fast_print_item_i18n_description_nonblank", t.description),
  ],
);

export const SHOWCASE_ASPECTS = ["tall", "square", "wide"] as const;

export const showcaseItem = pgTable(
  "showcase_item",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    uid: uuid("uid").notNull().unique().defaultRandom(),
    key: text("key").notNull().unique(),
    mediaId: bigint("media_id", { mode: "number" }).notNull().references(() => media.id, { onDelete: "restrict" }),
    aspect: text("aspect", { enum: SHOWCASE_ASPECTS }).notNull().default("square"),
    position: smallint("position").notNull(),
    ...versioning(),
  },
  (t) => [
    kebabCheck("showcase_item_key_format", t.key),
    oneOfCheck("showcase_item_aspect_valid", t.aspect, SHOWCASE_ASPECTS),
    nonNegativeCheck("showcase_item_position_nonneg", t.position),
    index("showcase_item_media_idx").on(t.mediaId),
  ],
);

export const showcaseItemI18n = pgTable(
  "showcase_item_i18n",
  {
    itemId: bigint("item_id", { mode: "number" }).notNull().references(() => showcaseItem.id, { onDelete: "cascade" }),
    locale: localeRef(),
    label: text("label").notNull(),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.locale] }), nonblankCheck("showcase_item_i18n_label_nonblank", t.label)],
);
