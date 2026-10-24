import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT, filesUnder, importsOfFiles } from "@/tests/helpers/import-graph";

// The static files the content database replaced — the catalog, its translations, the four menus, the name-matching size and spec
// heuristics, the shape-alias dictionary. The seed (until it is made self-contained) and the legacy admin still read them; the public
// site must not: a publish in the admin shows on the site only if the site reads the database. This walks the import graph from every
// public entry point and fails on the first value import of one of them.

const LEGACY = [
  "data/subgroups-catalog.ts",
  "data/categories.ts",
  "data/translations.ts",
  "data/marketing-menu.ts",
  "data/office-menu.ts",
  "data/packaging-menu.ts",
  "data/tet-menu.ts",
  "lib/product-sizes.ts",
  "lib/product-specs.ts",
  "lib/shape-aliases.ts",
  "lib/image-check.ts",
  "lib/content-store.ts",
];

/** Reads that move to the database in the next milestone (showcase captions). Each entry must still be needed — the test below fails when it is not. */
const UNTIL_M3 = ["app/[locale]/products/page.tsx imports data/translations.ts"];

const entries = [
  ...filesUnder(join(ROOT, "app", "[locale]")),
  ...filesUnder(join(ROOT, "components")).filter((file) => !file.includes(`${join("components", "admin")}/`)),
  ...filesUnder(join(ROOT, "hooks")),
  ...filesUnder(join(ROOT, "i18n")),
  ...filesUnder(join(ROOT, "lib", "content", "read")),
];

describe("the public site", () => {
  it("imports none of the static sources the content database replaced (but the listed leftovers)", () => {
    expect(importsOfFiles(entries, LEGACY).filter((found) => !UNTIL_M3.includes(found))).toEqual([]);
  });

  it("really walks the graph, and keeps the leftovers list honest", () => {
    expect(entries.length).toBeGreaterThan(60);
    expect(importsOfFiles(entries, LEGACY).sort()).toEqual([...UNTIL_M3].sort());
  });
});
