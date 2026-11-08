import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getDatabaseEnv } from "@/lib/env";
import { getLogger } from "@/lib/logger";

const log = getLogger("db");

const POOL_MAX_CONNECTIONS = 10;
const CONNECT_TIMEOUT_MS = 3_000;
const QUERY_TIMEOUT_MS = 5_000;

// Stashed on globalThis so `next dev` hot reloads reuse one pool instead of leaking a new one per edit.
const globalForDb = globalThis as typeof globalThis & {
  vdPool?: Pool;
  vdDb?: NodePgDatabase;
};

function createPool(): Pool {
  const pool = new Pool({
    connectionString: getDatabaseEnv().DATABASE_URL,
    max: POOL_MAX_CONNECTIONS,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    query_timeout: QUERY_TIMEOUT_MS,
  });
  // An idle client dropped by the server emits "error"; unhandled, it would crash the process.
  pool.on("error", (error) => log.error({ err: error }, "idle client error"));
  return pool;
}

/** Lazy on purpose: importing this module (e.g. during `next build`) must not read env or open a connection. */
export function getPool(): Pool {
  globalForDb.vdPool ??= createPool();
  return globalForDb.vdPool;
}

export function getDb(): NodePgDatabase {
  globalForDb.vdDb ??= drizzle(getPool());
  return globalForDb.vdDb;
}

export async function pingDatabase(): Promise<boolean> {
  try {
    await getPool().query("select 1");
    return true;
  } catch (error) {
    log.warn({ err: error }, "ping failed");
    return false;
  }
}
