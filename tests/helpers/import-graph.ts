import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

// Walks the value-import graph of browser code and reports the first import of anything that must stay on the server: the database,
// Better Auth's server side, the logger, the environment reader, Node modules, Next's server APIs, and the services that use them.
// `import type` is erased by the compiler, so it is not followed.

export const ROOT = join(__dirname, "..", "..");

const FORBIDDEN_PACKAGES = ["drizzle-orm", "pg", "better-auth", "pino", "next/headers", "next/server", "next/cache"];
const FORBIDDEN_MODULES = [
  "@/lib/db", "@/lib/dal", "@/lib/logger", "@/lib/env", "@/lib/auth", "@/lib/content/effects", "@/lib/content/http", "@/lib/content/drafts", "@/lib/content/publish", "@/lib/content/restore",
  "@/lib/content/delete", "@/lib/content/compose", "@/lib/content/summaries", "@/lib/content/used-by", "@/lib/content/validate", "@/lib/content/references", "@/lib/content/apply",
  "@/lib/content/vocabulary", "@/lib/content/authors", "@/lib/content/media-library", "@/lib/content/read/load", "@/lib/content/read/cache",
];

const IMPORT = /^\s*import\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']|^\s*export\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/gm;

function resolve(from: string, specifier: string): string | null {
  const base = specifier.startsWith("@/") ? join(ROOT, specifier.slice(2)) : specifier.startsWith(".") ? join(dirname(from), specifier) : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(candidate) && !candidate.endsWith("/")) {
      try {
        readFileSync(candidate);
        return candidate;
      } catch {
        // a directory: try the next candidate
      }
    }
  }
  return null;
}

/** Every non-test TypeScript file under a directory. */
export function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(path);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

/** What the browser would pull in from the server by following the imports of these files. */
export function serverImportsFrom(entries: readonly string[]): string[] {
  const seen = new Set<string>();
  const found: string[] = [];
  const visit = (file: string, via: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const match of readFileSync(file, "utf8").matchAll(IMPORT)) {
      const specifier = match[1] ?? match[2];
      const where = `${file.slice(ROOT.length + 1)} imports ${specifier} (via ${via})`;
      if (FORBIDDEN_PACKAGES.some((name) => specifier === name || specifier.startsWith(`${name}/`)) || specifier.startsWith("node:")) found.push(where);
      else if (FORBIDDEN_MODULES.some((name) => specifier === name || (specifier.startsWith(`${name}/`) && name !== "@/lib/auth"))) found.push(where);
      else {
        const target = resolve(file, specifier);
        if (target) visit(target, via);
      }
    }
  };
  for (const entry of entries) visit(entry, entry.slice(ROOT.length + 1));
  return found;
}

/**
 * Value imports, anywhere in the graph below these files, of the given files (relative to the repository root). Used to keep the public
 * site off the static sources the content database replaced.
 */
export function importsOfFiles(entries: readonly string[], files: readonly string[]): string[] {
  const wanted = new Set(files.map((file) => join(ROOT, file)));
  const seen = new Set<string>();
  const found: string[] = [];
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const match of readFileSync(file, "utf8").matchAll(IMPORT)) {
      const specifier = match[1] ?? match[2];
      const target = resolve(file, specifier);
      if (!target) continue;
      if (wanted.has(target)) found.push(`${file.slice(ROOT.length + 1)} imports ${target.slice(ROOT.length + 1)}`);
      else visit(target);
    }
  };
  for (const entry of entries) visit(entry);
  return found;
}
