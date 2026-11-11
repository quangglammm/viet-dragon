import { createHash } from "node:crypto";

// An in-memory fixed-window limiter for the app's public endpoints (the consult form, CSP reports).
// Fully decoupled from PostgreSQL / database so the application can run in any serverless or standalone Node.js environment.

export interface Limit {
  /** What is being limited: `consult-ip`, `consult-phone`… */
  purpose: string;
  /** Who: an address, a phone digest, or string identifier. */
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

interface RateRecord {
  count: number;
  lastRequest: number; // timestamp in ms
}

const memoryStore = new Map<string, RateRecord>();

export const limitKey = (purpose: string, subject: string): string =>
  `${KEY_PREFIX}${purpose}:${subject.slice(0, MAX_SUBJECT_LENGTH)}`;

/** A subject that should not sit in memory in the clear (a phone number): a short fixed-length digest. */
export const digest = (value: string): string =>
  createHash("sha256").update(value).digest("hex").slice(0, 24);

/**
 * Extract the client's IP from headers. Supports x-real-ip (Caddy / reverse proxy) and x-forwarded-for.
 */
export function clientAddress(headers: Headers): string {
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

/** Seconds until a window that started at `start` is over (at least 1). */
export function retryAfterSeconds(start: number, windowMs: number, now: number): number {
  return Math.max(1, Math.ceil((start + windowMs - now) / MILLISECONDS));
}

/**
 * Counts one request against `limit` in memory and returns whether it is allowed.
 * `_db` is optional and ignored, kept for backwards compatibility.
 */
export async function consumeLimit(
  _db: unknown,
  { purpose, subject, windowSeconds, max }: Limit
): Promise<LimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * MILLISECONDS;
  const key = limitKey(purpose, subject);

  let record = memoryStore.get(key);
  if (!record || now - record.lastRequest > windowMs) {
    record = { count: 1, lastRequest: now };
    memoryStore.set(key, record);
    return { allowed: true, count: 1, retryAfterSeconds: windowSeconds };
  }

  record.count += 1;
  const allowed = record.count <= max;
  const retryAfter = retryAfterSeconds(record.lastRequest, windowMs, now);

  return { allowed, count: record.count, retryAfterSeconds: retryAfter };
}

let lastPrune = 0;

/** Drops expired counters from memory. */
export async function pruneLimits(_db?: unknown, now = Date.now()): Promise<void> {
  if (now - lastPrune < PRUNE_EVERY_MS) return;
  lastPrune = now;
  for (const [key, record] of memoryStore.entries()) {
    if (now - record.lastRequest > PRUNE_AFTER_MS) {
      memoryStore.delete(key);
    }
  }
}

/** The answer for a refused request: 429, `Retry-After`, and the app's usual error shape. */
export function tooManyRequests(result: LimitResult, message: string): Response {
  return Response.json(
    { error: message, code: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "retry-after": String(result.retryAfterSeconds),
        "cache-control": "no-store",
      },
    }
  );
}
