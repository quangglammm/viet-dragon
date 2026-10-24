import { drizzle } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db/types";
import { createScratchDatabase, type ScratchDatabase } from "@/tests/helpers/db";
import { seedDatabase, type SeedResult } from "./index";
import { collectReport, type ReportData } from "./report/collect";
import { renderReport } from "./report/render";
import { loadSources, type Sources } from "./sources";

// seedDatabase on an EMPTY database: a dry run keeps nothing, the real run seeds once, and neither a second run nor
// a concurrent one can seed twice. Then the owner report built from the run.

let scratch: ScratchDatabase;
let db: Db;
let src: Sources;
beforeAll(async () => {
  scratch = await createScratchDatabase("seed_database");
  db = drizzle(scratch.pool);
  src = loadSources();
}, 60_000);
afterAll(async () => {
  await scratch.drop();
});

const run = (options: { dryRun?: boolean } = {}) => seedDatabase(db, src, { ...options, inspect: (tx, outcome) => collectReport(tx, src, outcome) });
const products = async (): Promise<number> => Number((await scratch.pool.query("select count(*)::int n from product")).rows[0].n);
let seeded: SeedResult<ReportData>;

describe("seedDatabase", () => {
  it("a dry run does everything, reports, and keeps nothing", async () => {
    const result = await run({ dryRun: true });
    expect(result.status).toBe("dry-run");
    expect(result.status === "dry-run" && result.inspection.counts.find((c) => c.table === "product")?.rows).toBe(25);
    expect(await products()).toBe(0);
    expect(Number((await scratch.pool.query("select count(*)::int n from media")).rows[0].n)).toBe(0);
  });

  it("two runs at the same moment seed exactly once (the advisory lock)", async () => {
    const results = await Promise.all([run(), run()]);
    expect(results.map((r) => r.status).sort()).toEqual(["already-seeded", "seeded"]);
    seeded = results.find((r) => r.status === "seeded")!;
    expect(await products()).toBe(25);
  });

  it("does nothing when the content already exists, and never merges", async () => {
    await scratch.pool.query(`update product_i18n set title = 'Chỉnh bởi biên tập viên' where locale = 'vi' and product_id = (select min(id) from product)`);
    expect((await run()).status).toBe("already-seeded");
    const { rows } = await scratch.pool.query(`select count(*)::int n from product_i18n where title = 'Chỉnh bởi biên tập viên'`);
    expect(rows[0].n).toBe(1);
    expect(await products()).toBe(25);
  });
});

describe("the owner report", () => {
  let report: string;
  beforeAll(() => {
    if (seeded.status !== "seeded") throw new Error("the seeding test did not run");
    report = renderReport(seeded.inspection);
  });

  it("is written in Vietnamese and lists all eleven decisions, each with a place to answer", () => {
    for (let number = 1; number <= 11; number += 1) expect(report).toContain(`### Quyết định ${number} — `);
    expect(report.match(/\*\*Quyết định:\*\* ☐ Đồng ý/g)).toHaveLength(11);
    expect(report).toContain("Chưa có gì thay đổi trên website");
  });

  it("states figures taken from the run, in Vietnamese number format", () => {
    expect(report).toContain("4.045 lượt hiển thị");
    expect(report).toContain("2.163 lượt");
    expect(report).toContain("147 đường dẫn đoán");
    expect(report).toContain("145 mục");
    expect(report).toContain("29 trong 110 lựa chọn");
  });

  it("counts only files nothing mentions as unused (components that hard-code an image keep theirs)", () => {
    const { unreferencedMedia, registeredMedia } = seeded.status === "seeded" ? seeded.inspection : { unreferencedMedia: [], registeredMedia: 0 };
    expect(registeredMedia).toBe(1010);
    expect(unreferencedMedia.length).toBeGreaterThan(250);
    expect(unreferencedMedia.length).toBeLessThan(350);
    expect(unreferencedMedia).not.toContain("images/category/innhanh.webp"); // hard-coded in FastPrintClient
  });

  it("has no unfilled placeholders", () => {
    for (const bad of ["undefined", "NaN", "[object", "null", "{price}{price}"]) expect(report).not.toContain(bad);
  });

  it("explains every kind of note it prints", () => {
    expect(report).not.toMatch(/\*\*[a-z]+(-[a-z]+)+\*\*/); // no raw kebab-case note names such as **traits-length-mismatch**
  });
});
