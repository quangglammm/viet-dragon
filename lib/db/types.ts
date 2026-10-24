import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// Types only, so importing them never reads env or opens a connection (lib/db/index.ts is lazy for the same reason).

export type Db = NodePgDatabase;
/** The handle a `db.transaction(async (tx) => …)` callback receives. */
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
/** Code that only reads and writes rows takes either: the pool handle, or the transaction it runs inside. */
export type DbExecutor = Db | Tx;
