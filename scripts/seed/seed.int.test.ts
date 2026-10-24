import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { composeEntity, listEntities } from "@/lib/content/compose";
import { composeProduct } from "@/lib/content/compose/product";
import { DRAFT_ENTITY_TYPES } from "@/lib/db/content/drafts";
import { parseDocument } from "@/lib/content/schemas";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { localizedText } from "./localized";
import { IMPORT_COMMENT } from "./steps/revisions";

// The seed run on the real site data, in a private database. The numbers below are the audit of today's data
// (docs/data-model.md §2); a change here means the data, or the seed's reading of it, changed.

let seeded: SeededDatabase;
beforeAll(async () => {
  seeded = await createSeededDatabase("seed");
}, 120_000);
afterAll(async () => {
  await seeded.close();
});

describe("what the seed writes", () => {
  it.each([
    ["category", 4], ["product", 25], ["shape", 77], ["option", 110], ["material", 44], ["trait", 12], ["unit", 5],
    ["spec_item", 54], ["menu_group", 24], ["menu_item", 100], ["menu_item_i18n", 145], ["fast_print_item", 6], ["showcase_item", 5],
    ["post", 6], ["post_category", 3], ["site_message", 150], ["legacy_import", 41], ["media", 1010],
  ])("%s has %i rows", async (table, expected) => {
    expect(await seeded.count(table)).toBe(expected);
  });

  it("keeps the old URLs: 40 product aliases and 236 shape / option aliases; 147 synthetic ones are dropped", () => {
    const { stats } = seeded.outcome;
    expect(stats.productAliasRows).toBe(40);
    expect(stats.segmentAliasRows).toBe(236);
    expect(stats.droppedCrossCategoryAliases).toHaveLength(147);
  });

  it("archives the original records verbatim: 25 subgroups, 4 menus, 6 posts, 6 Fast Print items", async () => {
    const rows = await seeded.scratch.pool.query<{ entity_type: string; n: number }>(`select entity_type, count(*)::int n from legacy_import group by entity_type`);
    expect(Object.fromEntries(rows.rows.map((r) => [r.entity_type, r.n]))).toEqual({ subgroup: 25, menu: 4, post: 6, fast_print: 6 });
  });

  it("leaves authorship empty (no fake user) and the SEO fields unset", async () => {
    const authored = await seeded.scratch.pool.query(`select (select count(*) from product where updated_by is not null) + (select count(*) from content_revision where author is not null) n`);
    expect(Number(authored.rows[0].n)).toBe(0);
    const seo = await seeded.scratch.pool.query(`select (select count(*) from product_i18n where seo_title is not null or seo_description is not null) + (select count(*) from product where og_media_id is not null) n`);
    expect(Number(seo.rows[0].n)).toBe(0);
  });
});

describe("revision 1 of every entity", () => {
  it("exists once per entity, as an import at version 1", async () => {
    const entities = await listEntities(seeded.db);
    expect(entities).toHaveLength(198);
    expect(seeded.outcome.revisions).toBe(198);
    const { rows } = await seeded.scratch.pool.query<{ entity_type: string; action: string; version: number; comment: string; n: number }>(
      `select entity_type, action, version, comment, count(*)::int n from content_revision group by 1,2,3,4 order by 1`,
    );
    expect(rows.every((r) => r.action === "import" && r.version === 1 && r.comment === IMPORT_COMMENT)).toBe(true);
    expect(new Set(rows.map((r) => r.entity_type))).toEqual(new Set(DRAFT_ENTITY_TYPES));
    expect(rows.reduce((total, r) => total + r.n, 0)).toBe(198);
  });

  it("equals the document composed from the rows now, and satisfies its schema, for all 198", async () => {
    const mismatches: string[] = [];
    for (const { type, id } of await listEntities(seeded.db)) {
      const composed = await composeEntity(seeded.db, type, id);
      const parsed = composed ? parseDocument(type, composed.document) : null;
      const stored = await seeded.scratch.pool.query<{ snapshot: unknown }>(
        `select snapshot from content_revision where entity_type = $1 and (entity_uid::text = $2 or entity_key = $2)`,
        [type, composed && "uid" in composed.document ? (composed.document as { uid: string }).uid : id],
      );
      if (!parsed?.success || stored.rows.length !== 1 || JSON.stringify(sortKeys(stored.rows[0].snapshot)) !== JSON.stringify(sortKeys(parsed.data))) mismatches.push(`${type} ${id}`);
    }
    expect(mismatches).toEqual([]);
  });
});

describe("composed product documents", () => {
  // Independent of the revision snapshots (which only show compose is stable): compares the documents with the source records.
  it("agree with the source data they were seeded from", async () => {
    const mismatches: string[] = [];
    for (const product of seeded.outcome.products.values()) {
      const composed = await composeProduct(seeded.db, product.uid);
      const document = composed!.document;
      const sub = product.source;
      const check = (what: string, got: unknown, want: unknown) => {
        if (JSON.stringify(got) !== JSON.stringify(want)) mismatches.push(`${product.key} ${what}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`);
      };
      check("slug", [document.category, document.slug], [sub.categoryId, sub.id]);
      check("cover", document.cover, sub.coverImage.replace(/^\//, ""));
      check("shapes", document.shapes.map((s) => [s.slug, s.i18n.vi?.name, s.image]), sub.shapes.map((s) => [product.shapes.find((r) => r.source === s)!.slug, s.nameVi, s.image.replace(/^\//, "")]));
      const byUid = new Map(document.options.map((o) => [o.uid, o]));
      check("option count", document.options.length, product.options.length);
      for (const record of product.options) {
        const option = byUid.get(record.uid);
        check(`option ${record.slug} name`, option?.i18n.vi?.name, localizedText(record.source, "name", "option", "vi")?.trim());
        check(`option ${record.slug} shape`, option?.shape ?? null, record.shapeRecord?.uid ?? null);
        check(`option ${record.slug} features`, option?.bullets.filter((b) => b.kind === "feature").map((b) => b.i18n.vi), record.source.descriptionVi);
        check(`option ${record.slug} best for`, option?.bullets.filter((b) => b.kind === "best_for").map((b) => b.i18n.vi), record.source.bestForVi);
        check(`option ${record.slug} traits`, option?.bullets.filter((b) => b.kind === "feature").map((b) => b.trait), record.source.descriptionVi.map((_, i) => record.source.descriptionTraits?.[i] ?? null)); // a bullet beyond the trait list has no icon
      }
      check("sizes per scope", new Set(document.sizes.map((z) => z.shape)).has(null), true);
    }
    expect(mismatches).toEqual([]);
  });
});

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [k, sortKeys(v)]));
  return value;
}
