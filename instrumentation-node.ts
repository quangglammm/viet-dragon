import { assertEnv } from "@/lib/env";

// A failed `register()` alone does not stop `next start`: the process stays up and answers
// every request with 500 — a container that never restarts. Exit so Docker's restart policy
// and `depends_on` see a hard failure. Plain stderr, not the logger: it reads this same env.
export function validateEnvOrExit(): void {
  try {
    assertEnv();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
