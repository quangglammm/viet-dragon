import { drizzle } from "drizzle-orm/node-postgres";
import { runSeed, type SeedOutcome } from "@/scripts/seed/run";
import { loadSources, type Sources } from "@/scripts/seed/sources";
import type { Db } from "@/lib/db/types";
import { createScratchDatabase, type ScratchDatabase } from "./db";

export interface SeededDatabase {
  scratch: ScratchDatabase;
  db: Db;
  src: Sources;
  outcome: SeedOutcome;
  /** Rows in a table of the seeded database. */
  count: (table: string) => Promise<number>;
  close: () => Promise<void>;
}

/** A private database, migrated and seeded once from the real site data. For suites that check the result. */
export async function createSeededDatabase(label: string): Promise<SeededDatabase> {
  const scratch = await createScratchDatabase(label);
  try {
    const db = drizzle(scratch.pool);
    const src = loadSources();
    const outcome = await db.transaction((tx) => runSeed(tx, src));
    return {
      scratch,
      db,
      src,
      outcome,
      count: async (table) => Number((await scratch.pool.query(`select count(*)::int n from ${table}`)).rows[0].n),
      close: scratch.drop,
    };
  } catch (error) {
    await scratch.drop().catch(() => undefined);
    throw error;
  }
}
