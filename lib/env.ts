import { z } from "zod";
import { CONTACT_EMAIL } from "./contact";

const DEFAULT_SMTP_PORT = 587;
const MAX_TCP_PORT = 65_535;
const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const DEFAULT_DEV_SITE_URL = "http://localhost:3000";
const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

// `KEY=` in an env file arrives as "".
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const nodeEnv = z.enum(["development", "production", "test"]).default("development");

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
// is baked in at `next build` as well as read at runtime.
const siteSchema = z
  .object({ NODE_ENV: nodeEnv, SITE_URL: optionalString })
  .transform((env, ctx) => {
    const vercelOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined;
    const rawUrl = env.SITE_URL ?? vercelOrigin;
    if (rawUrl === undefined) {
      if (env.NODE_ENV !== "production") return { ...env, SITE_URL: DEFAULT_DEV_SITE_URL };
      ctx.addIssue({
        code: "custom",
        path: ["SITE_URL"],
        message: "is required in production (the public origin, e.g. https://vietdragon.vn)",
      });
      return z.NEVER;
    }
    const origin = parseSiteOrigin(rawUrl);
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

export type MailEnv = z.output<typeof mailSchema>;
export type LogEnv = z.output<typeof loggingSchema>;
export type SiteEnv = z.output<typeof siteSchema>;

const ENV_GROUPS = [
  ["mail", mailSchema],
  ["logging", loggingSchema],
  ["site", siteSchema],
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

let mailEnv: MailEnv | undefined;
let logEnv: LogEnv | undefined;
let siteEnv: SiteEnv | undefined;

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

/** Validates every group at once so a misconfigured deploy reports all problems in one boot failure. */
export function assertEnv(): void {
  const problems = ENV_GROUPS.flatMap(([group, schema]) => {
    const result = schema.safeParse(process.env);
    return result.success ? [] : describeIssues(group, result.error);
  });
  if (problems.length > 0) throw invalidEnvError(problems);
}
