import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT, serverImportsFrom } from "@/tests/helpers/import-graph";

// The public pages' components pick texts, choose rows and build links with these files in the browser. They must stay free of the
// database, the cache and the logger — those live in load.ts / cache.ts, which only server code calls.

const READ = join(ROOT, "lib", "content", "read");
const CLIENT_SAFE = ["text.ts", "types.ts", "selectors.ts", "urls.ts"].map((file) => join(READ, file));

describe("the read layer's browser-safe files", () => {
  it("reach no server-only module through their imports", () => {
    expect(serverImportsFrom(CLIENT_SAFE)).toEqual([]);
  });

  it("would notice a server import (the walker knows the loaders are server-only)", () => {
    expect(serverImportsFrom([join(READ, "load.ts")]).length).toBeGreaterThan(0);
  });
});
