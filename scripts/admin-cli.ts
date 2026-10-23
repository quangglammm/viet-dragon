import { loadEnvConfig } from "@next/env";
import { violatesPasswordPolicy } from "@/lib/auth/password";
import { CliError } from "./admin/errors";
import { promptLine } from "./admin/prompt";
import { PASSWORD_RULE } from "./admin/rules";

// Break-glass account management, run on the server with shell access (that access IS the authorization):
//   pnpm admin:create                      create an admin account — the first one, or recovery
//   pnpm admin:reset-password <email>      set a new password for any account
// In the Docker stack:  docker compose --env-file <env> run --rm admin-cli create
// Passwords are typed at a hidden prompt, twice. They are never taken from arguments or the environment.

const USAGE = `Usage:
  admin:create                    create an admin account (asks for email, name and password)
  admin:reset-password <email>    set a new password; the person must change it at their next sign-in

Docker:  docker compose --env-file /etc/vietdragon/.env run --rm admin-cli <command>`;

const MAX_PASSWORD_ATTEMPTS = 3;

function say(message = ""): void {
  process.stdout.write(`${message}\n`);
}

type Commands = typeof import("./admin/commands");

/** A new password, typed twice. A weak or mismatched pair asks again instead of throwing the operator out. */
async function askNewPassword(): Promise<string> {
  for (let attempt = 1; attempt <= MAX_PASSWORD_ATTEMPTS; attempt += 1) {
    const password = await promptLine("New password: ", { hidden: true });
    const confirmation = await promptLine("Repeat password: ", { hidden: true });
    if (violatesPasswordPolicy(password)) say(PASSWORD_RULE);
    else if (password !== confirmation) say("The two passwords do not match.");
    else return password;
  }
  throw new CliError("Too many attempts.");
}

async function runCreate(commands: Commands): Promise<void> {
  const email = await promptLine("Email: ");
  const name = await promptLine("Full name: ");
  const password = await askNewPassword();

  const admin = await commands.createAdmin({ email, name, password });
  const { getSiteEnv } = await import("@/lib/env");
  say(`Created admin ${admin.email}.`);
  say(`They can sign in at ${getSiteEnv().SITE_URL}/admin/login`);
}

async function runResetPassword(commands: Commands, email: string | undefined): Promise<void> {
  if (!email) throw new CliError(`Missing the account's email.\n\n${USAGE}`);
  const password = await askNewPassword();

  const result = await commands.resetPassword({ email, password });
  say(`Password set for ${result.email}. All their sessions were ended and they must change it at the next sign-in.`);
  if (result.banned) say("Note: this account is deactivated and stays that way — an admin can reactivate it in /admin/users.");
}

async function main(argv: string[]): Promise<void> {
  const [command, ...args] = argv;
  if (!command) return say(USAGE);
  if (command !== "create" && command !== "reset-password") throw new CliError(`Unknown command "${command}".\n\n${USAGE}`);

  // Same .env loading as `next dev` and drizzle-kit; in Docker the variables already come from compose.
  loadEnvConfig(process.cwd());
  // Better Auth and the audit writer log through pino; keep routine info lines out of an interactive session.
  process.env.LOG_LEVEL ??= "warn";

  // Imported only now, after the environment is final: these modules read it when they load.
  const commands = await import("./admin/commands");
  try {
    if (command === "create") await runCreate(commands);
    else await runResetPassword(commands, args[0]);
  } finally {
    // Close the pool so the process can end; a failure here must not hide the real outcome above.
    await (await import("@/lib/db")).getPool().end().catch(() => undefined);
  }
}

main(process.argv.slice(2)).then(
  () => process.exit(0),
  (error: unknown) => {
    if (error instanceof CliError) {
      process.stderr.write(`${error.message}\n`);
      process.exit(error.exitCode);
    }
    process.stderr.write(`Unexpected error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  },
);
