import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { editAndPublish, liveDocument, type RefOf } from "@/tests/helpers/content-lifecycle";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { composeEntity } from "./compose";
import { deleteEntity } from "./delete";
import { createDraft, discardDraft, openDraft, saveDraft } from "./drafts";
import { Invalid, NotFound } from "./errors";
import { publishDraft } from "./publish";
import { listRevisions, startRestore } from "./restore";
import type { PostDocument, ProductDocument } from "./schemas";

// Deleting is permanent, so every refusal is tested next to the deletions that must work.

let seeded: SeededDatabase;
beforeAll(async () => {
  seeded = await createSeededDatabase("delete");
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const db = () => seeded.db;
const pool = () => seeded.scratch.pool;
const rows = async <T extends object>(sql: string, params: unknown[] = []): Promise<T[]> => (await pool().query(sql, params)).rows as T[];
const count = async (sql: string, params: unknown[] = []) => Number((await rows<{ n: number }>(sql, params))[0].n);
const thrown = (promise: Promise<unknown>) => promise.then(() => null, (error: unknown) => error);
const product = (key: string) => ({ type: "product" as const, id: seeded.outcome.products.get(key)!.uid });

describe("what cannot be deleted at all", () => {
  it("categories and menus are structural", async () => {
    for (const type of ["category", "menu"] as const) {
      const error = await thrown(deleteEntity(db(), { type, id: "tet" }, { author: null }));
      expect(error).toBeInstanceOf(Invalid);
      expect(await composeEntity(db(), type, "tet")).not.toBeNull();
    }
  });

  it("an unknown entity", async () => {
    expect(await thrown(deleteEntity(db(), { type: "material", id: "khong-co" }, { author: null }))).toBeInstanceOf(NotFound);
  });
});

describe("a product", () => {
  const target = () => product("tet/to-roi");

  it("is archived first, then refused while a menu still shows it, then deleted with everything under it", async () => {
    expect(await thrown(deleteEntity(db(), target(), { author: null }))).toMatchObject({ code: "NOT_ARCHIVED" });
    await editAndPublish(db(), target(), (doc: ProductDocument) => void (doc.status = "archived"));

    const refusedByMenu = await thrown(deleteEntity(db(), target(), { author: null }));
    expect(refusedByMenu).toMatchObject({ code: "IN_USE", message: expect.stringContaining("menu") });
    await editAndPublish(db(), { type: "menu", id: "tet" }, (doc) => {
      for (const column of doc.columns) column.groups = column.groups.filter((g) => g.product !== target().id);
    });

    const before = await liveDocument(db(), target());
    const productId = seeded.outcome.products.get("tet/to-roi")!.id;
    const result = await deleteEntity(db(), target(), { author: null, comment: "bỏ sản phẩm" });
    expect(result.affected).toEqual([target(), { type: "menu", id: "tet" }]);
    expect(await composeEntity(db(), "product", target().id)).toBeNull();
    for (const table of ["shape", "option", "product_slug", "product_segment", "size_option", "product_spec", "product_i18n"]) {
      expect(await count(`select count(*)::int n from ${table} where product_id = $1`, [productId]), table).toBe(0);
    }
    const [latest] = await listRevisions(db(), target());
    expect(latest).toMatchObject({ action: "delete", comment: "bỏ sản phẩm" });

    // The last document is kept, and can be brought back: same uids, numbering continues.
    const restore = await startRestore(db(), target(), latest.version, null);
    const restored = await publishDraft(db(), target(), { expectDraftVersion: restore.draftVersion, author: null });
    expect(restored).toMatchObject({ version: latest.version + 1, action: "restore" });
    expect(await liveDocument(db(), target())).toEqual({ ...before, status: "archived" });
  });

  it("is refused while it has an open draft", async () => {
    const other = product("marketing/to-gap");
    await editAndPublish(db(), other, (doc: ProductDocument) => void (doc.status = "archived"));
    await openDraft(db(), other, null);
    expect(await thrown(deleteEntity(db(), other, { author: null }))).toMatchObject({ code: "DRAFT_EXISTS" });
    await discardDraft(db(), other);
    expect(await composeEntity(db(), "product", other.id)).not.toBeNull();
  });
});

describe("a post", () => {
  it("must be archived first, and its URLs go with it", async () => {
    const [{ uid }] = await rows<{ uid: string }>(`select uid from post limit 1`);
    const ref = { type: "post" as const, id: uid };
    expect(await thrown(deleteEntity(db(), ref, { author: null }))).toMatchObject({ code: "NOT_ARCHIVED" });
    await editAndPublish(db(), ref, (doc: PostDocument) => void (doc.status = "archived"));
    await deleteEntity(db(), ref, { author: null });
    expect(await count(`select count(*)::int n from post where uid = $1`, [uid])).toBe(0);
  });
});

describe("library records that something uses", () => {
  it("a material offered by a product is refused, with the live and draft counts in the message", async () => {
    const [{ slug }] = await rows<{ slug: string }>(`select m.slug from material m join option o on o.material_id = m.id limit 1`);
    const error = await thrown(deleteEntity(db(), { type: "material", id: slug }, { author: null }));
    expect(error).toMatchObject({ code: "IN_USE" });
    expect((error as Error).message).toMatch(/\d+ mục đang hiển thị, 0 bản nháp/);
  });

  it("a trait used by a bullet, a unit used by Fast Print and a spec item used by a product are refused", async () => {
    const [{ trait_key: trait }] = await rows<{ trait_key: string }>(`select trait_key from option_bullet where trait_key is not null limit 1`);
    const [{ unit_key: unit }] = await rows<{ unit_key: string }>(`select unit_key from fast_print_item where unit_key is not null limit 1`);
    const [{ id: spec }] = await rows<{ id: string }>(`select i.kind || '/' || i.key id from product_spec s join spec_item i on i.id = s.spec_item_id limit 1`);
    for (const ref of [{ type: "trait", id: trait }, { type: "unit", id: unit }, { type: "spec_item", id: spec }] as const) {
      expect(await thrown(deleteEntity(db(), ref, { author: null })), ref.type).toMatchObject({ code: "IN_USE" });
    }
  });

  it("an unused record is deleted — but not while an open draft points at it", async () => {
    const created = await createDraft(db(), "material", { key: "tam-thoi", snapshot: { icon: null, i18n: { vi: { name: "Tạm" }, en: { name: "Temp" } } } }, null);
    await publishDraft(db(), created.ref, { expectDraftVersion: created.draftVersion, author: null });
    const ref = created.ref as RefOf<"material">;

    const [{ uid }] = await rows<{ uid: string }>(`select p.uid from product p where p.category_id = 'office' limit 1`);
    const holder = { type: "product" as const, id: uid };
    const draft = await openDraft(db(), holder, null);
    const mention = structuredClone(draft.snapshot) as unknown as ProductDocument;
    mention.options[0].material = "tam-thoi";
    await saveDraft(db(), holder, { snapshot: mention, expectDraftVersion: draft.draftVersion, author: null });

    const refused = await thrown(deleteEntity(db(), ref, { author: null }));
    expect(refused).toMatchObject({ code: "IN_USE" });
    expect((refused as Error).message).toMatch(/0 mục đang hiển thị, 1 bản nháp/);
    await discardDraft(db(), holder);

    await deleteEntity(db(), ref, { author: null });
    expect(await composeEntity(db(), "material", "tam-thoi")).toBeNull();
  });

  it("a blog category with posts is refused, also when only an open post draft names it", async () => {
    const [{ key }] = await rows<{ key: string }>(`select key from post_category limit 1`);
    expect(await thrown(deleteEntity(db(), { type: "post_category", id: key }, { author: null }))).toMatchObject({ code: "IN_USE" });

    const created = await createDraft(db(), "post_category", { key: "chuyen-muc-trong", snapshot: { i18n: { vi: { label: "Trống" }, en: { label: "Empty" } } } }, null);
    await publishDraft(db(), created.ref, { expectDraftVersion: created.draftVersion, author: null });
    const [{ uid }] = await rows<{ uid: string }>(`select uid from post limit 1`);
    const post = { type: "post" as const, id: uid };
    const draft = await openDraft(db(), post, null);
    const saved = await saveDraft(db(), post, { snapshot: { ...draft.snapshot, category: "chuyen-muc-trong" }, expectDraftVersion: draft.draftVersion, author: null });
    expect(await thrown(deleteEntity(db(), created.ref, { author: null }))).toMatchObject({ code: "IN_USE" });
    expect(saved.draftVersion).toBeGreaterThan(draft.draftVersion);
    await discardDraft(db(), post);
    await deleteEntity(db(), created.ref, { author: null });
    expect(await composeEntity(db(), "post_category", "chuyen-muc-trong")).toBeNull();
  });
});

describe("records nothing refers to", () => {
  it("a showcase item and a site message are deleted directly", async () => {
    const [{ uid }] = await rows<{ uid: string }>(`select uid from showcase_item limit 1`);
    await deleteEntity(db(), { type: "showcase_item", id: uid }, { author: null });
    expect(await count(`select count(*)::int n from showcase_item where uid = $1`, [uid])).toBe(0);

    const [{ namespace }] = await rows<{ namespace: string }>(`select namespace from site_message limit 1`);
    await deleteEntity(db(), { type: "site_message", id: namespace }, { author: null });
    expect(await count(`select count(*)::int n from site_message where namespace = $1`, [namespace])).toBe(0);
  });
});
