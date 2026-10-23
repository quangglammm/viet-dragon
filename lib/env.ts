import { z } from "zod";
import { CONTACT_EMAIL } from "./contact";

// Relative import above: drizzle.config.ts loads this file outside Next's
// bundler, where the `@/` alias does not resolve.

const MIN_PRODUCTION_DB_PASSWORD_LENGTH = 12;
const MIN_AUTH_SECRET_LENGTH = 32;
const DEFAULT_SMTP_PORT = 587;
const MAX_TCP_PORT = 65_535;
const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const DEFAULT_DEV_SITE_URL = "http://localhost:3000";
const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

// `KEY=` in an env file or compose `environment:` block arrives as "".
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const nodeEnv = z.enum(["development", "production", "test"]).default("development");

function parsePostgresUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return POSTGRES_PROTOCOLS.has(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

const databaseSchema = z
  .object({
    NODE_ENV: nodeEnv,
    DATABASE_URL: z.string().refine((value) => parsePostgresUrl(value) !== null, {
      message: "must be a postgres:// or postgresql:// URL",
    }),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;
    const password = decodeURIComponent(parsePostgresUrl(env.DATABASE_URL)?.password ?? "");
    if (password.length < MIN_PRODUCTION_DB_PASSWORD_LENGTH) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: `must carry a password of at least ${MIN_PRODUCTION_DB_PASSWORD_LENGTH} characters in production`,
      });
    }
  });

const REQUIRED_SMTP_KEYS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const;

const mailSchema = z
  .object({
    NODE_ENV: nodeEnv,
    SMTP_HOST: optionalString,
    SMTP_USER: optionalString,
    SMTP_PASS: optionalString,
    SMTP_FROM: optionalString,
    SMTP_PORT: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1).max(MAX_TCP_PORT).default(DEFAULT_SMTP_PORT),
    ),
    SMTP_SECURE: z
      .preprocess(emptyToUndefined, z.enum(["true", "false"]).default("false"))
      .transform((value) => value === "true"),
    CONSULT_RECEIVER_EMAIL: z.preprocess(emptyToUndefined, z.email().default(CONTACT_EMAIL)),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== "production") return;
    for (const key of REQUIRED_SMTP_KEYS) {
      if (!env[key]) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "is required in production — consult leads would otherwise be dropped",
        });
      }
    }
  });

function defaultLogLevel(nodeEnvValue: z.output<typeof nodeEnv>): LogLevel {
  if (nodeEnvValue === "production") return "info";
  return nodeEnvValue === "test" ? "silent" : "debug";
}

const loggingSchema = z
  .object({
    NODE_ENV: nodeEnv,
    LOG_LEVEL: z.preprocess(emptyToUndefined, z.enum(LOG_LEVELS).optional()),
  })
  .transform((env) => ({ ...env, LOG_LEVEL: env.LOG_LEVEL ?? defaultLogLevel(env.NODE_ENV) }));

function parseSiteOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    const isOriginOnly = url.pathname === "/" && !url.search && !url.hash && !url.username;
    return HTTP_PROTOCOLS.has(url.protocol) && isOriginOnly ? url.origin : null;
  } catch {
    return null;
  }
}

// The public origin (canonical URLs, Open Graph, sitemap). Pages are prerendered, so this
// is baked in at `next build` as well as read at runtime — pass it as a build arg too.
const siteSchema = z
  .object({ NODE_ENV: nodeEnv, SITE_URL: optionalString })
  .transform((env, ctx) => {
    if (env.SITE_URL === undefined) {
      if (env.NODE_ENV !== "production") return { ...env, SITE_URL: DEFAULT_DEV_SITE_URL };
      ctx.addIssue({
        code: "custom",
        path: ["SITE_URL"],
        message: "is required in production (the public origin, e.g. https://vietdragon.vn)",
      });
      return z.NEVER;
    }
    const origin = parseSiteOrigin(env.SITE_URL);
    if (origin === null) {
      ctx.addIssue({
        code: "custom",
        path: ["SITE_URL"],
        message: "must be an http(s) origin without a path, e.g. https://vietdragon.vn",
      });
      return z.NEVER;
    }
    return { ...env, SITE_URL: origin };
  });

// Signs session cookies. Required in every environment — there is deliberately no dev default.
const authSchema = z.object({
  NODE_ENV: nodeEnv,
  BETTER_AUTH_SECRET: z
    .string()
    .min(MIN_AUTH_SECRET_LENGTH, `must be at least ${MIN_AUTH_SECRET_LENGTH} characters (openssl rand -hex 32)`),
});

export type DatabaseEnv = z.output<typeof databaseSchema>;
export type MailEnv = z.output<typeof mailSchema>;
export type LogEnv = z.output<typeof loggingSchema>;
export type SiteEnv = z.output<typeof siteSchema>;
export type AuthEnv = z.output<typeof authSchema>;

const ENV_GROUPS = [
  ["database", databaseSchema],
  ["mail", mailSchema],
  ["logging", loggingSchema],
  ["site", siteSchema],
  ["auth", authSchema],
] as const;

// Issue text names the variable and the rule, never the value — these are secrets.
function describeIssues(group: string, error: z.ZodError): string[] {
  return error.issues.map((issue) => `${group}: ${issue.path.join(".") || "(env)"} ${issue.message}`);
}

function invalidEnvError(problems: string[]): Error {
  return new Error(`Invalid environment configuration:\n  - ${problems.join("\n  - ")}`);
}

function parseEnv<S extends z.ZodType>(group: string, schema: S): z.output<S> {
  const result = schema.safeParse(process.env);
  if (!result.success) throw invalidEnvError(describeIssues(group, result.error));
  return result.data;
}

let databaseEnv: DatabaseEnv | undefined;
let mailEnv: MailEnv | undefined;
let logEnv: LogEnv | undefined;
let siteEnv: SiteEnv | undefined;
let authEnv: AuthEnv | undefined;

export function getDatabaseEnv(): DatabaseEnv {
  databaseEnv ??= parseEnv("database", databaseSchema);
  return databaseEnv;
}

export function getMailEnv(): MailEnv {
  mailEnv ??= parseEnv("mail", mailSchema);
  return mailEnv;
}

export function getLogEnv(): LogEnv {
  logEnv ??= parseEnv("logging", loggingSchema);
  return logEnv;
}

export function getSiteEnv(): SiteEnv {
  siteEnv ??= parseEnv("site", siteSchema);
  return siteEnv;
}

export function getAuthEnv(): AuthEnv {
  authEnv ??= parseEnv("auth", authSchema);
  return authEnv;
}

/** Validates every group at once so a misconfigured deploy reports all problems in one boot failure. */
export function assertEnv(): void {
  const problems = ENV_GROUPS.flatMap(([group, schema]) => {
    const result = schema.safeParse(process.env);
    return result.success ? [] : describeIssues(group, result.error);
  });
  if (problems.length > 0) throw invalidEnvError(problems);
}
