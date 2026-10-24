import { sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Db, Tx } from "@/lib/db/types";
import { runSeed, type SeedOutcome } from "./run";
import type { Sources } from "./sources";

// Seeds an EMPTY content database, once. Editors change the content afterwards, so a second run must never merge
// or overwrite: it finds the content tables non-empty and does nothing. Re-seeding means resetting the database.

/** Arbitrary constant: serializes concurrent seed runs (two `docker compose run` at once) on one advisory lock. */
const SEED_LOCK_KEY = 7_262_024;

export type SeedResult<T> = { status: "already-seeded" } | { status: "seeded" | "dry-run"; outcome: SeedOutcome; inspection: T };

class DryRun extends Error {
  constructor(
    readonly outcome: SeedOutcome,
    readonly inspection: unknown,
  ) {
    super("dry run: rolled back");
  }
}

async function hasContent(tx: Tx): Promise<boolean> {
  for (const table of [schema.category, schema.product, schema.material, schema.legacyImport]) {
    const [row] = await tx.select({ one: sql<number>`1` }).from(table).limit(1);
    if (row) return true;
  }
  return false;
}

export interface SeedOptions<T> {
  /** Run everything, then roll back. */
  dryRun?: boolean;
  /** Reads the freshly written rows (inside the transaction, so a dry run can still be inspected) — e.g. for the report. */
  inspect: (tx: Tx, outcome: SeedOutcome) => Promise<T>;
}

export async function seedDatabase<T>(db: Db, src: Sources, options: SeedOptions<T>): Promise<SeedResult<T>> {
  try {
    return await db.transaction(async (tx): Promise<SeedResult<T>> => {
      await tx.execute(sql`select pg_advisory_xact_lock(${SEED_LOCK_KEY})`);
      if (await hasContent(tx)) return { status: "already-seeded" };
      const outcome = await runSeed(tx, src);
      const inspection = await options.inspect(tx, outcome);
      if (options.dryRun) throw new DryRun(outcome, inspection);
      return { status: "seeded", outcome, inspection };
    });
  } catch (error) {
    if (error instanceof DryRun) return { status: "dry-run", outcome: error.outcome, inspection: error.inspection as T };
    throw error;
  }
}
