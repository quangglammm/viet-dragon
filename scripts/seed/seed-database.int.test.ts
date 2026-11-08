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

  it("puts Vietnamese and English first: eight decisions, the URL system leading, each with a place to answer", () => {
    for (let number = 1; number <= 8; number += 1) expect(report).toContain(`### Quyết định ${number} — `);
    expect(report).not.toContain("### Quyết định 9 — ");
    expect(report.match(/\*\*Quyết định:\*\* ☐ Đồng ý/g)).toHaveLength(8);
    expect(report).toContain("### Quyết định 1 — Hệ thống đường dẫn (URL) theo từng ngôn ngữ");
    expect(report).toContain("Chưa có gì thay đổi trên website");
    expect(report.indexOf("## 2. Tiếng Việt và English")).toBeLessThan(report.indexOf("## 3. Tiếng Trung, tiếng Nhật, tiếng Hàn"));
    expect(report.indexOf("## 3. ")).toBeLessThan(report.indexOf("## 4. Ghi chú kỹ thuật"));
  });

  it("proposes the localized URLs: fixed words, categories and every product in Vietnamese and English", () => {
    for (const expected of [
      "| Sản phẩm | /san-pham | /products |", "| Blog | /bai-viet | /blog |", "| `tet` | /an-pham-tet | /tet-publications |",
      "`/products/marketing/to-roi` | `/san-pham/tiep-thi/to-roi` | `/en/products/marketing/flyers-leaflets`",
      "toàn bộ đường dẫn tiếng Việt sẽ đổi",
    ]) expect(report).toContain(expected);
    expect(report.match(/\| `\/products\/[a-z]+\/[a-z0-9-]+` \| `\/san-pham\//g)).toHaveLength(25);
  });

  it("makes clear that Chinese, Japanese and Korean need no decision now, and lists every suggested text for review", () => {
    expect(report).toContain("Không cần chủ shop quyết định các mục này bây giờ");
    expect(report).toContain("### Phụ lục D — bản dịch đề xuất bằng AI (99 đoạn)");
    for (const sample of ["`glossy-coat` — tên", "亮面涂层", "グロスコート", "유광 코팅", "Giấy loại C 250-300gsm (dòng 3)"]) expect(report).toContain(sample);
    expect(report.match(/\| ☐ \|/g)).toHaveLength(24 + 9);
    for (const appendix of ["Phụ lục A", "Phụ lục B", "Phụ lục C", "Phụ lục D"]) expect(report).toContain(`### ${appendix}`);
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
    // Was 250-350 while the old admin's catalog snapshots (data/content/{products,subgroups}.json, last edited 2026-10-11 and superseded by
    // later edits of subgroups-catalog.ts) still mentioned ~320 photos nothing shows; with the snapshots deleted those count as unused too.
    expect(unreferencedMedia.length).toBeGreaterThan(550);
    expect(unreferencedMedia.length).toBeLessThan(650);
    expect(unreferencedMedia).not.toContain("images/category/innhanh.webp"); // hard-coded in FastPrintClient
  });

  it("has no unfilled placeholders", () => {
    for (const bad of ["undefined", "NaN", "[object", "null", "{price}{price}"]) expect(report).not.toContain(bad);
  });

  it("explains every kind of note it prints", () => {
    expect(report).not.toMatch(/\*\*[a-z]+(-[a-z]+)+\*\*/); // no raw kebab-case note names such as **traits-length-mismatch**
  });
});
