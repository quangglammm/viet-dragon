import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupContentDb, type ContentDb } from "@/tests/helpers/content-db";

// Second half of the content-schema suite (see content-schema.int.test.ts for the conventions): referential
// integrity, drafts and revisions, attempts to bypass the integrity triggers, the default-language rule,
// cascades, the read-path fallback, and the SEO / Open Graph columns added in Phase 3a.

let db: ContentDb;
beforeAll(async () => {
  db = await setupContentDb("integrity");
});
afterAll(async () => {
  await db.close();
});

type Rejection = readonly [name: string, sql: string | readonly string[], code: string, reason: string];
const itRejects = (cases: readonly Rejection[]) =>
  it.each(cases)("refuses %s", async (_name, sql, code, reason) => {
    await db.rejects(sql, code, reason);
  });

/** Inserts the same row in every language: `table (locale, columns) select code, values from locale`. */
const everyLanguage = (table: string, columns: string, values: string) => `insert into ${table} (locale,${columns}) select code,${values} from locale`;

describe("referential integrity", () => {
  itRejects([
    ["an option scoped to a shape of ANOTHER product", `insert into option (product_id,shape_id,material_id,position) values (3,1,2,0)`, "23503", "option_shape_product_fk"],
    ["a size scoped to a shape of another product", `insert into size_option (product_id,shape_id,tier,width_mm,height_mm) values (3,1,'small',1,1)`, "23503", "size_option_shape_fk"],
    ["a spec list scoped to a shape of another product", `insert into product_spec (product_id,shape_id,spec_item_id,position) values (3,1,1,0)`, "23503", "product_spec_shape_fk"],
    ["an option photo that is a VIDEO", `insert into option_image values (1,'default',5,3,'image')`, "23503", "option_image_media_fk"],
    ["a translation for an unknown locale", `insert into product_i18n values (1,'xx','t',null)`, "23503", "product_i18n_locale_locale_code_fk"],
    ["deleting a media row still in use", `delete from media where id=1`, "23503", "violates foreign key"],
    ["deleting a material still offered", `delete from material where id=1`, "23503", "option_material_id_material_id_fk"],
    ["deleting a unit still referenced", `delete from unit where key='box'`, "23503", "option_unit_key_unit_key_fk"],
    ["deleting a trait still used by a bullet", `delete from trait where key='glossy-coat'`, "23503", "option_bullet_trait_key_trait_key_fk"],
    ["deleting a spec item still assigned", `delete from spec_item where id=1`, "23503", "product_spec_spec_item_id_spec_item_id_fk"],
    ["deleting a SHAPE that is still in a menu", `delete from shape where id=1`, "23503", "menu_item_shape_fk"],
    ["deleting an OPTION that is still in a menu", `delete from option where id=1`, "23503", "menu_item_option_fk"],
    ["a menu item pointing at a shape of another product", `insert into menu_item (product_id,position,shape_id) values (1,5,3)`, "23503", "menu_item_shape_fk"],
    ["a menu item with both or no target", `insert into menu_item (product_id,position) values (1,6)`, "23514", "menu_item_one_target"],
    ["deleting a user who authored content (users are deactivated, never deleted)", `delete from app_user where id='u1'`, "23503", "violates foreign key"],
  ]);

  // PostgreSQL reports a RESTRICT violation with the same SQLSTATE as any other foreign-key violation (23503; the
  // PGlite 18 spike saw 23001), so the code cannot tell RESTRICT from NO ACTION: read the delete action from the catalog.
  it("protects media, library and category references with ON DELETE RESTRICT", async () => {
    const protectedKeys = [
      "option_material_id_material_id_fk",
      "option_unit_key_unit_key_fk",
      "option_bullet_trait_key_trait_key_fk",
      "product_spec_spec_item_id_spec_item_id_fk",
      "product_cover_media_id_media_id_fk",
      "option_image_media_fk",
      "product_og_media_fk",
      "product_category_id_category_id_fk",
      "product_slug_category_id_category_id_fk",
      "post_category_key_post_category_key_fk",
    ];
    const rows = await db.rows<{ conname: string; confdeltype: string }>(
      `select conname, confdeltype from pg_constraint where conname in (${protectedKeys.map((k) => `'${k}'`).join(",")})`,
    );
    expect(rows.map((r) => r.conname).sort()).toEqual([...protectedKeys].sort());
    expect(rows.filter((r) => r.confdeltype !== "r")).toEqual([]);
  });

  it("makes the menu foreign keys deferrable, so deleting a whole product still works", async () => {
    const rows = await db.rows<{ conname: string; condeferrable: boolean; condeferred: boolean }>(
      `select conname, condeferrable, condeferred from pg_constraint where conname in ('menu_item_shape_fk','menu_item_option_fk')`,
    );
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.condeferrable && r.condeferred)).toBe(true);
  });
});

describe("drafts and revisions: identity by uid / immutable key", () => {
  const draftOf = (id: number) =>
    `insert into content_draft (entity_type,entity_uid,base_version,snapshot) select 'product',uid,1,jsonb_build_object('uid',uid::text) from product where id=${id}`;

  itRejects([
    ["a second draft for the same product uid", [draftOf(1), draftOf(1)], "23505", "content_draft_type_uid_unique"],
    ["a second draft for the same library key", `insert into content_draft (entity_type,entity_key,base_version,snapshot) values ('material','giay-kraft',1,'{"key":"giay-kraft"}'),('material','giay-kraft',1,'{"key":"giay-kraft"}')`, "23505", "content_draft_type_key_unique"],
    ["a draft naming neither uid nor key", `insert into content_draft (entity_type,snapshot) values ('product','{}')`, "23514", "content_draft_uid_xor_key"],
    ["a draft naming both uid and key", `insert into content_draft (entity_type,entity_uid,entity_key,snapshot) values ('product',gen_random_uuid(),'k','{}')`, "23514", "content_draft_uid_xor_key"],
    ["an unknown draft entity type", `insert into content_draft (entity_type,entity_key,snapshot) values ('banana','k','{}')`, "23514", "content_draft_entity_type_valid"],
    ["a draft snapshot that is not a JSON object", `insert into content_draft (entity_type,entity_key,snapshot) values ('material','m','[]')`, "23514", "content_draft_snapshot_object"],
    ["a duplicate revision number for the same entity", [`insert into content_revision (entity_type,entity_uid,version,snapshot) select 'product',uid,1,jsonb_build_object('uid',uid::text) from product where id=2`, `insert into content_revision (entity_type,entity_uid,version,snapshot) select 'product',uid,1,jsonb_build_object('uid',uid::text) from product where id=2`], "23505", "content_revision_type_uid_version_unique"],
  ]);

  it("lets several brand-new drafts coexist, each with its own pre-assigned uid", async () => {
    const counts = await db.withRollback(async (c) => {
      await c.query(`insert into content_draft (entity_type,entity_uid,base_version,snapshot) select 'product',u,null,jsonb_build_object('uid',u::text) from (select gen_random_uuid() u union all select gen_random_uuid()) x`);
      return (await c.query(`select count(*)::int n, count(distinct entity_uid)::int u from content_draft where base_version is null`)).rows[0];
    });
    expect(counts).toEqual({ n: 2, u: 2 });
  });

  it("lets a deleted product's URL be re-created: the new product has a new uid, so old revisions never collide", async () => {
    await db.accepts(
      `insert into content_revision (entity_type,entity_uid,version,snapshot) select 'product',uid,1,jsonb_build_object('uid',uid::text) from product where id=2;
       delete from product where id=2;
       insert into product (category_id,position) values ('tet',0);
       ${everyLanguage("product_slug", "category_id,slug,product_id,is_canonical", "'tet','to-roi',(select max(id) from product),true")};
       insert into product_i18n values ((select max(id) from product),'vi','Mới',null);
       insert into content_revision (entity_type,entity_uid,version,snapshot) select 'product',uid,1,jsonb_build_object('uid',uid::text) from product order by id desc limit 1`,
    );
  });

  itRejects([
    ["a product draft filed under X carrying Y's document", `insert into content_draft (entity_type,entity_uid,snapshot) select 'product',(select uid from product where id=1),jsonb_build_object('uid',(select uid::text from product where id=3))`, "23514", "content_draft_snapshot_uid"],
    ["a library draft whose document key differs from the key it is filed under", `insert into content_draft (entity_type,entity_key,snapshot) values ('material','giay-kraft','{"key":"giay-loai-c"}')`, "23514", "content_draft_snapshot_key"],
    ["a revision filed under X carrying Y's document", `insert into content_revision (entity_type,entity_uid,version,snapshot) select 'product',(select uid from product where id=3),9,jsonb_build_object('uid',(select uid::text from product where id=1))`, "23514", "content_revision_snapshot_uid"],
  ]);

  it("removes draft_reference rows with their draft (cascade)", async () => {
    const left = await db.withRollback(async (c) => {
      await c.query(`insert into content_draft (entity_type,entity_key,base_version,snapshot) values ('menu','tet',1,'{"key":"tet"}')`);
      await c.query(`insert into draft_reference select id,'material','giay-kraft' from content_draft where entity_key='tet'`);
      await c.query(`delete from content_draft where entity_key='tet'`);
      return (await c.query(`select count(*)::int n from draft_reference`)).rows[0].n;
    });
    expect(left).toBe(0);
  });
});

describe("the integrity triggers cannot be bypassed", () => {
  itRejects([
    ["UPDATE product_slug: hand a canonical URL to another product (would orphan the first)", `update product_slug set product_id=3, is_canonical=false where product_id=1 and is_canonical`, "23514", "product_slug.product_id is immutable"],
    ["INSERT … ON CONFLICT DO UPDATE SET product_id (steal a URL)", `insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('vi','marketing','poster',1,false) on conflict (locale,category_id,slug) do update set product_id=excluded.product_id`, "23514", "product_slug.product_id is immutable"],
    ["UPDATE product_segment: retarget a canonical shape segment onto an option", `update product_segment set shape_id=null, option_id=3 where shape_id=1 and is_canonical`, "23514", "product_segment.shape_id is immutable"],
    ["UPDATE product_segment: move an option's canonical segment to another option", `update product_segment set option_id=3 where option_id=1 and is_canonical`, "23514", "product_segment.option_id is immutable"],
    ["UPDATE post_slug: move a post's slug to another post", [`insert into post (category_key,published_on) values ('tips','2026-03-03'); insert into post_i18n values ((select max(id) from post),'vi','T',null,'C'); ${everyLanguage("post_slug", "slug,post_id,is_canonical", "'bai-2',(select max(id) from post),true")}`, `update post_slug set post_id=(select min(id) from post) where slug='bai-2'`], "23514", "post_slug.post_id is immutable"],
    ["TRUNCATE product_slug", `truncate product_slug`, "42501", "TRUNCATE of product_slug is not allowed"],
    ["TRUNCATE product CASCADE (it reaches product_slug and product_segment)", `truncate product cascade`, "42501", "is not allowed"],
    ["TRUNCATE category_slug", `truncate category_slug`, "42501", "TRUNCATE of category_slug is not allowed"],
    ["TRUNCATE content_revision", `truncate content_revision`, "42501", "TRUNCATE of content_revision is not allowed"],
    ["TRUNCATE legacy_import", `truncate legacy_import`, "42501", "TRUNCATE of legacy_import is not allowed"],
  ]);

  const FLIP = `update product_slug set is_canonical=false where category_id='marketing' and slug='poster'; ${everyLanguage("product_slug", "category_id,slug,product_id,is_canonical", "'marketing','poster-moi',3,true")}`;
  it("still allows flipping which of ONE product's slugs is canonical", async () => {
    await db.accepts(FLIP);
  });
  it("still allows ON CONFLICT DO UPDATE that leaves the owner unchanged", async () => {
    await db.accepts([
      FLIP,
      `insert into product_slug (locale,category_id,slug,product_id,is_canonical) select code,'marketing','poster-moi',3,true from locale on conflict (locale,category_id,slug) do update set is_canonical=excluded.is_canonical`,
    ]);
  });
});

describe("the default language is required (checked at COMMIT)", () => {
  itRejects([
    ["a product with no Vietnamese translation", `insert into product (category_id,position) values ('marketing',40); ${everyLanguage("product_slug", "category_id,slug,product_id,is_canonical", "'marketing','khong-vi',(select max(id) from product),true")}; insert into product_i18n values ((select max(id) from product),'en','English only',null)`, "23514", `has no "vi" (default language) translation`],
    ["a product with no translation at all", `insert into product (category_id,position) values ('marketing',41); ${everyLanguage("product_slug", "category_id,slug,product_id,is_canonical", "'marketing','khong-ten',(select max(id) from product),true")}`, "23514", `has no "vi" (default language) translation`],
    ["deleting the only Vietnamese row of a product", `delete from product_i18n where product_id=1 and locale='vi'`, "23514", `has no "vi" (default language) translation`],
    ["re-labelling the Vietnamese row as another language", `update product_i18n set locale='ja' where product_id=1 and locale='vi'`, "23514", `has no "vi" (default language) translation`],
    ["a material without a Vietnamese name", `insert into material (slug) values ('chi-en'); insert into material_i18n select id,'en','English' from material where slug='chi-en'`, "23514", `has no "vi" (default language) translation`],
    ["a category without a Vietnamese name", `insert into category (id,icon,position) values ('khac','Layers',9); ${everyLanguage("category_slug", "slug,category_id,is_canonical", "'khac','khac',true")}; insert into category_i18n values ('khac','en','Other',null)`, "23514", `has no "vi" (default language) translation`],
    ["a unit without a Vietnamese label", `insert into unit (key) values ('pack'); insert into unit_i18n values ('pack','en','Pack')`, "23514", `has no "vi" (default language) translation`],
    ["a Fast Print item without a Vietnamese name", `insert into fast_print_item (key,icon,position) values ('hop','Zap',0)`, "23514", `has no "vi" (default language) translation`],
    ["a post category without a Vietnamese label", `insert into post_category (key) values ('news')`, "23514", `has no "vi" (default language) translation`],
    ["a category id 'fast-print' (it is a static route)", `insert into category (id,icon,position) values ('fast-print','Zap',9); insert into category_i18n values ('fast-print','vi','x',null)`, "23514", "category_id_not_fast_print"],
    ["a menu_group_i18n row with neither label nor description", `insert into menu_group_i18n (product_id,locale) values (1,'vi')`, "23514", "menu_group_i18n_not_empty"],
  ]);

  it("allows replacing the Vietnamese row inside one transaction", async () => {
    await db.accepts(`delete from product_i18n where product_id=3 and locale='vi'; insert into product_i18n values (3,'vi','Poster mới',null)`);
  });
});

describe("cascades", () => {
  it("deleting a product that appears in a menu removes it cleanly, with everything it owns", async () => {
    const counts = async (c: { query: (sql: string) => Promise<{ rows: Record<string, number>[] }> }) =>
      (await c.query(`select (select count(*)::int from shape) s,(select count(*)::int from option) o,(select count(*)::int from option_bullet) b,(select count(*)::int from option_image) i,(select count(*)::int from size_option) z,(select count(*)::int from product_spec) sp,(select count(*)::int from menu_item) mi,(select count(*)::int from media) m`)).rows[0];
    const { before, after } = await db.withRollback(async (c) => {
      const b = await counts(c);
      await c.query(`delete from product where id=1`);
      await c.query(`set constraints all immediate`); // the deferred menu foreign keys must accept this
      return { before: b, after: await counts(c) };
    });
    expect(before).toMatchObject({ s: 3, o: 4, b: 2, i: 1, z: 3, sp: 2, mi: 2, m: 3 });
    // product 1 owned shapes 1-2, options 1-3, both bullets, the photo, two sizes, both specs, its menu rows
    expect(after).toMatchObject({ s: 1, o: 1, b: 0, i: 0, z: 1, sp: 0, mi: 0, m: 3 });
  });
});

describe("the read path", () => {
  it("falls back ja → en → vi per row", async () => {
    const rows = await db.withRollback(async (c) => {
      await c.query(`insert into product (category_id,position) values ('marketing',5); ${everyLanguage("product_slug", "category_id,slug,product_id,is_canonical", "'marketing','poster2',(select max(id) from product),true")}; insert into product_i18n values ((select max(id) from product),'vi','Chỉ tiếng Việt',null),((select max(id) from product),'en','English only',null)`);
      await c.query(`insert into product_i18n values (3,'en','Poster EN',null)`);
      return (
        await c.query(
          `select ps.slug, coalesce(l.title, e.title, v.title) title from product p join product_slug ps on ps.product_id=p.id and ps.is_canonical and ps.locale='vi' left join product_i18n l on l.product_id=p.id and l.locale='ja' left join product_i18n e on e.product_id=p.id and e.locale='en' left join product_i18n v on v.product_id=p.id and v.locale='vi' where ps.slug in ('poster','poster2') order by ps.slug`,
        )
      ).rows;
    });
    expect(rows).toEqual([
      { slug: "poster", title: "Poster EN" },
      { slug: "poster2", title: "English only" },
    ]);
  });
});

describe("SEO and Open Graph fields", () => {
  const SEO_TABLES: ReadonlyArray<readonly [table: string, owner: string, ownerId: string]> = [
    ["product_i18n", "product_id", "1"],
    ["category_i18n", "category_id", "'marketing'"],
    ["shape_i18n", "shape_id", "1"],
    ["option_i18n", "option_id", "1"],
    ["post_i18n", "post_id", "1"],
  ];

  it.each(SEO_TABLES)("refuses a blank seo_title on %s", async (table, owner, ownerId) => {
    await db.rejects(`update ${table} set seo_title = E'\\u00a0 ' where ${owner} = ${ownerId} and locale = 'vi'`, "23514", `${table}_seo_title_nonblank`);
  });
  it.each(SEO_TABLES)("refuses a blank seo_description on %s", async (table, owner, ownerId) => {
    await db.rejects(`update ${table} set seo_description = '' where ${owner} = ${ownerId} and locale = 'vi'`, "23514", `${table}_seo_description_nonblank`);
  });
  it.each(SEO_TABLES)("accepts a real seo_title and seo_description on %s", async (table, owner, ownerId) => {
    await db.accepts(`update ${table} set seo_title = 'Tiêu đề SEO', seo_description = 'Mô tả SEO' where ${owner} = ${ownerId} and locale = 'vi'`);
  });

  it("lets an option language carry only its SEO text", async () => {
    await db.accepts(`insert into option_i18n (option_id,locale,seo_title) values (2,'vi','Chỉ SEO')`);
  });

  const OG_TABLES: ReadonlyArray<readonly [table: string, where: string]> = [
    ["product", "id = 1"],
    ["category", "id = 'marketing'"],
    ["shape", "id = 1"],
    ["option", "id = 1"],
    ["post", "id = 1"],
  ];
  it.each(OG_TABLES)("accepts an image as the Open Graph image of %s", async (table, where) => {
    await db.accepts(`update ${table} set og_media_id = 2 where ${where}`);
  });
  it.each(OG_TABLES)("refuses a VIDEO as the Open Graph image of %s", async (table, where) => {
    await db.rejects(`update ${table} set og_media_id = 3 where ${where}`, "23503", `${table}_og_media_fk`);
  });
  it.each(OG_TABLES)("refuses changing og_media_kind on %s (it is always 'image')", async (table, where) => {
    await db.rejects(`update ${table} set og_media_kind = 'video' where ${where}`, "23514", `${table}_og_media_kind_image`);
  });
  it("refuses deleting a media file that is an Open Graph image", async () => {
    // a media row of its own: media 2 is also a product cover, which would refuse the delete for a different reason
    await db.rejects(
      [
        `insert into media (source,storage_key,kind,mime,bytes) values ('static','images/og.webp','image','image/webp',1); update product set og_media_id = (select max(id) from media) where id = 1`,
        `delete from media where storage_key = 'images/og.webp'`,
      ],
      "23503",
      "product_og_media_fk",
    );
  });
});

describe("site-wide facts and UI copy", () => {
  it.each(["seo", "business", "hero"])("accepts the %s namespace as an object", async (namespace) => {
    await db.accepts(`insert into site_message (locale,namespace,data) values ('vi','${namespace}','{"name":"Việt Dragon"}')`);
  });
  itRejects([
    ["a namespace with a dot or a leading digit", `insert into site_message (locale,namespace,data) values ('vi','1bad.name','{}')`, "23514", "site_message_namespace_format"],
    ["site_message data that is not an object", `insert into site_message (locale,namespace,data) values ('vi','seo','[]')`, "23514", "site_message_data_object"],
    ["site_message for an unknown locale", `insert into site_message (locale,namespace,data) values ('xx','seo','{}')`, "23503", "site_message_locale_locale_code_fk"],
  ]);
});
