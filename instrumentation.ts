import type { Instrumentation } from "next";

// Node-only code lives behind positive NEXT_RUNTIME checks and dynamic imports so the
// Edge bundle never pulls in pino or `process.exit`.

// Fail fast: refuse to start the server with a missing or weak configuration.
// Skipped for `next build` — the Docker build stage deliberately has no secrets.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { validateEnvOrExit } = await import("./instrumentation-node");
    validateEnvOrExit();
  }
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logRequestError } = await import("@/lib/logger");
    logRequestError(...args);
  }
};
