import { loadEnvConfig } from "@next/env";
import { createAuth } from "./auth";

// Entry point for the Better Auth CLI only (`pnpm auth:schema`). The CLI needs an `auth` instance
// exported at load time, which the app deliberately avoids (see getAuth()); it also runs outside
// Next, so load .env* the same way Next does.
loadEnvConfig(process.cwd());

export const auth = createAuth();
