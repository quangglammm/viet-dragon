import { sql } from "drizzle-orm";
import { bigint, check, index, integer, jsonb, pgTable, primaryKey, smallint, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { app_user } from "../auth-schema";
import { oneOfCheck } from "./columns";

// Live tables hold ONLY the published state. A draft is a whole-entity document (the "aggregate") that refers to
// other records by uid (editable-slug entities) or by immutable key (vocabulary). Publish validates it and applies
// it in one transaction, bumps `version`, writes a revision and deletes the draft (docs/data-model.md §9).

// Relative on purpose: drizzle-kit loads this file outside Next, where `@/` does not resolve.
import { DRAFT_ENTITY_TYPES, type DraftEntityType } from "../../content/entity-types";

export { DRAFT_ENTITY_TYPES };
export type { DraftEntityType };

/** The document format version stored in `snapshot_schema` (lib/content/schemas). */
export const SNAPSHOT_SCHEMA = 2;

export const contentDraft = pgTable(
  "content_draft",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    entityType: text("entity_type", { enum: DRAFT_ENTITY_TYPES }).notNull(),
    /** uid entities: assigned when the draft is created, also for brand-new entities. */
    entityUid: uuid("entity_uid"),
    /** Key entities (vocabulary, namespace, category id). */
    entityKey: text("entity_key"),
    /** Live version the draft started from; NULL = brand-new entity. */
    baseVersion: integer("base_version"),
    /** Lock token for autosave and for "publish exactly what was previewed". */
    draftVersion: integer("draft_version").notNull().default(1),
    snapshotSchema: smallint("snapshot_schema").notNull().default(SNAPSHOT_SCHEMA),
    snapshot: jsonb("snapshot").notNull(),
    note: text("note"),
    createdBy: text("created_by").references(() => app_user.id),
    updatedBy: text("updated_by").references(() => app_user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    oneOfCheck("content_draft_entity_type_valid", t.entityType, DRAFT_ENTITY_TYPES),
    check("content_draft_base_version_positive", sql`${t.baseVersion} >= 1`),
    check("content_draft_draft_version_positive", sql`${t.draftVersion} >= 1`),
    check("content_draft_snapshot_object", sql`jsonb_typeof(${t.snapshot}) = 'object'`),
    check("content_draft_uid_xor_key", sql`(${t.entityUid} is not null) <> (${t.entityKey} is not null)`),
    // A draft filed under X can never carry Y's document (so it can never publish onto Y).
    check("content_draft_snapshot_uid", sql`${t.entityUid} is null or ${t.snapshot}->>'uid' = ${t.entityUid}::text`),
    check("content_draft_snapshot_key", sql`${t.entityKey} is null or ${t.snapshot}->>'key' = ${t.entityKey}`),
    unique("content_draft_type_uid_unique").on(t.entityType, t.entityUid),
    unique("content_draft_type_key_unique").on(t.entityType, t.entityKey),
    index("content_draft_updated_at_idx").on(t.updatedAt.desc()),
  ],
);

export const DRAFT_REFERENCE_TYPES = ["material", "trait", "unit", "spec_item", "media"] as const;
export type DraftReferenceType = (typeof DRAFT_REFERENCE_TYPES)[number];

/**
 * Exact "used by": which library records / media an open draft refers to (the foreign keys cannot see drafts).
 * Written on every autosave.
 */
export const draftReference = pgTable(
  "draft_reference",
  {
    draftId: bigint("draft_id", { mode: "number" }).notNull().references(() => contentDraft.id, { onDelete: "cascade" }),
    refType: text("ref_type", { enum: DRAFT_REFERENCE_TYPES }).notNull(),
    refKey: text("ref_key").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.draftId, t.refType, t.refKey] }),
    oneOfCheck("draft_reference_ref_type_valid", t.refType, DRAFT_REFERENCE_TYPES),
    index("draft_reference_ref_idx").on(t.refType, t.refKey),
  ],
);

export const REVISION_ACTIONS = ["import", "create", "update", "archive", "restore", "delete"] as const;
export type RevisionAction = (typeof REVISION_ACTIONS)[number];

/** One row per publish; restore = open a revision as a new draft. TRUNCATE is refused (trigger). */
export const contentRevision = pgTable(
  "content_revision",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    entityType: text("entity_type").notNull(),
    entityUid: uuid("entity_uid"),
    entityKey: text("entity_key"),
    version: integer("version").notNull(),
    action: text("action", { enum: REVISION_ACTIONS }).notNull().default("update"),
    snapshotSchema: smallint("snapshot_schema").notNull().default(SNAPSHOT_SCHEMA),
    snapshot: jsonb("snapshot").notNull(),
    comment: text("comment"),
    author: text("author").references(() => app_user.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    oneOfCheck("content_revision_action_valid", t.action, REVISION_ACTIONS),
    check("content_revision_uid_xor_key", sql`(${t.entityUid} is not null) <> (${t.entityKey} is not null)`),
    check("content_revision_snapshot_uid", sql`${t.entityUid} is null or ${t.snapshot}->>'uid' = ${t.entityUid}::text`),
    check("content_revision_snapshot_key", sql`${t.entityKey} is null or ${t.snapshot}->>'key' = ${t.entityKey}`),
    unique("content_revision_type_uid_version_unique").on(t.entityType, t.entityUid, t.version),
    unique("content_revision_type_key_version_unique").on(t.entityType, t.entityKey, t.version),
    index("content_revision_uid_idx").on(t.entityType, t.entityUid, t.version.desc()),
    index("content_revision_key_idx").on(t.entityType, t.entityKey, t.version.desc()),
  ],
);

/** The original source records, verbatim, as imported — so authored detail the model normalizes is never lost. */
export const legacyImport = pgTable(
  "legacy_import",
  {
    entityType: text("entity_type").notNull(),
    entityKey: text("entity_key").notNull(),
    payload: jsonb("payload").notNull(),
    importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.entityType, t.entityKey] })],
);
