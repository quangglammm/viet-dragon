import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import type { TestProject } from "vitest/node";
import { migrateDatabase, withDatabaseName } from "./migrate";

declare module "vitest" {
  export interface ProvidedContext {
    testDatabaseUrl: string;
  }
}

// Vitest globalSetup: one throwaway database per run, created from the dev server's DATABASE_URL.
export default async function setup(project: TestProject) {
  loadEnvConfig(process.cwd());
  const adminUrl = process.env.DATABASE_URL;
  if (!adminUrl) {
    throw new Error("DATABASE_URL is not set — fill .env and start the dev database (docker compose -f compose.dev.yaml up -d)");
  }

  const dbName = `vd_test_${randomBytes(4).toString("hex")}`;
  const admin = new Pool({ connectionString: adminUrl, max: 1 });
  try {
    await admin.query(`create database ${dbName}`);
  } catch (error) {
    await admin.end().catch(() => undefined);
    throw new Error(
      `Cannot create a test database — is the dev Postgres running (docker compose -f compose.dev.yaml up -d)? ${String(error)}`,
    );
  }

  const url = withDatabaseName(adminUrl, dbName);
  await migrateDatabase(url);

  project.provide("testDatabaseUrl", url);

  return async () => {
    await admin.query(`drop database ${dbName} with (force)`);
    await admin.end();
  };
}
