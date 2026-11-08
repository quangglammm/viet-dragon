// Tuning that more than one module needs (auth config, proxy, hooks, tests). Kept free of
// imports so proxy.ts can read the cookie prefix without loading the whole auth stack.

export const COOKIE_PREFIX = "vd";

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_POLICY_MESSAGE = `Mật khẩu phải có từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự.`;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;

export const SESSION_EXPIRES_IN_SECONDS = 12 * SECONDS_PER_HOUR;
export const SESSION_UPDATE_AGE_SECONDS = SECONDS_PER_HOUR;
/** A session older than this must sign in again before sensitive actions (enforced by our own hook). */
export const SESSION_FRESH_AGE_SECONDS = 15 * SECONDS_PER_MINUTE;

// Per-account lockout (lib/auth/lockout.ts): N consecutive failures lock the address for BASE seconds,
// doubling with each further lock, up to MAX. A quiet period of MEMORY seconds forgets past failures.
export const LOCK_THRESHOLD = 5;
export const LOCK_BASE_SECONDS = 5 * SECONDS_PER_MINUTE;
export const LOCK_MAX_SECONDS = 24 * SECONDS_PER_HOUR;
export const ATTEMPT_MEMORY_SECONDS = 24 * SECONDS_PER_HOUR;
export const MAX_EMAIL_KEY_LENGTH = 254;

export const SIGN_IN_RATE_LIMIT = { window: SECONDS_PER_MINUTE, max: 5 } as const;
export const DEFAULT_RATE_LIMIT = { window: SECONDS_PER_MINUTE, max: 100 } as const;
