import { randomBytes } from "node:crypto";
import { inject } from "vitest";

// Runs in every integration test file before it imports app code: point the app at the throwaway
// database and give it a per-run secret (never a literal in source).
process.env.DATABASE_URL = inject("testDatabaseUrl");
process.env.BETTER_AUTH_SECRET = randomBytes(32).toString("hex");
process.env.SITE_URL = "http://localhost:3000";
