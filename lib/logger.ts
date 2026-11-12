import type { Instrumentation } from "next";
import pino, { type Logger } from "pino";
import { getLogEnv } from "@/lib/env";

const SERVICE_NAME = "viet-dragon";
const REDACTED = "[redacted]";
const PHONE_VISIBLE_PREFIX = 4;
const PHONE_VISIBLE_SUFFIX = 3;

// Matched by key name at depth 0-2, so `{ password }`, `{ body: { password } }` and
// `{ req: { headers: { cookie } } }` are all censored without the caller remembering to.
const SENSITIVE_KEYS = ["password", "token", "secret", "authorization", "cookie"];
const REDACT_PATHS = SENSITIVE_KEYS.flatMap((key) => [key, `*.${key}`, `*.*.${key}`]);

let baseLogger: Logger | undefined;

// JSON lines on stdout — Docker's log driver (rotation) and any collector read it as-is.
// Lazy so importing this module never reads env at build time beyond LOG_LEVEL's default.
function getBaseLogger(): Logger {
  baseLogger ??= pino({
    level: getLogEnv().LOG_LEVEL,
    base: { service: SERVICE_NAME },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: { level: (label) => ({ level: label }) },
    redact: { paths: REDACT_PATHS, censor: REDACTED },
  });
  return baseLogger;
}

export function getLogger(scope: string): Logger {
  return getBaseLogger().child({ scope });
}

/** Keeps enough of a phone number to correlate a lead ("0901***377") without storing it in logs. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= PHONE_VISIBLE_PREFIX + PHONE_VISIBLE_SUFFIX) return "***";
  return `${digits.slice(0, PHONE_VISIBLE_PREFIX)}***${digits.slice(-PHONE_VISIBLE_SUFFIX)}`;
}

/**
 * Next's `onRequestError` hook, formatted. Deliberately logs no headers (cookies, auth)
 * and no query string (may carry personal data) — only where and what failed.
 */
export function logRequestError(...[error, request, context]: Parameters<Instrumentation.onRequestError>): void {
  const digest =
    typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
  getLogger("request").error(
    {
      err: error,
      digest,
      method: request.method,
      path: request.path.split("?")[0],
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
    },
    "request failed",
  );
}
