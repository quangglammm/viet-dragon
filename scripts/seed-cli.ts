import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

// Loads the site's own data — products, shapes, materials, menus, posts, Fast Print, UI copy — into the empty
// content database, once, and writes the owner-review report.
//   pnpm seed                         seed an EMPTY content database (does nothing if there is content already)
//   pnpm seed --dry-run               do everything, write the report, then roll back (nothing is kept)
//   pnpm seed --report <path>         where to write the report (default docs/seed-report.md)
// It only READS the site's source files; it never edits them. Re-seeding means resetting the database first.

const DEFAULT_REPORT_PATH = "docs/seed-report.md";
const USAGE = `Usage: pnpm seed [--dry-run] [--report <path>]`;

interface Options {
  dryRun: boolean;
  reportPath: string;
}

function parseArgs(argv: readonly string[]): Options | null {
  const options: Options = { dryRun: false, reportPath: DEFAULT_REPORT_PATH };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--dry-run") options.dryRun = true;
    else if (argv[i] === "--report" && argv[i + 1]) options.reportPath = argv[++i];
    else return null;
  }
  return options;
}

function say(message = ""): void {
  process.stdout.write(`${message}\n`);
}

async function main(): Promise<number> {
  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    say(USAGE);
    return 2;
  }
  loadEnvConfig(process.cwd());
  // Imported after the environment is loaded: the database layer reads DATABASE_URL lazily.
  const [{ getDb, getPool }, { CLI_ACTOR, recordAudit }, { seedDatabase }, { loadSources }, { collectReport }, { renderReport }] = await Promise.all([
    import("@/lib/db"),
    import("@/lib/auth/audit"),
    import("./seed/index"),
    import("./seed/sources"),
    import("./seed/report/collect"),
    import("./seed/report/render"),
  ]);

  try {
    const src = loadSources();
    const result = await seedDatabase(getDb(), src, { dryRun: options.dryRun, inspect: (tx, outcome) => collectReport(tx, src, outcome) });
    if (result.status === "already-seeded") {
      say("The content tables already hold data, so nothing was changed. (Re-seeding needs a database reset.)");
      return 0;
    }
    const report = renderReport(result.inspection);
    await mkdir(path.dirname(options.reportPath), { recursive: true });
    await writeFile(options.reportPath, report, "utf8");
    for (const { label, rows } of result.inspection.counts) say(`${String(rows).padStart(6)}  ${label}`);
    say();
    say(`Report written to ${options.reportPath}`);
    if (result.status === "dry-run") {
      say("Dry run: everything was rolled back; the database is unchanged.");
      return 0;
    }
    await recordAudit({
      actorLabel: CLI_ACTOR,
      action: "content.seeded",
      entityType: "content",
      detail: { products: result.outcome.products.size, revisions: result.outcome.revisions, legacyRows: result.outcome.stats.legacyRows },
    });
    say("Seeded. Revision 1 of every entity was written.");
    return 0;
  } finally {
    await getPool().end();
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    process.stderr.write(`Seed failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  },
);
