import { and, eq, sql, type SQL } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DraftReferenceType } from "@/lib/db/content/drafts";
import type { DbExecutor } from "@/lib/db/types";

// "Used by" for library records. The foreign keys protect LIVE rows, but cannot see an open draft that points at a record,
// so a delete must ask here first: live rows (counted from the referencing tables) plus open drafts (`draft_reference`).

export const USED_BY_TYPES = ["material", "unit", "trait", "spec_item", "post_category"] as const;
export type UsedByType = (typeof USED_BY_TYPES)[number];

interface Usage {
  /** The referenced value for a key: the key itself, or a subquery for the id when the table is referenced by id. */
  referenced: (key: string) => SQL;
  /** Every column in the schema that references the record. A test compares this list with the foreign keys in the database. */
  columns: readonly { table: string; column: string }[];
  /** Open drafts that point at the record. Default: the `draft_reference` rows (autosave writes them for library records and media). */
  drafts?: (x: DbExecutor, key: string) => Promise<number>;
}

export const USAGES: Record<UsedByType, Usage> = {
  material: {
    referenced: (key) => sql`(select id from material where slug = ${key})`,
    columns: [{ table: "option", column: "material_id" }],
  },
  unit: {
    referenced: (key) => sql`${key}`,
    columns: [
      { table: "option", column: "unit_key" },
      { table: "fast_print_item", column: "unit_key" },
    ],
  },
  trait: {
    referenced: (key) => sql`${key}`,
    columns: [{ table: "option_bullet", column: "trait_key" }],
  },
  spec_item: {
    referenced: (key) => sql`(select id from spec_item where kind || '/' || key = ${key})`,
    columns: [{ table: "product_spec", column: "spec_item_id" }],
  },
  post_category: {
    referenced: (key) => sql`${key}`,
    columns: [{ table: "post", column: "category_key" }],
    // `draft_reference` has no row type for blog categories, so the open post drafts are read from their documents.
    drafts: (x, key) => x.$count(schema.contentDraft, and(eq(schema.contentDraft.entityType, "post"), sql`${schema.contentDraft.snapshot}->>'category' = ${key}`)),
  },
};

export interface UsedBy {
  /** Rows in the live tables that point at the record. */
  live: number;
  /** Open drafts that point at it. */
  drafts: number;
}

export async function usedBy(x: DbExecutor, type: UsedByType, key: string): Promise<UsedBy> {
  const { referenced, columns, drafts: countDrafts } = USAGES[type];
  let live = 0;
  for (const { table, column } of columns) {
    const result = await x.execute<{ n: number }>(sql`select count(*)::int as n from ${sql.identifier(table)} where ${sql.identifier(column)} = ${referenced(key)}`);
    live += result.rows[0].n;
  }
  const drafts = countDrafts
    ? await countDrafts(x, key)
    : await x.$count(schema.draftReference, and(eq(schema.draftReference.refType, type as DraftReferenceType), eq(schema.draftReference.refKey, key)));
  return { live, drafts };
}
