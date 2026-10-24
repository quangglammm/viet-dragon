import { sql } from "drizzle-orm";
import type { Tx } from "@/lib/db/types";
import type { SeedOutcome } from "../run";
import { LOCALES, type Locale } from "../localized";
import { readSizesAndSpecs, replayCardCalls, type ReplayMeasure } from "../measures";
import type { Sources } from "../sources";

// Everything the owner report states, read from the run itself — never typed in. Collected inside the seed
// transaction so a dry run can still produce a complete report before it rolls back.

export interface TableCount {
  table: string;
  label: string;
  rows: number;
}

export interface CoverageRow {
  label: string;
  /** Rows per language; the Vietnamese count is what the others are measured against. */
  perLocale: Record<Locale, number>;
}

export interface IconUsage {
  name: string;
  options: number;
  cardCanDraw: boolean;
}

export interface ReportData {
  generatedOn: string;
  outcome: SeedOutcome;
  counts: TableCount[];
  coverage: CoverageRow[];
  replay: ReplayMeasure;
  icons: IconUsage[];
  /** Options that carry any price, foil/double-sided switch; shapes that carry a badge. Fields no page shows today. */
  dormant: { optionsWithPrice: number; optionsWithSwitch: number; shapesWithBadge: number; options: number };
  unreferencedMedia: string[];
  registeredMedia: number;
}

const COUNTED_TABLES: [string, string][] = [
  ["category", "Danh mục"], ["product", "Sản phẩm (mỗi danh mục tính riêng)"], ["shape", "Hình thức"], ["option", "Lựa chọn chất liệu của sản phẩm"],
  ["material", "Loại chất liệu (giấy…) dùng chung"], ["trait", "Đặc điểm chất liệu (biểu tượng + mô tả)"], ["spec_item", "Mục thông số (công nghệ in, hoàn thiện, chất liệu gợi ý)"],
  ["size_option", "Mức kích thước"], ["menu_group", "Nhóm trong menu"], ["menu_item", "Mục trong menu"], ["unit", "Đơn vị tính"],
  ["fast_print_item", "Sản phẩm in nhanh"], ["showcase_item", "Ảnh trưng bày"], ["post", "Bài viết blog"], ["site_message", "Khối văn bản giao diện (nhóm × ngôn ngữ)"],
  ["product_slug", "Đường dẫn sản phẩm (gồm cả đường dẫn cũ)"], ["product_segment", "Đường dẫn hình thức / chất liệu (gồm cả đường dẫn cũ)"],
  ["media", "Tệp ảnh và video đã đăng ký"], ["legacy_import", "Bản gốc lưu nguyên văn để đối chiếu"], ["content_revision", "Phiên bản đầu tiên của từng mục"],
];

const COVERAGE_TABLES: [string, string, string][] = [
  ["product_i18n", "Tiêu đề sản phẩm", "true"],
  ["shape_i18n", "Tên hình thức", "true"],
  ["option_i18n", "Tên lựa chọn chất liệu", "name is not null"],
  ["material_i18n", "Tên loại chất liệu", "true"],
  ["trait_i18n", "Tên đặc điểm chất liệu", "true"],
  ["trait_i18n", "Mô tả đặc điểm chất liệu", "description is not null"],
  ["option_bullet_i18n", "Gạch đầu dòng mô tả / phù hợp cho", "true"],
  ["category_i18n", "Tên danh mục", "true"],
  ["post_i18n", "Bài viết", "true"],
];

async function scalar(tx: Tx, query: ReturnType<typeof sql>): Promise<number> {
  const { rows } = await tx.execute<{ n: number }>(query);
  return Number(rows[0].n);
}

async function coverage(tx: Tx): Promise<CoverageRow[]> {
  const result: CoverageRow[] = [];
  for (const [table, label, filter] of COVERAGE_TABLES) {
    const { rows } = await tx.execute<{ locale: string; n: number }>(sql.raw(`select locale, count(*)::int n from ${table} where ${filter} group by locale`));
    const perLocale = Object.fromEntries(LOCALES.map((l) => [l, Number(rows.find((r) => r.locale === l)?.n ?? 0)])) as Record<Locale, number>;
    result.push({ label, perLocale });
  }
  return result;
}

function iconUsage(src: Sources, outcome: SeedOutcome): IconUsage[] {
  const counts = new Map<string, number>();
  for (const product of outcome.products.values()) {
    for (const option of product.options) if (option.source.icon) counts.set(option.source.icon, (counts.get(option.source.icon) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([name, options]) => ({ name, options, cardCanDraw: src.cardIcons.has(name) }));
}

export async function collectReport(tx: Tx, src: Sources, outcome: SeedOutcome): Promise<ReportData> {
  const counts: TableCount[] = [];
  for (const [table, label] of COUNTED_TABLES) counts.push({ table, label, rows: await scalar(tx, sql.raw(`select count(*)::int n from ${table}`)) });
  const readback = await readSizesAndSpecs(tx);
  return {
    generatedOn: new Date().toISOString().slice(0, 10),
    outcome,
    counts,
    coverage: await coverage(tx),
    replay: replayCardCalls(src, outcome.products.values(), readback),
    icons: iconUsage(src, outcome),
    dormant: {
      options: await scalar(tx, sql`select count(*)::int n from option`),
      optionsWithPrice: await scalar(tx, sql`select count(*)::int n from option where base_price is not null or double_sided_price is not null or foil_price is not null or foil2_price is not null`),
      optionsWithSwitch: await scalar(tx, sql`select count(*)::int n from option where hide_foil or hide_double_sided`),
      shapesWithBadge: await scalar(tx, sql`select count(distinct shape_id)::int n from shape_i18n where badge is not null`),
    },
    // A file counts as used when a seeded row points at it OR some source file mentions its path (hero, About… hard-code theirs).
    unreferencedMedia: [...outcome.media.registered.keys()].filter((key) => !outcome.media.referenced.has(key) && !src.mediaReferences.has(key)).sort(),
    registeredMedia: outcome.media.registered.size,
  };
}
