import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Integration tests against a real Postgres: a throwaway database is created from the dev server
// (`docker compose -f compose.dev.yaml up -d`), migrated from ./drizzle, and dropped afterwards.
// `pnpm test:int`.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["**/*.int.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    globalSetup: ["./tests/db-setup.ts"],
    setupFiles: ["./tests/int-env.ts"],
    // The audit_log table is append-only, so tests share one database and use unique emails/IPs
    // instead of cleaning up; running files one at a time keeps that simple.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
