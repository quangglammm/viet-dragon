import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { inject } from "vitest";
import { migrateDatabase, withDatabaseName } from "../migrate";

export type ScratchDatabase = { pool: Pool; url: string; drop: () => Promise<void> };

/**
 * A private, freshly migrated database for suites that need real COMMITs or write to tables that cannot be
 * cleaned up (TRUNCATE is refused on the guarded content tables, audit_log is append-only). Created on the same
 * server as the run's throwaway database and dropped by `drop()` — call it in `afterAll`.
 */
export async function createScratchDatabase(label: string): Promise<ScratchDatabase> {
  const runUrl = inject("testDatabaseUrl");
  const name = `vd_scratch_${randomBytes(3).toString("hex")}_${label.replace(/\W/g, "_")}`.slice(0, 60);
  const admin = new Pool({ connectionString: runUrl, max: 1 });
  try {
    await admin.query(`create database ${name}`);
  } catch (error) {
    await admin.end().catch(() => undefined);
    throw new Error(`Cannot create the scratch database ${name}: ${String(error)}`);
  }
  const url = withDatabaseName(runUrl, name);
  let pool: Pool | undefined;
  try {
    await migrateDatabase(url);
    pool = new Pool({ connectionString: url, max: 4 });
  } catch (error) {
    await admin.query(`drop database ${name} with (force)`).catch(() => undefined);
    await admin.end().catch(() => undefined);
    throw error;
  }
  const ready = pool;
  return {
    pool: ready,
    url,
    drop: async () => {
      await ready.end();
      await admin.query(`drop database ${name} with (force)`);
      await admin.end();
    },
  };
}
