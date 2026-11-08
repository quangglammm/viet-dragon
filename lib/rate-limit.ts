import { createHash, randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { requestMeta } from "@/lib/auth/audit";
import type { DbExecutor } from "@/lib/db/types";

// A fixed-window limiter for the app's own public endpoints (the consult form, uploads, CSP reports), in the `rate_limit` table Better Auth already
// keeps in Postgres — so a restart does not forget an abuser and a second instance could not be used to get around it.
//
// One statement per check: the count of the current window is incremented (or the window restarted) by an `INSERT … ON CONFLICT DO UPDATE`, so two
// requests at the same moment are counted one after the other, never both as «the first». The window's start is kept in `last_request`; the time is
// the database's, not the app's. Keys all begin `vd:` — Better Auth's own keys look like `<ip>|<path>` and never meet them.

export interface Limit {
  /** What is being limited: `consult-ip`, `upload-user`… */
  purpose: string;
  /** Who: an address, an account id, a hash. Anything; it only has to be the same every time for the same subject. */
  subject: string;
  windowSeconds: number;
  max: number;
}

export interface LimitResult {
  allowed: boolean;
  /** Requests counted in the current window, this one included. */
  count: number;
  /** When the window ends, rounded up — what `Retry-After` says. */
  retryAfterSeconds: number;
}

const KEY_PREFIX = "vd:";
const MILLISECONDS = 1000;
const MAX_SUBJECT_LENGTH = 100;
const PRUNE_EVERY_MS = 10 * 60 * MILLISECONDS;
const PRUNE_AFTER_MS = 24 * 60 * 60 * MILLISECONDS;

export const limitKey = (purpose: string, subject: string): string => `${KEY_PREFIX}${purpose}:${subject.slice(0, MAX_SUBJECT_LENGTH)}`;

/** A subject that should not sit in the table in the clear (a phone number): a short fixed-length digest. */
export const digest = (value: string): string => createHash("sha256").update(value).digest("hex").slice(0, 24);

/** The client's address as Caddy reports it (`x-real-ip`; Caddy overwrites it, the app publishes no port). Without one — plain dev — everybody is one client. */
export const clientAddress = (headers: Headers): string => requestMeta(headers).ip ?? "unknown";

/** Seconds until a window that started at `start` is over (at least 1). */
export function retryAfterSeconds(start: number, windowMs: number, now: number): number {
  return Math.max(1, Math.ceil((start + windowMs - now) / MILLISECONDS));
}

/** Counts one request against `limit` and says whether it may go ahead. */
export async function consumeLimit(db: DbExecutor, { purpose, subject, windowSeconds, max }: Limit): Promise<LimitResult> {
  const windowMs = windowSeconds * MILLISECONDS;
  const result = await db.execute<{ count: number; last_request: string; now: string }>(sql`
    with clock as (select (extract(epoch from clock_timestamp()) * 1000)::bigint as now)
    insert into rate_limit (id, key, count, last_request)
    select ${randomUUID()}, ${limitKey(purpose, subject)}, 1, clock.now from clock
    on conflict (key) do update set
      count = case when rate_limit.last_request <= (select now from clock) - ${windowMs}::bigint then 1 else rate_limit.count + 1 end,
      last_request = case when rate_limit.last_request <= (select now from clock) - ${windowMs}::bigint then (select now from clock) else rate_limit.last_request end
    returning count, last_request, (select now from clock) as now`);
  const row = result.rows[0];
  const count = Number(row.count);
  return { allowed: count <= max, count, retryAfterSeconds: retryAfterSeconds(Number(row.last_request), windowMs, Number(row.now)) };
}

let lastPrune = 0;

/** Drops the expired counters of this module's keys, at most once in a while per process: cheap housekeeping that keeps the table from growing. */
export async function pruneLimits(db: DbExecutor, now = Date.now()): Promise<void> {
  if (now - lastPrune < PRUNE_EVERY_MS) return;
  lastPrune = now;
  await db.execute(sql`delete from rate_limit where key like ${`${KEY_PREFIX}%`} and last_request < (extract(epoch from clock_timestamp()) * 1000)::bigint - ${PRUNE_AFTER_MS}::bigint`);
}

/** The answer for a refused request: 429, `Retry-After`, and the app's usual error shape. */
export function tooManyRequests(result: LimitResult, message: string): Response {
  return Response.json({ error: message, code: "RATE_LIMITED" }, { status: 429, headers: { "retry-after": String(result.retryAfterSeconds), "cache-control": "no-store" } });
}
