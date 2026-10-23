import { and, eq, isNull, lt, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { loginAttempt } from "@/lib/db/schema";
import {
  ATTEMPT_MEMORY_SECONDS,
  LOCK_BASE_SECONDS,
  LOCK_MAX_SECONDS,
  LOCK_THRESHOLD,
  MAX_EMAIL_KEY_LENGTH,
} from "./constants";

// Per-account sign-in lockout, on top of Better Auth's per-IP rate limit. Keyed by the lower-cased
// email whether or not an account exists, so an unknown address locks and unlocks exactly like a real
// one — the response never says which addresses are accounts.

export type LockState = {
  /** Consecutive failures since the last lock or success. */
  failures: number;
  /** Locks triggered since the last success / quiet period; drives the back-off. */
  lockLevel: number;
  lockedUntil: Date | null;
  lastFailureAt: Date | null;
};

export const EMPTY_LOCK_STATE: LockState = { failures: 0, lockLevel: 0, lockedUntil: null, lastFailureAt: null };

const MS_PER_SECOND = 1000;
// Opportunistic housekeeping so random-email probing cannot grow the table without bound.
const PRUNE_PROBABILITY = 0.04;
const MAX_LOCK_LEVEL = 30; // keeps 2 ** level finite long after the cap has been reached

export function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase().slice(0, MAX_EMAIL_KEY_LENGTH);
}

export function lockSecondsRemaining(state: LockState, now: Date): number {
  if (!state.lockedUntil) return 0;
  return Math.max(0, Math.ceil((state.lockedUntil.getTime() - now.getTime()) / MS_PER_SECOND));
}

function lockDurationSeconds(level: number): number {
  return Math.min(LOCK_MAX_SECONDS, LOCK_BASE_SECONDS * 2 ** (Math.min(level, MAX_LOCK_LEVEL) - 1));
}

// Quiet time is measured from the later of the last failure and the end of the last lock. Measuring from
// the failure alone would let the longest lock (24 h) expire straight into "forgotten", handing an
// attacker who waits it out a fresh back-off ladder.
function isForgotten(state: LockState, now: Date): boolean {
  if (!state.lastFailureAt || lockSecondsRemaining(state, now) > 0) return false;
  const quietSince = Math.max(state.lastFailureAt.getTime(), state.lockedUntil?.getTime() ?? 0);
  return (now.getTime() - quietSince) / MS_PER_SECOND > ATTEMPT_MEMORY_SECONDS;
}

/** Pure: the state after one more failed sign-in at `now`. */
export function applyFailure(previous: LockState, now: Date): { state: LockState; justLocked: boolean } {
  if (lockSecondsRemaining(previous, now) > 0) {
    // Already locked (a concurrent request slipped past the check): do not extend or escalate.
    return { state: { ...previous, lastFailureAt: now }, justLocked: false };
  }

  const base = isForgotten(previous, now) ? EMPTY_LOCK_STATE : previous;
  const failures = base.failures + 1;
  if (failures < LOCK_THRESHOLD) {
    return { state: { ...base, failures, lastFailureAt: now }, justLocked: false };
  }

  const lockLevel = base.lockLevel + 1;
  const lockedUntil = new Date(now.getTime() + lockDurationSeconds(lockLevel) * MS_PER_SECOND);
  return { state: { failures: 0, lockLevel, lockedUntil, lastFailureAt: now }, justLocked: true };
}

export async function getLockState(emailKey: string): Promise<LockState> {
  const [row] = await getDb().select().from(loginAttempt).where(eq(loginAttempt.emailKey, emailKey)).limit(1);
  if (!row) return EMPTY_LOCK_STATE;
  return { failures: row.failures, lockLevel: row.lockLevel, lockedUntil: row.lockedUntil, lastFailureAt: row.lastFailureAt };
}

/** Records a failed sign-in. Row-locked so concurrent attempts cannot both read the same count. */
export async function registerFailure(
  emailKey: string,
  now: Date = new Date(),
): Promise<{ state: LockState; justLocked: boolean }> {
  const db = getDb();
  const result = await db.transaction(async (tx) => {
    await tx.insert(loginAttempt).values({ emailKey }).onConflictDoNothing();
    const [row] = await tx.select().from(loginAttempt).where(eq(loginAttempt.emailKey, emailKey)).for("update");
    const outcome = applyFailure(
      { failures: row.failures, lockLevel: row.lockLevel, lockedUntil: row.lockedUntil, lastFailureAt: row.lastFailureAt },
      now,
    );
    await tx.update(loginAttempt).set(outcome.state).where(eq(loginAttempt.emailKey, emailKey));
    return outcome;
  });

  if (Math.random() < PRUNE_PROBABILITY) await pruneForgottenAttempts(now);
  return result;
}

export async function clearAttempts(emailKey: string): Promise<void> {
  await getDb().delete(loginAttempt).where(eq(loginAttempt.emailKey, emailKey));
}

async function pruneForgottenAttempts(now: Date): Promise<void> {
  const cutoff = new Date(now.getTime() - ATTEMPT_MEMORY_SECONDS * MS_PER_SECOND);
  await getDb()
    .delete(loginAttempt)
    .where(and(lt(loginAttempt.lastFailureAt, cutoff), or(isNull(loginAttempt.lockedUntil), lt(loginAttempt.lockedUntil, now))));
}
