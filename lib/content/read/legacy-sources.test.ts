import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT, filesUnder, importsOfFiles } from "@/tests/helpers/import-graph";

// The static files the content database replaced — the catalog, its translations, the four menus, the name-matching size and spec
// heuristics, the shape-alias dictionary, the blog posts, the showcase and the Fast Print items — live in `scripts/seed/legacy/`, where
// only the seed reads them. The public site must not: a publish in the admin shows on the site only if the site reads the database.
// This walks the import graph from every public entry point and fails on the first value import of anything under `scripts/` (so a
// legacy file added there later is covered without touching this test).

const SCRIPTS = filesUnder(join(ROOT, "scripts")).map((file) => file.slice(ROOT.length + 1));

const entries = [
  ...filesUnder(join(ROOT, "app", "[locale]")),
  ...filesUnder(join(ROOT, "components")).filter((file) => !file.includes(`${join("components", "admin")}/`)),
  ...filesUnder(join(ROOT, "hooks")),
  ...filesUnder(join(ROOT, "i18n")),
  ...filesUnder(join(ROOT, "lib", "content", "read")),
];

describe("the public site", () => {
  it("imports nothing under scripts/ — none of the static sources the content database replaced", () => {
    expect(importsOfFiles(entries, SCRIPTS)).toEqual([]);
  });

  it("really walks the graph (the test would otherwise pass by scanning nothing)", () => {
    expect(entries.length).toBeGreaterThan(60);
    expect(SCRIPTS.some((file) => file.startsWith("scripts/seed/legacy/subgroups-catalog"))).toBe(true);
    expect(importsOfFiles(entries, ["lib/content/read/load.ts"]).length).toBeGreaterThan(0);
  });
});
