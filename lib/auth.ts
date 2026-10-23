import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import {
  COOKIE_PREFIX,
  DEFAULT_RATE_LIMIT,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_FRESH_AGE_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
  SIGN_IN_RATE_LIMIT,
} from "@/lib/auth/constants";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { getAuthEnv, getSiteEnv } from "@/lib/env";
import { getLogger } from "@/lib/logger";
import { ac, DEFAULT_ROLE, roles } from "@/lib/permissions";

const BANNED_USER_MESSAGE = "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";

export function createAuth() {
  const { BETTER_AUTH_SECRET } = getAuthEnv();
  const { SITE_URL } = getSiteEnv();
  const log = getLogger("auth");

  return betterAuth({
    secret: BETTER_AUTH_SECRET,
    // One origin variable for the whole app: pages, Open Graph and auth all derive from SITE_URL.
    baseURL: SITE_URL,
    trustedOrigins: [SITE_URL],
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    telemetry: { enabled: false },
    // Message only — the extra args carry request details we do not want in logs.
    logger: { level: "warn", log: (level, message) => log[level](message) },

    // `app_user` is the table docs/data-model.sql foreign-keys against.
    user: {
      modelName: "app_user",
      additionalFields: {
        // Set for every admin-created account and after every admin password reset; cleared when
        // the user changes their own password. input:false — a client can never set it.
        mustChangePassword: { type: "boolean", defaultValue: true, input: false },
      },
    },

    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // invite-only: accounts come from an admin or `pnpm admin:create`
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
      autoSignIn: false,
      revokeSessionsOnPasswordReset: true,
      password: { hash: hashPassword, verify: verifyPassword },
    },

    // Sessions live in the database only (no cookie cache) so a revoke or ban takes effect at once.
    // Note: Better Auth does not enforce freshAge on its endpoints — our before-hook does (Phase 2 / M2).
    session: {
      expiresIn: SESSION_EXPIRES_IN_SECONDS,
      updateAge: SESSION_UPDATE_AGE_SECONDS,
      freshAge: SESSION_FRESH_AGE_SECONDS,
      cookieCache: { enabled: false },
    },

    advanced: {
      cookiePrefix: COOKIE_PREFIX,
      useSecureCookies: SITE_URL.startsWith("https://"),
      defaultCookieAttributes: { sameSite: "strict" },
      // Caddy overwrites X-Real-IP with the TCP peer and the app publishes no port, so only this
      // header is trustworthy; X-Forwarded-For is ignored.
      ipAddress: { ipAddressHeaders: ["x-real-ip"] },
    },

    // Enabled in every environment (Better Auth defaults to production only), stored in Postgres.
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "rate_limit",
      ...DEFAULT_RATE_LIMIT,
      customRules: { "/sign-in/email": SIGN_IN_RATE_LIMIT },
    },

    plugins: [admin({ ac, roles, defaultRole: DEFAULT_ROLE, bannedUserMessage: BANNED_USER_MESSAGE })],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;

/** Lazy on purpose: importing this module (e.g. during `next build`) must not read env or touch the database. */
export function getAuth(): Auth {
  instance ??= createAuth();
  return instance;
}
