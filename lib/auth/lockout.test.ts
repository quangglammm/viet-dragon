import { describe, expect, it } from "vitest";
import { ATTEMPT_MEMORY_SECONDS, LOCK_BASE_SECONDS, LOCK_MAX_SECONDS, LOCK_THRESHOLD, MAX_EMAIL_KEY_LENGTH } from "./constants";
import { applyFailure, EMPTY_LOCK_STATE, lockSecondsRemaining, normalizeEmailKey, type LockState } from "./lockout";

const T0 = new Date("2026-01-01T00:00:00.000Z");
const at = (seconds: number) => new Date(T0.getTime() + seconds * 1000);

/** Applies `times` failures at `now`, returning the last outcome. */
function failTimes(state: LockState, times: number, now: Date) {
  let outcome = { state, justLocked: false };
  for (let i = 0; i < times; i++) outcome = applyFailure(outcome.state, now);
  return outcome;
}

describe("applyFailure", () => {
  it("counts failures below the threshold without locking", () => {
    const { state, justLocked } = failTimes(EMPTY_LOCK_STATE, LOCK_THRESHOLD - 1, T0);
    expect(state.failures).toBe(LOCK_THRESHOLD - 1);
    expect(state.lockedUntil).toBeNull();
    expect(state.lockLevel).toBe(0);
    expect(justLocked).toBe(false);
  });

  it("locks on the threshold-th consecutive failure for the base duration and restarts the count", () => {
    const { state, justLocked } = failTimes(EMPTY_LOCK_STATE, LOCK_THRESHOLD, T0);
    expect(justLocked).toBe(true);
    expect(state.lockLevel).toBe(1);
    expect(state.failures).toBe(0);
    expect(lockSecondsRemaining(state, T0)).toBe(LOCK_BASE_SECONDS);
  });

  it("doubles the lock each time and caps it", () => {
    let state: LockState = EMPTY_LOCK_STATE;
    let now = T0;
    const seen: number[] = [];
    for (let level = 1; level <= 14; level++) {
      const outcome = failTimes(state, LOCK_THRESHOLD, now);
      expect(outcome.justLocked).toBe(true);
      seen.push(lockSecondsRemaining(outcome.state, now));
      state = outcome.state;
      now = new Date((state.lockedUntil as Date).getTime() + 1000); // just after the lock expires
    }
    expect(seen.slice(0, 4)).toEqual([LOCK_BASE_SECONDS, LOCK_BASE_SECONDS * 2, LOCK_BASE_SECONDS * 4, LOCK_BASE_SECONDS * 8]);
    expect(Math.max(...seen)).toBe(LOCK_MAX_SECONDS);
    expect(seen.at(-1)).toBe(LOCK_MAX_SECONDS);
    // strictly non-decreasing: never shortens as an attacker keeps going
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
  });

  it("stays finite for absurd lock levels", () => {
    const state: LockState = { failures: LOCK_THRESHOLD - 1, lockLevel: 500, lockedUntil: null, lastFailureAt: T0 };
    const { state: next } = applyFailure(state, T0);
    expect(lockSecondsRemaining(next, T0)).toBe(LOCK_MAX_SECONDS);
  });

  it("does not escalate or extend while already locked (a concurrent request slipped past the check)", () => {
    const locked = failTimes(EMPTY_LOCK_STATE, LOCK_THRESHOLD, T0).state;
    const { state, justLocked } = applyFailure(locked, at(10));
    expect(justLocked).toBe(false);
    expect(state.lockLevel).toBe(locked.lockLevel);
    expect(state.lockedUntil).toEqual(locked.lockedUntil);
    expect(state.lastFailureAt).toEqual(at(10));
  });

  it("keeps counting within the memory window", () => {
    const state: LockState = { failures: 3, lockLevel: 2, lockedUntil: null, lastFailureAt: T0 };
    const { state: next } = applyFailure(state, at(ATTEMPT_MEMORY_SECONDS - 1));
    expect(next.failures).toBe(4);
    expect(next.lockLevel).toBe(2);
  });

  it("forgets failures and lock level after a quiet period", () => {
    const state: LockState = { failures: 3, lockLevel: 2, lockedUntil: null, lastFailureAt: T0 };
    const { state: next } = applyFailure(state, at(ATTEMPT_MEMORY_SECONDS + 1));
    expect(next.failures).toBe(1);
    expect(next.lockLevel).toBe(0);
  });

  it("measures the quiet period from the END of the last lock, so waiting out the longest lock buys nothing", () => {
    const state: LockState = { failures: 0, lockLevel: 7, lockedUntil: at(LOCK_MAX_SECONDS), lastFailureAt: T0 };
    // Lock just ended: still remembered, so the next lock keeps climbing.
    expect(failTimes(state, LOCK_THRESHOLD, at(LOCK_MAX_SECONDS + 1)).state.lockLevel).toBe(8);
    // Only a full quiet period AFTER the lock ended clears the ladder.
    const quiet = applyFailure(state, at(LOCK_MAX_SECONDS + ATTEMPT_MEMORY_SECONDS + 1));
    expect(quiet.state.lockLevel).toBe(0);
    expect(quiet.state.failures).toBe(1);
  });

  it("never forgets a lock that is still running, however long ago the last failure was", () => {
    const state: LockState = { failures: 0, lockLevel: 3, lockedUntil: at(48 * 3600), lastFailureAt: T0 };
    const { state: next, justLocked } = applyFailure(state, at(ATTEMPT_MEMORY_SECONDS + 60));
    expect(justLocked).toBe(false);
    expect(next.lockLevel).toBe(3);
  });
});

describe("lockSecondsRemaining", () => {
  it("is 0 when not locked or once the lock has expired", () => {
    expect(lockSecondsRemaining(EMPTY_LOCK_STATE, T0)).toBe(0);
    expect(lockSecondsRemaining({ ...EMPTY_LOCK_STATE, lockedUntil: at(-1) }, T0)).toBe(0);
    expect(lockSecondsRemaining({ ...EMPTY_LOCK_STATE, lockedUntil: T0 }, T0)).toBe(0);
  });

  it("rounds a partial second up so Retry-After is never an under-estimate", () => {
    expect(lockSecondsRemaining({ ...EMPTY_LOCK_STATE, lockedUntil: new Date(T0.getTime() + 1500) }, T0)).toBe(2);
  });
});

describe("normalizeEmailKey", () => {
  it("trims and lower-cases so case variants share one counter", () => {
    expect(normalizeEmailKey("  Admin@Example.COM ")).toBe("admin@example.com");
  });

  it("caps the key length so a huge address cannot bloat the table", () => {
    expect(normalizeEmailKey(`${"a".repeat(1000)}@example.com`)).toHaveLength(MAX_EMAIL_KEY_LENGTH);
  });
});
