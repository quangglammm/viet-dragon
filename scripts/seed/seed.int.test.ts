import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { composeEntity, listEntities } from "@/lib/content/compose";
import { composeProduct } from "@/lib/content/compose/product";
import { DRAFT_ENTITY_TYPES } from "@/lib/db/content/drafts";
import { parseDocument } from "@/lib/content/schemas";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { localizedText } from "./localized";
import { slugify } from "./util";
import { IMPORT_COMMENT } from "./steps/revisions";
import { SUGGESTION_COMMENT } from "./suggested-translations";

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
    ["post", 6], ["post_category", 3], ["site_message", 170], ["legacy_import", 41], ["media", 1010],
  ])("%s has %i rows", async (table, expected) => {
    expect(await seeded.count(table)).toBe(expected);
  });

  describe("localized URLs", () => {
    const perLanguage = async (table: string) =>
      Object.fromEntries(
        (await seeded.scratch.pool.query<{ locale: string; canonical: number; aliases: number }>(
          `select locale, count(*) filter (where is_canonical)::int canonical, count(*) filter (where not is_canonical)::int aliases from ${table} group by locale`,
        )).rows.map((r) => [r.locale, [r.canonical, r.aliases]]),
      );
    const others = (value: [number, number]) => ({ en: value, zh: value, ja: value, ko: value });

    it("gives every product, shape, option, post and category a canonical slug in every language, and keeps today's URLs as aliases", async () => {
      // canonical, aliases — Vietnamese keeps today's slugs; the other four languages carry today's slug as an alias
      expect(await perLanguage("product_slug")).toEqual({ vi: [25, 40], ...others([25, 62]) });
      expect(await perLanguage("product_segment")).toEqual({ vi: [187, 236], ...others([187, 312]) });
      expect(await perLanguage("category_slug")).toEqual({ vi: [4, 4], ...others([4, 1]) });
      expect(await perLanguage("post_slug")).toEqual({ vi: [6, 0], ...others([6, 6]) });
      const { stats } = seeded.outcome;
      expect([stats.productAliasRows, stats.segmentAliasRows, stats.categoryAliasRows]).toEqual([40 + 4 * 62, 236 + 4 * 312, 4 + 4 * 1]);
      expect(stats.droppedCrossCategoryAliases).toHaveLength(147);
    });

    it("localizes the slugs: Vietnamese as today, English from the English name, zh/ja/ko copy English", async () => {
      const slug = async (sql: string) => (await seeded.scratch.pool.query<{ locale: string; slug: string }>(sql)).rows.map((r) => `${r.locale}:${r.slug}`).sort();
      expect(await slug(`select s.locale, s.slug from product_slug s where s.is_canonical and s.category_id = 'marketing' and s.product_id = (select p.id from product p join product_slug x on x.product_id = p.id and x.slug = 'to-roi' and x.locale = 'vi' and x.is_canonical where p.category_id = 'marketing')`))
        .toEqual(["en:flyers-leaflets", "ja:flyers-leaflets", "ko:flyers-leaflets", "vi:to-roi", "zh:flyers-leaflets"]);
      expect(await slug(`select locale, slug from category_slug where category_id = 'tet' and is_canonical`))
        .toEqual(["en:tet-publications", "ja:tet-publications", "ko:tet-publications", "vi:an-pham-tet", "zh:tet-publications"]);
      expect(await slug(`select locale, slug from category_slug where category_id = 'tet' and not is_canonical`)).toEqual(["en:tet", "ja:tet", "ko:tet", "vi:tet", "zh:tet"]);
    });

    it("keeps every old Vietnamese segment working in English (except the seed's own '-2' for the duplicate tet/to-roi option)", async () => {
      const { rows } = await seeded.scratch.pool.query<{ slug: string }>(
        `select v.slug from product_segment v where v.locale = 'vi' and v.is_canonical and not exists (select 1 from product_segment e where e.product_id = v.product_id and e.locale = 'en' and e.slug = v.slug)`,
      );
      expect(rows.map((r) => r.slug)).toEqual(["giay-my-thuat-cao-cap-ep-kim-2"]);
    });

    it("never needs a non-Latin character: every slug is Latin letters, digits and dashes", async () => {
      const { rows } = await seeded.scratch.pool.query(
        `select 1 from (select slug from product_slug union all select slug from product_segment union all select slug from post_slug union all select slug from category_slug) x where slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'`,
      );
      expect(rows).toEqual([]);
    });
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

describe("revisions", () => {
  it("revision 1 of every entity is the original data; revision 2 only where zh/ja/ko text was suggested", async () => {
    const entities = await listEntities(seeded.db);
    expect(entities).toHaveLength(202);
    expect(seeded.outcome.revisions).toBe(202);
    expect(seeded.outcome.suggestionRevisions).toBe(13); // 12 traits + the Tet flyer product
    const { rows } = await seeded.scratch.pool.query<{ entity_type: string; action: string; version: number; comment: string; n: number }>(
      `select entity_type, action, version, comment, count(*)::int n from content_revision group by 1,2,3,4 order by 1,3`,
    );
    const imports = rows.filter((r) => r.version === 1);
    expect(imports.every((r) => r.action === "import" && r.comment === IMPORT_COMMENT)).toBe(true);
    expect(new Set(imports.map((r) => r.entity_type))).toEqual(new Set(DRAFT_ENTITY_TYPES));
    expect(imports.reduce((total, r) => total + r.n, 0)).toBe(202);
    const suggested = rows.filter((r) => r.version === 2);
    expect(suggested.every((r) => r.action === "update" && r.comment === SUGGESTION_COMMENT)).toBe(true);
    expect(suggested.map((r) => `${r.entity_type}:${r.n}`).sort()).toEqual(["product:1", "trait:12"]);
  });

  it("the latest revision of each entity equals the document composed from the rows now, and satisfies its schema, for all 202", async () => {
    const mismatches: string[] = [];
    for (const { type, id } of await listEntities(seeded.db)) {
      const composed = await composeEntity(seeded.db, type, id);
      const parsed = composed ? parseDocument(type, composed.document) : null;
      const identity = composed && "uid" in composed.document ? (composed.document as { uid: string }).uid : id;
      const stored = await seeded.scratch.pool.query<{ snapshot: unknown; version: number }>(
        `select snapshot, version from content_revision where entity_type = $1 and (entity_uid::text = $2 or entity_key = $2) order by version desc limit 1`,
        [type, identity],
      );
      const latest = stored.rows[0];
      if (!parsed?.success || !latest || latest.version !== composed?.version || JSON.stringify(sortKeys(latest.snapshot)) !== JSON.stringify(sortKeys(parsed.data))) mismatches.push(`${type} ${id}`);
    }
    expect(mismatches).toEqual([]);
  });
});

describe("suggested zh/ja/ko translations", () => {
  const count = async (sql: string) => Number((await seeded.scratch.pool.query(sql)).rows[0].n);

  it("make zh, ja and ko as complete as Vietnamese and English in every translated table", async () => {
    const tables: [string, string][] = [
      ["trait_i18n", "true"], ["trait_i18n", "description is not null"], ["option_bullet_i18n", "true"], ["product_i18n", "true"], ["shape_i18n", "true"],
      ["option_i18n", "name is not null"], ["material_i18n", "true"], ["category_i18n", "true"], ["post_i18n", "true"], ["unit_i18n", "true"],
      ["spec_item_i18n", "true"], ["fast_print_item_i18n", "true"], ["showcase_item_i18n", "true"], ["post_category_i18n", "true"],
    ];
    const gaps: string[] = [];
    for (const [table, filter] of tables) {
      const { rows } = await seeded.scratch.pool.query<{ locale: string; n: number }>(`select locale, count(*)::int n from ${table} where ${filter} group by locale`);
      const per = Object.fromEntries(rows.map((r) => [r.locale, r.n]));
      for (const locale of ["en", "zh", "ja", "ko"]) if (per[locale] !== per.vi) gaps.push(`${table} (${filter}) ${locale}: ${per[locale]} of ${per.vi}`);
    }
    expect(gaps).toEqual([]);
  });

  it("replace the single summarizing bullet of three Tet options, keeping the original in revision 1 and the archive", async () => {
    const productUid = [...seeded.outcome.products.values()].find((p) => p.key === "tet/to-roi")!.uid;
    const revisions = (await seeded.scratch.pool.query<{ version: number; snapshot: { options: { i18n: Record<string, { name?: string }>; bullets: { kind: string; i18n: Record<string, string> }[] }[] } }>(
      `select version, snapshot from content_revision where entity_type = 'product' and entity_uid::text = $1 order by version`,
      [productUid],
    )).rows;
    expect(revisions.map((r) => r.version)).toEqual([1, 2]);
    const bestFor = (revision: (typeof revisions)[number], name: string) =>
      revision.snapshot.options.filter((o) => o.i18n.vi?.name?.trim() === name && o.bullets.filter((b) => b.kind === "best_for").length === 3).map((o) => o.bullets.filter((b) => b.kind === "best_for").map((b) => b.i18n.zh));
    const name = "Giấy loại C 250-300gsm";
    expect(bestFor(revisions[0], name)).toEqual([["企业年终杰出员工荣誉证书、部门标兵奖状、全彩颁奖典礼", undefined, undefined]]); // original: one summary line
    expect(bestFor(revisions[1], name)[0].every((text) => typeof text === "string" && text.length > 0)).toBe(true); // suggested: three bullets
    const archived = await count(`select count(*)::int n from legacy_import where entity_type = 'subgroup' and payload::text like '%企业年终杰出员工荣誉证书%'`);
    expect(archived).toBeGreaterThanOrEqual(1);
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
      check("slugs", [document.category, document.slugs.vi.slug, document.slugs.en.slug, document.slugs.ko.slug], [sub.categoryId, sub.id, slugify(sub.titleEn), slugify(sub.titleEn)]);
      check("cover", document.cover, sub.coverImage.replace(/^\//, ""));
      check("shapes", document.shapes.map((s) => [s.slugs.vi.slug, s.slugs.en.slug, s.i18n.vi?.name, s.image]), sub.shapes.map((s) => [product.shapes.find((r) => r.source === s)!.slugs.vi, product.shapes.find((r) => r.source === s)!.slugs.en, s.nameVi, s.image.replace(/^\//, "")]));
      const byUid = new Map(document.options.map((o) => [o.uid, o]));
      check("option count", document.options.length, product.options.length);
      for (const record of product.options) {
        const option = byUid.get(record.uid);
        check(`option ${record.slugs.vi} name`, option?.i18n.vi?.name, localizedText(record.source, "name", "option", "vi")?.trim());
        check(`option ${record.slugs.vi} shape`, option?.shape ?? null, record.shapeRecord?.uid ?? null);
        check(`option ${record.slugs.vi} features`, option?.bullets.filter((b) => b.kind === "feature").map((b) => b.i18n.vi), record.source.descriptionVi);
        check(`option ${record.slugs.vi} best for`, option?.bullets.filter((b) => b.kind === "best_for").map((b) => b.i18n.vi), record.source.bestForVi);
        check(`option ${record.slugs.vi} traits`, option?.bullets.filter((b) => b.kind === "feature").map((b) => b.trait), record.source.descriptionVi.map((_, i) => record.source.descriptionTraits?.[i] ?? null)); // a bullet beyond the trait list has no icon
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
