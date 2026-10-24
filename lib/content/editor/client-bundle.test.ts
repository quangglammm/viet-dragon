import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT, filesUnder, serverImportsFrom } from "@/tests/helpers/import-graph";

// The editors run in the browser. A value import of the database, Better Auth's server side, the logger or a Node module — from
// anywhere in their import graph — would drag server code (and secrets' readers) into the bundle or break it. This walks the graph
// from the client components and fails on the first such import (see tests/helpers/import-graph.ts).

const ENTRY_DIR = join(ROOT, "components", "admin", "content");

describe("the editors' browser bundle", () => {
  it("reaches no server-only module through its imports", () => {
    expect(serverImportsFrom(filesUnder(ENTRY_DIR))).toEqual([]);
  });

  it("really walks the graph (the test would otherwise pass by scanning nothing)", () => {
    expect(filesUnder(ENTRY_DIR).length).toBeGreaterThan(15);
  });
});
