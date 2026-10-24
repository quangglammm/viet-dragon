import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { editAndPublish, liveDocument, liveVersion, refusedEdit } from "@/tests/helpers/content-lifecycle";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { createDraft, discardDraft, openDraft, saveDraft } from "./drafts";
import { Invalid } from "./errors";
import { publishDraft } from "./publish";
import { LOCALES, type MenuDocument } from "./schemas";

let seeded: SeededDatabase;
beforeAll(async () => {
  seeded = await createSeededDatabase("menu-lifecycle");
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const db = () => seeded.db;
const pool = () => seeded.scratch.pool;
const menu = (category: string) => ({ type: "menu" as const, id: category });
const product = (key: string) => {
  const found = seeded.outcome.products.get(key);
  if (!found) throw new Error(`no seeded product ${key}`);
  return { type: "product" as const, id: found.uid, dbId: found.id };
};
const rows = async <T extends object>(sql: string, params: unknown[] = []): Promise<T[]> => (await pool().query(sql, params)).rows as T[];
const thrown = (promise: Promise<unknown>) => promise.then(() => null, (error: unknown) => error);
const CATEGORIES = ["marketing", "office", "packaging", "tet"] as const;

describe("the menu of a category", () => {
  it("publishes unchanged without losing a group, an item or a label; the version moves up by one", async () => {
    const itemsBefore = Number((await rows<{ n: number }>(`select count(*)::int n from menu_item`))[0].n);
    for (const category of CATEGORIES) {
      const before = await liveDocument(db(), menu(category));
      const versionBefore = (await liveVersion(db(), menu(category)))!;
      await editAndPublish(db(), menu(category), () => undefined);
      expect(await liveDocument(db(), menu(category)), category).toEqual(before);
      expect(await liveVersion(db(), menu(category)), category).toBe(versionBefore + 1);
    }
    expect(Number((await rows<{ n: number }>(`select count(*)::int n from menu_item`))[0].n)).toBe(itemsBefore);
  });

  it("stores label and description overrides in any language, image overrides and the Fast Print tag", async () => {
    const sentinel = structuredClone(await liveDocument(db(), menu("tet")));
    const [group] = sentinel.columns[0].groups;
    const [item] = group.items;
    const [cover] = await rows<{ storage_key: string }>(`select storage_key from media where kind = 'image' limit 1`);
    group.i18n.ja = { label: "見出し", description: "説明" };
    group.image = cover.storage_key;
    item.isFast = !item.isFast;
    item.image = cover.storage_key;
    item.i18n.ko = "라벨";
    await editAndPublish(db(), menu("tet"), (doc) => Object.assign(doc, structuredClone(sentinel)));
    expect(await liveDocument(db(), menu("tet"))).toEqual(sentinel);
  });

  it("removing a group takes the product out of the menu and leaves the product alone", async () => {
    const before = await liveDocument(db(), menu("office"));
    const [removed] = before.columns[0].groups;
    const shapesBefore = Number((await rows<{ n: number }>(`select count(*)::int n from shape`))[0].n);
    const productVersion = await liveVersion(db(), { type: "product", id: removed.product });
    await editAndPublish(db(), menu("office"), (doc) => void (doc.columns[0].groups = doc.columns[0].groups.filter((g) => g.product !== removed.product)));
    expect(JSON.stringify(await liveDocument(db(), menu("office")))).not.toContain(removed.product);
    expect(Number((await rows<{ n: number }>(`select count(*)::int n from shape`))[0].n)).toBe(shapesBefore);
    expect(await liveVersion(db(), { type: "product", id: removed.product })).toBe(productVersion);
    await editAndPublish(db(), menu("office"), (doc) => void (doc.columns = structuredClone(before.columns)));
    expect(await liveDocument(db(), menu("office"))).toEqual(before);
  });
});

describe("refusing a menu that does not fit the catalog", () => {
  it("a group for a product of another category", async () => {
    const stranger = product("office/ao-thun");
    const error = await refusedEdit(db(), menu("tet"), (doc) => void doc.columns[0].groups.push({ product: stranger.id, image: null, i18n: { vi: { label: "Lạ" } }, items: [] }));
    expect(error).toBeInstanceOf(Invalid);
    expect((error as Invalid).issues[0]).toMatchObject({ message: "Sản phẩm này không thuộc danh mục «tet»." });
  });

  it("an item that points at a shape of another product", async () => {
    const live = await liveDocument(db(), menu("tet"));
    const [foreign] = await rows<{ uid: string }>(`select s.uid from shape s join product p on p.id = s.product_id where p.category_id = 'office' limit 1`);
    const error = await refusedEdit(db(), menu("tet"), (doc) => void doc.columns[0].groups[0].items.push({ target: { shape: foreign.uid }, isFast: false, image: null, i18n: {} }));
    expect((error as Invalid).issues[0].message).toMatch(/không thuộc sản phẩm của nhóm/);
    expect(await liveDocument(db(), menu("tet"))).toEqual(live);
  });

  it("a menu filed under another category's key, or for a category that does not exist", async () => {
    const draft = await openDraft(db(), menu("tet"), null);
    const misfiled = { ...(draft.snapshot as unknown as MenuDocument), key: "office" };
    expect(await thrown(saveDraft(db(), menu("tet"), { snapshot: misfiled, expectDraftVersion: draft.draftVersion, author: null }))).toBeInstanceOf(Invalid);
    const inconsistent = { ...(draft.snapshot as unknown as MenuDocument), category: "office" };
    const saved = await saveDraft(db(), menu("tet"), { snapshot: inconsistent, expectDraftVersion: draft.draftVersion, author: null });
    const refused = await thrown(publishDraft(db(), menu("tet"), { expectDraftVersion: saved.draftVersion, author: null }));
    expect((refused as Invalid).issues).toContainEqual({ path: "key", message: "Khóa của menu phải trùng với danh mục." });
    await discardDraft(db(), menu("tet"));

    const ghost = await createDraft(db(), "menu", { key: "khong-co", snapshot: { category: "khong-co", columns: [] } }, null);
    const unknown = await thrown(publishDraft(db(), ghost.ref, { expectDraftVersion: ghost.draftVersion, author: null }));
    expect((unknown as Invalid).issues).toContainEqual({ path: "category", message: "Không tìm thấy danh mục «khong-co»." });
    await discardDraft(db(), ghost.ref);
  });
});

describe("moving a product between categories", () => {
  it("takes it out of the old menu, bumps both menu versions and makes an older menu draft stale", async () => {
    const target = product("packaging/hop-giay");
    const packagingBefore = await liveDocument(db(), menu("packaging"));
    const marketingBefore = await liveDocument(db(), menu("marketing"));
    const versions = { packaging: (await liveVersion(db(), menu("packaging")))!, marketing: (await liveVersion(db(), menu("marketing")))! };
    expect(JSON.stringify(packagingBefore)).toContain(target.id);

    // A menu draft started BEFORE the move.
    const menuDraft = await openDraft(db(), menu("marketing"), null);

    const moved = await editAndPublish(db(), { type: "product", id: target.id }, (doc) => {
      doc.category = "marketing";
      for (const locale of LOCALES) doc.slugs[locale].aliases = doc.slugs[locale].aliases.filter((a) => !(a.category === "marketing" && a.slug === doc.slugs[locale].slug));
    });

    expect(await rows(`select 1 from menu_group where product_id = $1`, [target.dbId])).toEqual([]);
    expect(JSON.stringify(await liveDocument(db(), menu("packaging")))).not.toContain(target.id);
    expect(JSON.stringify(await liveDocument(db(), menu("marketing")))).not.toContain(target.id);
    expect(await liveVersion(db(), menu("packaging"))).toBe(versions.packaging + 1);
    expect(await liveVersion(db(), menu("marketing"))).toBe(versions.marketing + 1);
    expect(moved.affected).toEqual([{ type: "product", id: target.id }, { type: "menu", id: "packaging" }, { type: "menu", id: "marketing" }]);

    const stale = await thrown(publishDraft(db(), menu("marketing"), { expectDraftVersion: menuDraft.draftVersion, author: null }));
    expect(stale).toMatchObject({ code: "STALE_BASE" });
    await discardDraft(db(), menu("marketing"));
    expect(marketingBefore.category).toBe("marketing");
  });
});
