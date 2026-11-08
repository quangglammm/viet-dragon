import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { getDatabaseEnv } from "./lib/env";

// drizzle-kit runs outside Next, so load .env* the same way Next does.
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: getDatabaseEnv().DATABASE_URL },
});
