import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { digest, type PageDigest } from "./text";

// Keeps what the OLD (static) site says, page by page, from the HTML that `next build` prerendered, so the new (database) site can be
// compared with it later (`pnpm parity:compare`). Run it on the build you want to remember BEFORE changing any page:
//
//   pnpm build && pnpm parity:capture            → .parity/legacy.json (gitignored)
//
// The default language has no prefix on the site (`/products`), but its files sit under `vi/`.

const BUILD_DIR = join(".next", "server", "app");
const OUT = join(".parity", "legacy.json");
const SKIPPED = new Set(["_global-error", "_not-found"]);
const DEFAULT_LANGUAGE = "vi";

function* htmlFiles(directory: string): Generator<string> {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith(".html")) yield path;
  }
}

/** `.next/server/app/vi/products/tet.html` → `/products/tet`; `en.html` → `/en`; `vi.html` → `/`. */
export function urlOfFile(file: string): string {
  const segments = relative(BUILD_DIR, file).replace(/\.html$/, "").split("/");
  if (segments[0] === DEFAULT_LANGUAGE) segments.shift();
  return `/${segments.join("/")}`;
}

function main(): void {
  const pages: Record<string, PageDigest> = {};
  for (const file of htmlFiles(BUILD_DIR)) {
    const name = relative(BUILD_DIR, file).replace(/\.html$/, "");
    if (SKIPPED.has(name)) continue;
    pages[urlOfFile(file)] = digest(readFileSync(file, "utf8"));
  }
  const build = readFileSync(join(".next", "BUILD_ID"), "utf8").trim();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ build, capturedAt: new Date().toISOString(), pages }));
  console.log(`Kept ${Object.keys(pages).length} pages of build ${build} in ${OUT}`);
}

if (process.argv[1]?.endsWith("capture.ts")) main();
