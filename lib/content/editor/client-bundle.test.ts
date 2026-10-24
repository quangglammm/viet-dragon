import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { describe, expect, it } from "vitest";

// The editors run in the browser. A value import of the database, Better Auth's server side, the logger or a Node module — from
// anywhere in their import graph — would drag server code (and secrets' readers) into the bundle or break it. This walks the graph
// from the client components and fails on the first such import. (`import type` is erased, so it is not followed.)

const ROOT = join(__dirname, "..", "..", "..");
const ENTRY_DIR = join(ROOT, "components", "admin", "content");

const FORBIDDEN_PACKAGES = ["drizzle-orm", "pg", "better-auth", "pino", "next/headers", "next/server", "next/cache"];
const FORBIDDEN_MODULES = ["@/lib/db", "@/lib/dal", "@/lib/logger", "@/lib/env", "@/lib/auth", "@/lib/content/effects", "@/lib/content/http", "@/lib/content/drafts", "@/lib/content/publish", "@/lib/content/restore", "@/lib/content/delete", "@/lib/content/compose", "@/lib/content/summaries", "@/lib/content/used-by", "@/lib/content/validate", "@/lib/content/references", "@/lib/content/apply", "@/lib/content/vocabulary", "@/lib/content/authors", "@/lib/content/media-library"];

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

function entryFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entryFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function violations(): string[] {
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
  for (const entry of entryFiles(ENTRY_DIR)) visit(entry, entry.slice(ROOT.length + 1));
  return found;
}

describe("the editors' browser bundle", () => {
  it("reaches no server-only module through its imports", () => {
    expect(violations()).toEqual([]);
  });

  it("really walks the graph (the test would otherwise pass by scanning nothing)", () => {
    expect(entryFiles(ENTRY_DIR).length).toBeGreaterThan(15);
  });
});
