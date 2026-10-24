import type { DatabaseError, PoolClient } from "pg";
import { expect } from "vitest";
import { createScratchDatabase } from "./db";

// Harness for the content-schema suites. The fixture is committed once; every test then runs inside a
// transaction that is ALWAYS rolled back, so tests are independent of each other and of their order.
//
// The schema's strongest rules are checked at COMMIT (deferred constraint triggers, deferred foreign keys).
// A rolled-back transaction never reaches COMMIT, so each attempt ends with SET CONSTRAINTS ALL IMMEDIATE,
// which runs exactly the checks COMMIT would have run.

/**
 * Ids below are the fixture's: three products (1,2 = "to-roi" in marketing/tet, 3 = poster), shapes 1-3, options 1-4, media 1-2
 * images + 3 a video. Every slug exists in each of the five languages (the same text in each: the namespaces are per language).
 * Insert slug rows with explicit column lists: `locale` is the LAST physical column of the tables that gained it.
 */
const FIXTURE = `
insert into app_user (id, name, email) values ('u1', 'Fixture User', 'u1@example.test');
insert into media (source,storage_key,kind,mime,bytes) values ('static','images/a.webp','image','image/webp',10),('static','images/b.webp','image','image/webp',10),('static','videos/v.mp4','video','video/mp4',10);
insert into category (id,icon,cover_media_id,position,updated_by) values ('marketing','Briefcase',1,0,'u1'),('tet','Gift',1,1,'u1');
insert into product (category_id,cover_media_id,position) values ('marketing',1,0),('tet',1,0),('marketing',2,1);
insert into product_slug (locale,category_id,slug,product_id,is_canonical) select l.code,v.category_id,v.slug,v.product_id,true from locale l cross join (values ('marketing','to-roi',1),('tet','to-roi',2),('marketing','poster',3)) v(category_id,slug,product_id);
insert into shape (product_id,image_media_id,position) values (1,1,0),(1,1,1),(2,1,0);
insert into product_segment (product_id,locale,slug,shape_id,is_canonical) select v.product_id,l.code,v.slug,v.shape_id,true from locale l cross join (values (1,'a5',1),(1,'a4',2),(2,'a5',3)) v(product_id,slug,shape_id);
insert into material (slug) values ('giay-loai-c'),('giay-kraft');
insert into unit (key) values ('box');
insert into trait (key,icon) values ('glossy-coat','Sparkles');
insert into option (product_id,shape_id,material_id,position,unit_key) values (1,null,1,0,'box'),(1,1,1,1,null),(1,null,2,2,null),(3,null,1,0,null);
insert into product_segment (product_id,locale,slug,option_id,is_canonical) select v.product_id,l.code,v.slug,v.option_id,true from locale l cross join (values (1,'giay-loai-c',1),(1,'giay-loai-c-a5',2),(1,'giay-kraft',3),(3,'giay-loai-c',4)) v(product_id,slug,option_id);
insert into option_i18n values (1,'vi','Giấy loại C',null,'Tagline vi'),(1,'en','Type C paper','Type C',null);
insert into option_bullet (option_id,kind,position,trait_key) values (1,'feature',0,'glossy-coat'),(1,'best_for',0,null);
insert into option_bullet_i18n values (1,'vi','Bóng'),(1,'en','Glossy'),(2,'vi','Sự kiện');
insert into option_image values (1,'default',0,1,'image');
insert into size_option (product_id,shape_id,tier,width_mm,height_mm) values (1,null,'large',210,297),(1,1,'large',148,210);
insert into size_option (product_id,shape_id,tier,dims_text) values (3,null,'large','Size L - XL');
insert into spec_item (kind,key) values ('technique','offset'),('finishing','matte-lamination');
insert into product_spec (product_id,shape_id,spec_item_id,position) values (1,null,1,0),(1,1,2,0);
insert into product_i18n values (1,'vi','Tờ rơi',null),(1,'en','Flyers',null),(2,'vi','Tờ rơi Tết',null),(3,'vi','Poster',null);
insert into shape_i18n values (1,'vi','A5','Khổ A5','Mới'),(1,'en','A5 flyer',null,null);
insert into menu_group (product_id,menu_column,position) values (1,1,0);
insert into menu_item (product_id,position,shape_id,is_fast) values (1,0,1,true);
insert into menu_item (product_id,position,option_id) values (1,1,1);
insert into category_i18n values ('marketing','vi','Tiếp thị',null),('tet','vi','Tết',null);
insert into category_slug (locale,slug,category_id,is_canonical) select l.code,c.id,c.id,true from locale l cross join category c;
insert into material_i18n values (1,'vi','Giấy loại C'),(2,'vi','Giấy kraft');
insert into unit_i18n values ('box','vi','Hộp');
insert into trait_i18n values ('glossy-coat','vi','Bóng',null);
insert into spec_item_i18n values (1,'vi','Offset'),(2,'vi','Cán màng mờ');
insert into shape_i18n values (2,'vi','A4',null,null),(3,'vi','A5 Tết',null,null);
insert into post_category (key) values ('tips');
insert into post_category_i18n values ('tips','vi','Mẹo');
insert into post (category_key,published_on) values ('tips','2026-01-01');
insert into post_slug (locale,slug,post_id,is_canonical) select code,'bai-1',1,true from locale;
insert into post_i18n values (1,'vi','Tiêu đề',null,'Nội dung');
`;

export type ContentDb = {
  /**
   * Runs `sql` (several statements allowed) and the COMMIT-time checks, then rolls back. Resolves with the error, or null if
   * accepted. Pass an array to simulate consecutive transactions: the COMMIT-time checks run after each element.
   */
  attempt: (sql: string | readonly string[]) => Promise<DatabaseError | null>;
  /**
   * Asserts that `sql` is refused; with `code`, for that SQLSTATE; with `reason`, that the error message mentions it.
   * Pass `reason` whenever two rules could refuse the same statement — otherwise the test passes for the wrong one.
   */
  rejects: (sql: string | readonly string[], code?: string, reason?: string) => Promise<void>;
  accepts: (sql: string | readonly string[]) => Promise<void>;
  /** Runs `fn` in a transaction that is rolled back afterwards, for tests that read back what they wrote. */
  withRollback: <T>(fn: (client: PoolClient) => Promise<T>) => Promise<T>;
  /** Read-only query against the committed fixture. */
  rows: <T extends object = Record<string, unknown>>(sql: string) => Promise<T[]>;
  close: () => Promise<void>;
};

export async function setupContentDb(label: string): Promise<ContentDb> {
  const scratch = await createScratchDatabase(label);
  const { pool } = scratch;

  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(FIXTURE);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  const withRollback = async <T>(fn: (c: PoolClient) => Promise<T>): Promise<T> => {
    const c = await pool.connect();
    try {
      await c.query("begin");
      return await fn(c);
    } finally {
      await c.query("rollback").catch(() => undefined);
      c.release();
    }
  };

  const attempt = async (sql: string | readonly string[]): Promise<DatabaseError | null> => {
    const steps = typeof sql === "string" ? [sql] : sql;
    try {
      await withRollback(async (c) => {
        for (const step of steps) {
          await c.query(step);
          await c.query("set constraints all immediate");
          await c.query("set constraints all deferred");
        }
      });
      return null;
    } catch (error) {
      return error as DatabaseError;
    }
  };

  return {
    attempt,
    rejects: async (sql, code, reason) => {
      const error = await attempt(sql);
      expect(error, "the statement was ACCEPTED").not.toBeNull();
      if (code) expect(error?.code, error?.message).toBe(code);
      if (reason) expect(error?.message).toContain(reason);
    },
    accepts: async (sql) => {
      const error = await attempt(sql);
      expect(error?.message ?? null).toBeNull();
    },
    withRollback,
    rows: async (sql) => (await pool.query(sql)).rows,
    close: scratch.drop,
  };
}
