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

describe("URL namespaces: one table owns every slug", () => {
  itRejects([
    ["a duplicate (category, slug) between two products", `insert into product (category_id,position) values ('marketing',9); insert into product_slug values ('marketing','to-roi',(select max(id) from product),true)`, "23505", "product_slug_category_id_slug_pk"],
    ["a product alias shadowing another product's live slug", `insert into product_slug values ('marketing','poster',1,false)`, "23505", "product_slug_category_id_slug_pk"],
    ["an alias in a non-existent category", `insert into product_slug values ('nope','x',1,false)`, "23503", "product_slug_category_id_category_id_fk"],
    ["a SHAPE slug equal to an existing OPTION slug of the same product (the tet/to-roi bug)", `insert into shape (product_id,position) values (1,9); insert into product_segment (product_id,slug,shape_id,is_canonical) values (1,'giay-kraft',(select max(id) from shape),true)`, "23505", "product_segment_product_id_slug_pk"],
    ["an alias equal to a live shape slug", `insert into product_segment (product_id,slug,shape_id) values (1,'a5',2)`, "23505", "product_segment_product_id_slug_pk"],
    ["a segment naming BOTH a shape and an option", `insert into product_segment (product_id,slug,shape_id,option_id) values (1,'both',1,1)`, "23514", "product_segment_one_target"],
    ["a segment naming neither", `insert into product_segment (product_id,slug) values (1,'none')`, "23514", "product_segment_one_target"],
    ["a segment pointing at a shape of ANOTHER product", `insert into product_segment (product_id,slug,shape_id) values (3,'zzz',1)`, "23503", "product_segment_shape_fk"],
    ["a second canonical slug for one shape", `insert into product_segment (product_id,slug,shape_id,is_canonical) values (1,'a5-again',1,true)`, "23505", "product_segment_one_canonical_shape"],
  ]);

  it("allows the same slug in a different category", async () => {
    expect(await db.rows(`select 1 from product_slug where slug = 'to-roi'`)).toHaveLength(2);
  });
  it("allows an old slug to be kept as an alias, even in another category", async () => {
    await db.accepts(`insert into product_slug values ('tet','to-roi-cu',1,false)`);
  });
  it("allows the same material to be offered several times in one product under different slugs", async () => {
    await db.accepts(`insert into option (product_id,material_id,position) values (1,1,9); insert into product_segment (product_id,slug,option_id,is_canonical) values (1,'giay-couche-300gsm',(select max(id) from option),true)`);
  });
});

describe("invariants checked at COMMIT", () => {
  itRejects([
    ["a product without a canonical slug", `insert into product (category_id,position) values ('marketing',8); ${NEW_PRODUCT_TITLE}`, "23514", "has no canonical slug in category"],
    ["deleting the canonical slug of a live product", `delete from product_slug where category_id='marketing' and slug='poster'`, "23514", "has no canonical slug in category"],
    ["moving a product to another category without moving its canonical slug", `update product set category_id='tet' where id=3`, "23514", "has no canonical slug in category"],
    ["a shape without a canonical segment", `insert into shape (product_id,position) values (1,7); ${NEW_SHAPE_NAME}`, "23514", "shape "],
    ["an option without a canonical segment", `insert into option (product_id,material_id,position) values (1,2,7)`, "23514", "option "],
    ["demoting the canonical segment of a live shape", `update product_segment set is_canonical=false where product_id=1 and slug='a5'`, "23514", "shape "],
    ["a post without a canonical slug", `insert into post (category_key,published_on) values ('tips','2026-02-02'); insert into post_i18n values ((select max(id) from post),'vi','Tiêu đề',null,'Nội dung')`, "23514", "has no canonical slug"],
  ]);

  it("allows moving a product AND its canonical slug together (the old URL stays as an alias)", async () => {
    await db.accepts(`update product set category_id='tet' where id=3; update product_slug set is_canonical=false where category_id='marketing' and slug='poster'; insert into product_slug values ('tet','poster',3,true)`);
  });
  it("allows the move to be reversed the same way (as the next transaction)", async () => {
    await db.accepts([
      `update product set category_id='tet' where id=3; update product_slug set is_canonical=false where category_id='marketing' and slug='poster'; insert into product_slug values ('tet','poster',3,true)`,
      `update product set category_id='marketing' where id=3; update product_slug set is_canonical=false where category_id='tet' and slug='poster'; update product_slug set is_canonical=true where category_id='marketing' and slug='poster'`,
    ]);
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

  it("accepts a regional locale code like zh-Hant", async () => {
    await db.accepts(`insert into locale values ('zh-Hant',false,5)`);
  });
});

describe("the migration seeded the language list", () => {
  it("has the five site languages, Vietnamese the default", async () => {
    const rows = await db.rows<{ code: string; is_default: boolean }>(`select code, is_default from locale order by position`);
    expect(rows.map((r) => r.code)).toEqual(["vi", "en", "zh", "ja", "ko"]);
    expect(rows.filter((r) => r.is_default).map((r) => r.code)).toEqual(["vi"]);
  });
});
