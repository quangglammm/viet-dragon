import { bigint, boolean, pgTable, primaryKey, text, unique } from "drizzle-orm/pg-core";
import { iconCheck, iconIfSetCheck, kebabCheck, nonblankCheck, nonblankIfSetCheck, oneOfCheck, versioning } from "./columns";
import { localeRef } from "./foundations";

// Library entities: shared across products, identified by an IMMUTABLE key (trigger in 0004_content_integrity).
// Renaming the visible text is free; a mistaken key is fixed by creating a new record and moving usage over.

export const unit = pgTable(
  "unit",
  { key: text("key").primaryKey(), ...versioning() },
  (t) => [kebabCheck("unit_key_format", t.key)],
);

export const unitI18n = pgTable(
  "unit_i18n",
  {
    unitKey: text("unit_key").notNull().references(() => unit.key, { onDelete: "cascade" }),
    locale: localeRef(),
    label: text("label").notNull(),
  },
  (t) => [primaryKey({ columns: [t.unitKey, t.locale] }), nonblankCheck("unit_i18n_label_nonblank", t.label)],
);

export const trait = pgTable(
  "trait",
  { key: text("key").primaryKey(), icon: text("icon").notNull(), ...versioning() },
  (t) => [kebabCheck("trait_key_format", t.key), iconCheck("trait_icon_format", t.icon)],
);

export const traitI18n = pgTable(
  "trait_i18n",
  {
    traitKey: text("trait_key").notNull().references(() => trait.key, { onDelete: "cascade" }),
    locale: localeRef(),
    label: text("label").notNull(),
    description: text("description"),
  },
  (t) => [
    primaryKey({ columns: [t.traitKey, t.locale] }),
    nonblankCheck("trait_i18n_label_nonblank", t.label),
    nonblankIfSetCheck("trait_i18n_description_nonblank", t.description),
  ],
);

/** The "stock": Giấy loại C, PP film, … `slug` is the immutable key. */
export const material = pgTable(
  "material",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"),
    ...versioning(),
  },
  (t) => [kebabCheck("material_slug_format", t.slug), iconIfSetCheck("material_icon_format", t.icon)],
);

export const materialI18n = pgTable(
  "material_i18n",
  {
    materialId: bigint("material_id", { mode: "number" }).notNull().references(() => material.id, { onDelete: "cascade" }),
    locale: localeRef(),
    name: text("name").notNull(),
  },
  (t) => [primaryKey({ columns: [t.materialId, t.locale] }), nonblankCheck("material_i18n_name_nonblank", t.name)],
);

export const SPEC_KINDS = ["technique", "finishing", "material_hint"] as const;
export type SpecKind = (typeof SPEC_KINDS)[number];

/** One vocabulary for the three spec lists on a product card. `(kind, key)` is the immutable identity. */
export const specItem = pgTable(
  "spec_item",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    kind: text("kind", { enum: SPEC_KINDS }).notNull(),
    key: text("key").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    ...versioning(),
  },
  (t) => [oneOfCheck("spec_item_kind_valid", t.kind, SPEC_KINDS), kebabCheck("spec_item_key_format", t.key), unique("spec_item_kind_key_unique").on(t.kind, t.key)],
);

export const specItemI18n = pgTable(
  "spec_item_i18n",
  {
    specItemId: bigint("spec_item_id", { mode: "number" }).notNull().references(() => specItem.id, { onDelete: "cascade" }),
    locale: localeRef(),
    label: text("label").notNull(),
  },
  (t) => [primaryKey({ columns: [t.specItemId, t.locale] }), nonblankCheck("spec_item_i18n_label_nonblank", t.label)],
);
