import { sql } from "drizzle-orm";
import { check, integer, text, timestamp, type AnyPgColumn } from "drizzle-orm/pg-core";
import { app_user } from "../auth-schema";

// Shared column builders and CHECK helpers for the content tables. Relative imports only: drizzle-kit
// loads lib/db/schema.ts outside Next, where `@/` does not resolve. `nonblank()` is a SQL function created by
// the 0002_content_helpers migration (the Unicode-aware blank test); the CHECKs below call it.

const KEBAB_PATTERN = sql.raw("'^[a-z0-9]+(-[a-z0-9]+)*$'");
const ICON_PATTERN = sql.raw("'^[A-Za-z0-9]+$'");

/** `a-b-c` slugs and immutable keys. */
export const kebabCheck = (name: string, column: AnyPgColumn) => check(name, sql`${column} ~ ${KEBAB_PATTERN}`);

/** Icon registry names (`lib/icons.ts`): letters and digits only. */
export const iconCheck = (name: string, column: AnyPgColumn) => check(name, sql`${column} ~ ${ICON_PATTERN}`);
export const iconIfSetCheck = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} is null or ${column} ~ ${ICON_PATTERN}`);

/** Text that must not be empty or whitespace-only in any script (tab, NBSP, U+3000, zero-width…). */
export const nonblankCheck = (name: string, column: AnyPgColumn) => check(name, sql`nonblank(${column})`);
export const nonblankIfSetCheck = (name: string, column: AnyPgColumn) =>
  check(name, sql`${column} is null or nonblank(${column})`);

export const nonNegativeCheck = (name: string, column: AnyPgColumn) => check(name, sql`${column} >= 0`);
export const positiveCheck = (name: string, column: AnyPgColumn) => check(name, sql`${column} > 0`);

/** `column in ('a','b')`; the values are code constants, never user input. */
export const oneOfCheck = (name: string, column: AnyPgColumn, values: readonly string[]) =>
  check(name, sql`${column} in (${sql.raw(values.map((value) => `'${value}'`).join(","))})`);

/** Optimistic-lock token plus authorship for the editable library/aggregate rows. Users are deactivated, never deleted → NO ACTION. */
export const versioning = () => ({
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by").references(() => app_user.id),
});

export const PUBLICATION_STATUSES = ["published", "archived"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
