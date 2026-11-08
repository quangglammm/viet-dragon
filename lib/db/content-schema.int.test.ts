import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupContentDb, type ContentDb } from "@/tests/helpers/content-db";

// The constraint suite for the content model (docs/data-model.md §7), ported from the validated scratch spike and run
// on the real PostgreSQL. Every case is a statement the database must refuse (or must keep allowing); the fixture
// is in tests/helpers/content-db.ts. This file: URL namespaces, commit-time invariants, immutable identity, text
// rules. The rest is in content-schema-integrity.int.test.ts.
//
// A refusal case names the rule that must fire (constraint name or message): several rules share an SQLSTATE, and a
// new product with no slug ALSO has no Vietnamese title, so the code alone could pass for the wrong reason.

let db: ContentDb;
beforeAll(async () => {
  db = await setupContentDb("constraints");
});
afterAll(async () => {
  await db.close();
});

type Rejection = readonly [name: string, sql: string, code: string, reason: string];
const itRejects = (cases: readonly Rejection[]) =>
  it.each(cases)("refuses %s", async (_name, sql, code, reason) => {
    await db.rejects(sql, code, reason);
  });

/** The Vietnamese rows a new entity needs, so only the rule under test can refuse the statement. */
const NEW_PRODUCT_TITLE = `insert into product_i18n values ((select max(id) from product),'vi','Sản phẩm mới',null)`;
const NEW_SHAPE_NAME = `insert into shape_i18n values ((select max(id) from shape),'vi','Hình mới',null,null)`;

/** A canonical slug in every language for a new product / post / category, so only the rule under test can refuse it. */
const everyLanguage = (table: string, columns: string, values: string) => `insert into ${table} (locale,${columns}) select code,${values} from locale`;

describe("URL namespaces: one table owns every slug, per language", () => {
  itRejects([
    ["a duplicate (language, category, slug) between two products", `insert into product (category_id,position) values ('marketing',9); insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('vi','marketing','to-roi',(select max(id) from product),true)`, "23505", "product_slug_locale_category_id_slug_pk"],
    ["a product alias shadowing another product's live slug", `insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('vi','marketing','poster',1,false)`, "23505", "product_slug_locale_category_id_slug_pk"],
    ["an alias in a non-existent category", `insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('vi','nope','x',1,false)`, "23503", "product_slug_category_id_category_id_fk"],
    ["a slug in a language the site does not have", `insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('xx','marketing','x',1,false)`, "23503", "product_slug_locale_locale_code_fk"],
    ["a slug with non-Latin characters (Latin letters, digits and dashes only, in every language)", `insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('zh','marketing','海报',1,false)`, "23514", "product_slug_slug_format"],
    ["a SHAPE slug equal to an existing OPTION slug of the same product in the same language (the tet/to-roi bug)", `insert into shape (product_id,position) values (1,9); insert into product_segment (product_id,locale,slug,shape_id,is_canonical) values (1,'vi','giay-kraft',(select max(id) from shape),true)`, "23505", "product_segment_product_id_locale_slug_pk"],
    ["an alias equal to a live shape slug", `insert into product_segment (product_id,locale,slug,shape_id) values (1,'vi','a5',2)`, "23505", "product_segment_product_id_locale_slug_pk"],
    ["a segment naming BOTH a shape and an option", `insert into product_segment (product_id,locale,slug,shape_id,option_id) values (1,'vi','both',1,1)`, "23514", "product_segment_one_target"],
    ["a segment naming neither", `insert into product_segment (product_id,locale,slug) values (1,'vi','none')`, "23514", "product_segment_one_target"],
    ["a segment pointing at a shape of ANOTHER product", `insert into product_segment (product_id,locale,slug,shape_id) values (3,'vi','zzz',1)`, "23503", "product_segment_shape_fk"],
    ["a second canonical slug for one shape in one language", `insert into product_segment (product_id,locale,slug,shape_id,is_canonical) values (1,'vi','a5-again',1,true)`, "23505", "product_segment_one_canonical_shape"],
    ["a second canonical slug for one product in one language", `insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('en','marketing','to-roi-2',1,true)`, "23505", "product_slug_one_canonical"],
    ["a second canonical slug for one post in one language", `insert into post_slug (locale,slug,post_id,is_canonical) values ('ko','bai-1-moi',1,true)`, "23505", "post_slug_one_canonical"],
    ["a post alias shadowing another post's live slug in the same language", `insert into post (category_key,published_on) values ('tips','2026-04-04'); insert into post_slug (locale,slug,post_id,is_canonical) values ('vi','bai-1',(select max(id) from post),false)`, "23505", "post_slug_locale_slug_pk"],
    ["a category slug used by two categories in one language", `insert into category_slug (locale,slug,category_id,is_canonical) values ('vi','marketing','tet',false)`, "23505", "category_slug_locale_slug_pk"],
    ["a second canonical slug for one category in one language", `insert into category_slug (locale,slug,category_id,is_canonical) values ('en','marketing-moi','marketing',true)`, "23505", "category_slug_one_canonical"],
  ]);

  it("lets the same slug text exist in every language (the fixture has 'poster' in all five)", async () => {
    const rows = await db.rows<{ locale: string }>(`select locale from product_slug where slug = 'poster' and is_canonical order by locale`);
    expect(rows.map((r) => r.locale).sort()).toEqual(["en", "ja", "ko", "vi", "zh"]);
  });
  it("allows the same slug in a different category", async () => {
    expect(await db.rows(`select 1 from product_slug where slug = 'to-roi' and locale = 'vi'`)).toHaveLength(2);
  });
  it("allows an old slug to be kept as an alias, even in another category", async () => {
    await db.accepts(`insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('vi','tet','to-roi-cu',1,false)`);
  });
  it("allows a different canonical slug per language", async () => {
    await db.accepts(
      `update product_slug set is_canonical=false where product_id=3 and locale='en'; insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('en','marketing','posters',3,true)`,
    );
  });
  it("allows the same material to be offered several times in one product under different slugs", async () => {
    await db.accepts(`insert into option (product_id,material_id,position) values (1,1,9); ${everyLanguage("product_segment", "product_id,slug,option_id,is_canonical", "1,'giay-couche-300gsm',(select max(id) from option),true")}`);
  });
});

describe("invariants checked at COMMIT", () => {
  itRejects([
    ["a product without a canonical slug", `insert into product (category_id,position) values ('marketing',8); ${NEW_PRODUCT_TITLE}`, "23514", "has no canonical slug in category"],
    ["a product with a canonical slug in only some languages", `insert into product (category_id,position) values ('marketing',8); ${NEW_PRODUCT_TITLE}; insert into product_slug (locale,category_id,slug,product_id,is_canonical) values ('vi','marketing','chi-tieng-viet',(select max(id) from product),true)`, "23514", "for language en"],
    ["deleting the canonical slug of a live product", `delete from product_slug where category_id='marketing' and slug='poster'`, "23514", "has no canonical slug in category"],
    ["deleting the canonical slug of a live product in ONE language", `delete from product_slug where category_id='marketing' and slug='poster' and locale='ja'`, "23514", "for language ja"],
    ["moving a product to another category without moving its canonical slug", `update product set category_id='tet' where id=3`, "23514", "has no canonical slug in category"],
    ["a shape without a canonical segment", `insert into shape (product_id,position) values (1,7); ${NEW_SHAPE_NAME}`, "23514", "shape "],
    ["a shape with a canonical segment in only one language", `insert into shape (product_id,position) values (1,7); ${NEW_SHAPE_NAME}; insert into product_segment (product_id,locale,slug,shape_id,is_canonical) values (1,'vi','a6',(select max(id) from shape),true)`, "23514", "for language en"],
    ["an option without a canonical segment", `insert into option (product_id,material_id,position) values (1,2,7)`, "23514", "option "],
    ["demoting the canonical segment of a live shape", `update product_segment set is_canonical=false where product_id=1 and slug='a5'`, "23514", "shape "],
    ["demoting the canonical segment of a live shape in ONE language", `update product_segment set is_canonical=false where product_id=1 and slug='a5' and locale='ko'`, "23514", "for language ko"],
    ["a post without a canonical slug", `insert into post (category_key,published_on) values ('tips','2026-02-02'); insert into post_i18n values ((select max(id) from post),'vi','Tiêu đề',null,'Nội dung')`, "23514", "has no canonical slug"],
    ["a post with a canonical slug in only some languages", `insert into post (category_key,published_on) values ('tips','2026-02-02'); insert into post_i18n values ((select max(id) from post),'vi','Tiêu đề',null,'Nội dung'); insert into post_slug (locale,slug,post_id,is_canonical) values ('vi','bai-ba',(select max(id) from post),true)`, "23514", "for language en"],
    ["a category without a canonical slug", `insert into category (id,icon,position) values ('khac','Layers',9); insert into category_i18n values ('khac','vi','Khác',null)`, "23514", "category khac has no canonical slug"],
    ["deleting a category's canonical slug in one language", `delete from category_slug where category_id='tet' and locale='zh'`, "23514", "for language zh"],
  ]);

  it("allows moving a product AND its canonical slugs together (the old URLs stay as aliases)", async () => {
    await db.accepts(
      `update product set category_id='tet' where id=3; update product_slug set is_canonical=false where category_id='marketing' and slug='poster'; ${everyLanguage("product_slug", "category_id,slug,product_id,is_canonical", "'tet','poster',3,true")}`,
    );
  });
  it("allows the move to be reversed the same way (as the next transaction)", async () => {
    await db.accepts([
      `update product set category_id='tet' where id=3; update product_slug set is_canonical=false where category_id='marketing' and slug='poster'; ${everyLanguage("product_slug", "category_id,slug,product_id,is_canonical", "'tet','poster',3,true")}`,
      `update product set category_id='marketing' where id=3; update product_slug set is_canonical=false where category_id='tet' and slug='poster'; update product_slug set is_canonical=true where category_id='marketing' and slug='poster'`,
    ]);
  });
});

describe("a language is added together with its slugs", () => {
  const BACKFILL = `
    insert into category_slug (locale,slug,category_id,is_canonical) select 'zh-Hant',slug,category_id,is_canonical from category_slug where locale='en';
    insert into product_slug (locale,category_id,slug,product_id,is_canonical) select 'zh-Hant',category_id,slug,product_id,is_canonical from product_slug where locale='en';
    insert into product_segment (product_id,locale,slug,shape_id,option_id,is_canonical) select product_id,'zh-Hant',slug,shape_id,option_id,is_canonical from product_segment where locale='en';
    insert into post_slug (locale,slug,post_id,is_canonical) select 'zh-Hant',slug,post_id,is_canonical from post_slug where locale='en'`;
  it("refuses a new language while some entity has no slug in it", async () => {
    await db.rejects(`insert into locale values ('zh-Hant',false,5)`, "23514", "language zh-Hant has no canonical slug for some categories");
  });
  it("accepts it when the slugs are cloned from English in the same transaction", async () => {
    await db.accepts(`insert into locale values ('zh-Hant',false,5); ${BACKFILL}`);
  });
  it("refuses a language whose slugs are cloned for everything but the posts", async () => {
    await db.rejects(`insert into locale values ('zh-Hant',false,5); ${BACKFILL.replace(/insert into post_slug[\s\S]*$/, "select 1")}`, "23514", "for some posts");
  });
});

describe("identity is immutable", () => {
  const NEW_FAST_PRINT = `insert into fast_print_item (key,icon,position) values ('hop','Zap',0); insert into fast_print_item_i18n select id,'vi','Hộp',null,null from fast_print_item where key='hop'`;
  const NEW_SHOWCASE = `insert into showcase_item (key,media_id,position) values ('s1',1,0); insert into showcase_item_i18n select id,'vi','Ảnh' from showcase_item where key='s1'`;
  itRejects([
    ["changing a product's uid", `update product set uid = gen_random_uuid() where id=1`, "23514", "is immutable"],
    ["changing a shape's uid", `update shape set uid = gen_random_uuid() where id=1`, "23514", "is immutable"],
    ["changing an option's uid", `update option set uid = gen_random_uuid() where id=1`, "23514", "is immutable"],
    ["changing a post's uid", `update post set uid = gen_random_uuid() where id=1`, "23514", "is immutable"],
    ["renaming a material key", `update material set slug='other' where id=1`, "23514", "is immutable"],
    ["renaming a unit key", `update unit set key='boxes' where key='box'`, "23514", "is immutable"],
    ["renaming a trait key", `update trait set key='shiny' where key='glossy-coat'`, "23514", "is immutable"],
    ["changing a spec item's kind/key", `update spec_item set key='x' where id=1`, "23514", "is immutable"],
    ["renaming a category id", `update category set id='mkt' where id='marketing'`, "23514", "is immutable"],
    ["renaming a post category key", `update post_category set key='advice' where key='tips'`, "23514", "is immutable"],
    ["changing a media file's storage key", `update media set storage_key='images/z.webp' where id=1`, "23514", "is immutable"],
    ["changing a Fast Print item's uid", `${NEW_FAST_PRINT}; update fast_print_item set uid = gen_random_uuid() where key='hop'`, "23514", "is immutable"],
    ["changing a showcase item's uid", `${NEW_SHOWCASE}; update showcase_item set uid = gen_random_uuid() where key='s1'`, "23514", "is immutable"],
    ["moving a product slug to another language", `update product_slug set locale='zh' where locale='ja' and slug='poster'`, "23514", "product_slug.locale is immutable"],
    ["moving a segment to another language", `update product_segment set locale='zh' where locale='ja' and slug='a5' and product_id=1`, "23514", "product_segment.locale is immutable"],
    ["moving a post slug to another language", `update post_slug set locale='zh' where locale='ja' and slug='bai-1'`, "23514", "post_slug.locale is immutable"],
    ["moving a category slug to another language or category", `update category_slug set locale='zh' where locale='ja' and slug='tet'`, "23514", "category_slug.locale is immutable"],
  ]);

  it("keeps the display text of a library item editable", async () => {
    await db.accepts(`insert into material_i18n values (1,'vi','Giấy loại C (đã sửa)') on conflict (material_id, locale) do update set name=excluded.name`);
  });
});

describe("text rules are Unicode-aware", () => {
  const blanks: ReadonlyArray<readonly [string, string]> = [
    ["spaces", "'   '"],
    ["tab and newline", `E'\\t\\n'`],
    ["a no-break space", `E'\\u00a0'`],
    ["an ideographic space", `E'\\u3000'`],
    ["a zero-width space", `E'\\u200b'`],
    ["a byte-order mark", `E'\\ufeff'`],
  ];
  it.each(blanks)("refuses a blank translation made of %s", async (_label, literal) => {
    await db.rejects(`insert into product_i18n values (2,'ja',${literal},null)`, "23514", "product_i18n_title_nonblank");
  });

  itRejects([
    ["an empty-string description (it must be NULL instead)", `insert into product_i18n values (2,'ja','ok','')`, "23514", "product_i18n_description_nonblank"],
    ["an option_i18n row with no text at all", `insert into option_i18n (option_id,locale) values (2,'vi')`, "23514", "option_i18n_not_empty"],
    ["a slug with uppercase and a space", `insert into material (slug) values ('Foo Bar')`, "23514", "material_slug_format"],
    ["an upper-case locale code", `insert into locale values ('ZH',false,6)`, "23514", "locale_code_format"],
    ["a second default locale", `insert into locale values ('th',true,7)`, "23505", "locale_single_default"],
    ["a trait icon on a best_for bullet", `insert into option_bullet (option_id,kind,position,trait_key) values (1,'best_for',5,'glossy-coat')`, "23514", "option_bullet_trait_only_features"],
    ["a duplicate bullet position within (option, kind)", `insert into option_bullet (option_id,kind,position) values (1,'best_for',0)`, "23505", "option_bullet_option_kind_position_unique"],
    ["a negative price", `update option set base_price=-1 where id=1`, "23514", "option_base_price_nonneg"],
    ["a size with neither numeric dims nor text", `insert into size_option (product_id,shape_id,tier) values (3,null,'small')`, "23514", "size_option_numeric_xor_text"],
    ["a size with BOTH numeric dims and text (XOR)", `insert into size_option (product_id,shape_id,tier,width_mm,height_mm,dims_text) values (3,null,'medium',1,1,'x')`, "23514", "size_option_numeric_xor_text"],
    ["a duplicate size tier at the same scope", `insert into size_option (product_id,shape_id,tier,width_mm,height_mm) values (1,null,'large',1,1)`, "23505", "size_option_scope_tier_unique"],
    ["a duplicate product_spec at the same scope", `insert into product_spec (product_id,shape_id,spec_item_id,position) values (1,null,1,5)`, "23505", "product_spec_scope_item_unique"],
    ["an icon name with punctuation", `insert into trait (key,icon) values ('bad-icon','Sparkles!')`, "23514", "trait_icon_format"],
    ["a media row with a negative size", `insert into media (source,storage_key,kind,mime,bytes) values ('static','images/neg.webp','image','image/webp',-1)`, "23514", "media_bytes_nonneg"],
  ]);

});

describe("the migration seeded the language list", () => {
  it("has the five site languages, Vietnamese the default", async () => {
    const rows = await db.rows<{ code: string; is_default: boolean }>(`select code, is_default from locale order by position`);
    expect(rows.map((r) => r.code)).toEqual(["vi", "en", "zh", "ja", "ko"]);
    expect(rows.filter((r) => r.is_default).map((r) => r.code)).toEqual(["vi"]);
  });
});
