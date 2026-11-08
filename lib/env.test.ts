import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// lib/env.ts memoizes per module instance, so every case loads a fresh copy under a clean process.env.
const MANAGED = [
  "NODE_ENV",
  "DATABASE_URL",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_FROM",
  "CONSULT_RECEIVER_EMAIL",
  "SITE_URL",
  "LOG_LEVEL",
  "BETTER_AUTH_SECRET",
  "UPLOADS_DIR",
  "MEDIA_MAX_IMAGE_MB",
  "MEDIA_MAX_TOTAL_MB",
] as const;

const GOOD_DB = "postgres://vietdragon:s3cretpassw0rd-long@127.0.0.1:5432/vietdragon";
const GOOD_SECRET = "0123456789abcdef0123456789abcdef";
const FULL_SMTP = { SMTP_HOST: "smtp.example.com", SMTP_USER: "u@example.com", SMTP_PASS: "smtp-secret-value" };
const SECRETS = ["s3cretpassw0rd-long", "hunter2", "smtp-secret-value", GOOD_SECRET];

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(MANAGED.map((key) => [key, process.env[key]]));
});

afterEach(() => {
  for (const key of MANAGED) {
    if (saved[key] === undefined) delete process.env[key];
    else Object.assign(process.env, { [key]: saved[key] });
  }
});

async function loadEnv(vars: Record<string, string>) {
  vi.resetModules();
  for (const key of MANAGED) delete process.env[key];
  Object.assign(process.env, vars);
  return import("./env");
}

async function problems(vars: Record<string, string>): Promise<string> {
  const env = await loadEnv(vars);
  try {
    env.assertEnv();
    return "";
  } catch (error) {
    return (error as Error).message;
  }
}

const COMPLETE_PROD = {
  NODE_ENV: "production",
  DATABASE_URL: GOOD_DB,
  ...FULL_SMTP,
  SITE_URL: "https://vietdragon.vn",
  BETTER_AUTH_SECRET: GOOD_SECRET,
  UPLOADS_DIR: "/data/uploads",
};

describe("assertEnv", () => {
  it("passes a complete production configuration", async () => {
    expect(await problems(COMPLETE_PROD)).toBe("");
  });

  it("passes the minimum development configuration (SMTP optional, SITE_URL defaulted)", async () => {
    expect(await problems({ NODE_ENV: "development", DATABASE_URL: GOOD_DB, BETTER_AUTH_SECRET: GOOD_SECRET })).toBe("");
  });

  it("reports every broken group in one failure", async () => {
    const message = await problems({ NODE_ENV: "production" });
    for (const group of ["database:", "mail:", "site:", "auth:", "media:"]) expect(message).toContain(group);
  });

  it("names only the broken group when one is wrong", async () => {
    const message = await problems({ ...COMPLETE_PROD, SITE_URL: "not a url" });
    expect(message).toContain("site: SITE_URL");
    expect(message).not.toContain("database:");
    expect(message).not.toContain("auth:");
  });

  it("never echoes a secret value in its messages", async () => {
    const message = await problems({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://u:hunter2@db:5432/x",
      SMTP_PORT: "abc",
      SITE_URL: "https://user:pw@vietdragon.vn",
      BETTER_AUTH_SECRET: "short-secret-value",
    });
    expect(message).not.toBe("");
    for (const secret of [...SECRETS, "short-secret-value", "pw@"]) expect(message).not.toContain(secret);
  });
});

describe("database group", () => {
  it("requires DATABASE_URL", async () => {
    expect(await problems({ NODE_ENV: "development", BETTER_AUTH_SECRET: GOOD_SECRET })).toContain("database: DATABASE_URL");
  });

  it.each(["mysql://u:p@h/db", "not a url", "http://example.com"])("rejects %s", async (url) => {
    expect(await problems({ NODE_ENV: "development", DATABASE_URL: url, BETTER_AUTH_SECRET: GOOD_SECRET })).toContain(
      "postgres://",
    );
  });

  it("in production rejects a short or missing password", async () => {
    for (const url of ["postgres://u:hunter2@db:5432/x", "postgres://u@db:5432/x"]) {
      expect(await problems({ ...COMPLETE_PROD, DATABASE_URL: url })).toContain("at least 12");
    }
  });

  it("getDatabaseEnv throws without DATABASE_URL", async () => {
    const env = await loadEnv({ NODE_ENV: "development" });
    expect(() => env.getDatabaseEnv()).toThrow(/DATABASE_URL/);
  });
});

describe("mail group", () => {
  it("in production requires SMTP_HOST, SMTP_USER and SMTP_PASS, naming all missing ones", async () => {
    const message = await problems({ ...COMPLETE_PROD, SMTP_HOST: "", SMTP_USER: "", SMTP_PASS: "" });
    for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]) expect(message).toContain(key);
  });

  it("treats an empty string like an unset variable", async () => {
    expect(await problems({ ...COMPLETE_PROD, SMTP_HOST: "" })).toContain("SMTP_HOST");
  });

  it.each([
    ["SMTP_PORT", "abc"],
    ["SMTP_PORT", "70000"],
    ["SMTP_SECURE", "yes"],
    ["CONSULT_RECEIVER_EMAIL", "nope"],
  ])("rejects %s=%s", async (key, value) => {
    expect(await problems({ ...COMPLETE_PROD, [key]: value })).toContain(key);
  });

  it("falls back from empty strings: port 587, secure false, receiver = CONTACT_EMAIL", async () => {
    const env = await loadEnv({ NODE_ENV: "development", SMTP_PORT: "", SMTP_SECURE: "", CONSULT_RECEIVER_EMAIL: "" });
    expect(env.getMailEnv()).toMatchObject({ SMTP_PORT: 587, SMTP_SECURE: false, CONSULT_RECEIVER_EMAIL: "contact@vietdragon.vn" });
  });

  it("parses explicit values into numbers and booleans", async () => {
    const env = await loadEnv({
      NODE_ENV: "development",
      SMTP_PORT: "465",
      SMTP_SECURE: "true",
      CONSULT_RECEIVER_EMAIL: "x@y.vn",
      ...FULL_SMTP,
    });
    expect(env.getMailEnv()).toMatchObject({ SMTP_PORT: 465, SMTP_SECURE: true, CONSULT_RECEIVER_EMAIL: "x@y.vn" });
  });

  it("works without DATABASE_URL (the consult route does not depend on the database)", async () => {
    const env = await loadEnv({ NODE_ENV: "development" });
    expect(() => env.getMailEnv()).not.toThrow();
  });
});

describe("site group", () => {
  it("defaults to localhost outside production", async () => {
    expect((await loadEnv({ NODE_ENV: "development" })).getSiteEnv().SITE_URL).toBe("http://localhost:3000");
  });

  it("is required in production, including as an empty string", async () => {
    for (const SITE_URL of [undefined, ""]) {
      const vars: Record<string, string> = { ...COMPLETE_PROD };
      if (SITE_URL === undefined) delete vars.SITE_URL;
      else vars.SITE_URL = SITE_URL;
      expect(await problems(vars)).toContain("site: SITE_URL is required in production");
    }
  });

  it("normalises to the bare origin", async () => {
    expect((await loadEnv({ ...COMPLETE_PROD, SITE_URL: "https://vietdragon.vn/" })).getSiteEnv().SITE_URL).toBe(
      "https://vietdragon.vn",
    );
    expect((await loadEnv({ ...COMPLETE_PROD, SITE_URL: "https://vietdragon.vn:8443" })).getSiteEnv().SITE_URL).toBe(
      "https://vietdragon.vn:8443",
    );
  });

  it.each([
    "https://vietdragon.vn/vi",
    "https://vietdragon.vn/?x=1",
    "https://vietdragon.vn/#top",
    "ftp://vietdragon.vn",
    "vietdragon.vn",
    "not a url",
    "https://user:pw@vietdragon.vn",
  ])("rejects %s", async (url) => {
    expect(await problems({ ...COMPLETE_PROD, SITE_URL: url })).toContain("origin without a path");
  });
});

describe("logging group", () => {
  it.each([
    ["production", "info"],
    ["development", "debug"],
    ["test", "silent"],
  ])("defaults to %s -> %s", async (nodeEnv, level) => {
    expect((await loadEnv({ NODE_ENV: nodeEnv })).getLogEnv().LOG_LEVEL).toBe(level);
  });

  it("honours an explicit level and treats empty as unset", async () => {
    expect((await loadEnv({ NODE_ENV: "production", LOG_LEVEL: "warn" })).getLogEnv().LOG_LEVEL).toBe("warn");
    expect((await loadEnv({ NODE_ENV: "production", LOG_LEVEL: "" })).getLogEnv().LOG_LEVEL).toBe("info");
  });

  it("rejects an unknown level", async () => {
    expect(await problems({ ...COMPLETE_PROD, LOG_LEVEL: "verbose" })).toContain("logging: LOG_LEVEL");
  });
});

describe("auth group", () => {
  it("is required in every environment — no development default", async () => {
    expect(await problems({ NODE_ENV: "development", DATABASE_URL: GOOD_DB })).toContain("auth: BETTER_AUTH_SECRET");
  });

  it("rejects empty and short secrets at the 32-character boundary", async () => {
    for (const secret of ["", GOOD_SECRET.slice(0, 31)]) {
      expect(await problems({ ...COMPLETE_PROD, BETTER_AUTH_SECRET: secret })).toContain("auth: BETTER_AUTH_SECRET");
    }
    expect((await loadEnv({ ...COMPLETE_PROD, BETTER_AUTH_SECRET: GOOD_SECRET })).getAuthEnv().BETTER_AUTH_SECRET).toBe(GOOD_SECRET);
  });
});

describe("media group", () => {
  it("defaults to a folder under the working directory and 10 MB outside production", async () => {
    const env = (await loadEnv({ NODE_ENV: "development" })).getMediaEnv();
    expect(env.UPLOADS_DIR).toBe(`${process.cwd()}/.uploads`);
    expect(env.MEDIA_MAX_IMAGE_MB).toBe(10);
    expect(env.MEDIA_MAX_TOTAL_MB).toBe(2048);
  });

  it("requires the uploads volume in production, as an absolute path", async () => {
    const withoutDir: Record<string, string> = { ...COMPLETE_PROD };
    delete withoutDir.UPLOADS_DIR;
    expect(await problems(withoutDir)).toContain("media: UPLOADS_DIR is required in production");
    expect(await problems({ ...COMPLETE_PROD, UPLOADS_DIR: "" })).toContain("media: UPLOADS_DIR is required");
    expect(await problems({ ...COMPLETE_PROD, UPLOADS_DIR: "uploads" })).toContain("media: UPLOADS_DIR must be an absolute path");
    expect((await loadEnv({ ...COMPLETE_PROD, UPLOADS_DIR: "/data/uploads/" })).getMediaEnv().UPLOADS_DIR).toBe("/data/uploads/");
  });

  it("takes the size cap in whole megabytes, between 1 and what Caddy lets through", async () => {
    expect((await loadEnv({ NODE_ENV: "development", MEDIA_MAX_IMAGE_MB: "5" })).getMediaEnv().MEDIA_MAX_IMAGE_MB).toBe(5);
    expect((await loadEnv({ NODE_ENV: "development", MEDIA_MAX_IMAGE_MB: "" })).getMediaEnv().MEDIA_MAX_IMAGE_MB).toBe(10);
    for (const bad of ["0", "12", "abc", "2.5"]) expect(await problems({ ...COMPLETE_PROD, MEDIA_MAX_IMAGE_MB: bad })).toContain("media: MEDIA_MAX_IMAGE_MB");
  });

  it("takes the library's total quota in whole megabytes", async () => {
    expect((await loadEnv({ NODE_ENV: "development", MEDIA_MAX_TOTAL_MB: "500" })).getMediaEnv().MEDIA_MAX_TOTAL_MB).toBe(500);
    expect((await loadEnv({ NODE_ENV: "development", MEDIA_MAX_TOTAL_MB: "" })).getMediaEnv().MEDIA_MAX_TOTAL_MB).toBe(2048);
    for (const bad of ["0", "-5", "abc", "1.5"]) expect(await problems({ ...COMPLETE_PROD, MEDIA_MAX_TOTAL_MB: bad })).toContain("media: MEDIA_MAX_TOTAL_MB");
  });
});
