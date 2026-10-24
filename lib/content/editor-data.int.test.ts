import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { addColumn, addItem, moveGroupToColumn, nextTarget, removeColumn, type Menu } from "./editor/menu-ops";
import { editAndPublish, liveDocument, liveVersion, refusedEdit } from "@/tests/helpers/content-lifecycle";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { createDraft, discardDraft } from "./drafts";
import { Invalid } from "./errors";
import { listSummaries } from "./summaries";
import { validateSnapshot } from "./validate";
import { loadVocabulary } from "./vocabulary";

// What the 3d-3 editors lean on that only a real database can confirm: the menu's pickers hold exactly the category's published
// products, shapes and options; a menu edited with the editor's own operations publishes and comes back as edited; the server still
// refuses what the pickers do not offer; the UI-copy rule runs at publish; posts are listed under their category.

let seeded: SeededDatabase;
beforeAll(async () => {
  seeded = await createSeededDatabase("editor-data");
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const db = () => seeded.db;
const rows = async <T extends object>(sql: string, params: unknown[] = []): Promise<T[]> => (await seeded.scratch.pool.query(sql, params)).rows as T[];
const menu = (category: string) => ({ type: "menu" as const, id: category });
const issuesOf = (error: unknown) => (error instanceof Invalid ? error.issues : []);

describe("the menu's pickers", () => {
  it("hold the published products, shapes and options of the category — all of them, and no other category's", async () => {
    for (const category of ["marketing", "tet"]) {
      const vocab = await loadVocabulary(db(), ["product", "shape", "option"], { category });
      const [counts] = await rows<{ products: number; shapes: number; options: number }>(
        `select (select count(*) from product where category_id = $1)::int products,
                (select count(*) from shape s join product p on p.id = s.product_id where p.category_id = $1)::int shapes,
                (select count(*) from option o join product p on p.id = o.product_id where p.category_id = $1)::int options`,
        [category],
      );
      expect(vocab.product).toHaveLength(counts.products);
      expect(vocab.shape).toHaveLength(counts.shapes);
      expect(vocab.option).toHaveLength(counts.options);
      const products = new Set(vocab.product!.map((product) => product.value));
      expect([...vocab.shape!, ...vocab.option!].every((target) => target.group !== undefined && products.has(target.group)), category).toBe(true);
      expect([...vocab.shape!, ...vocab.option!].every((target) => target.label.trim() !== ""), category).toBe(true);
    }
  });

  it("leave shapes and options out when no category scopes them, and keep every category's products for the other editors", async () => {
    const all = await loadVocabulary(db(), ["product", "shape", "option"]);
    expect(all.shape).toBeUndefined();
    expect(all.product).toHaveLength(25);
  });
});

describe("a menu edited with the editor's operations", () => {
  it("publishes and comes back as edited: a group moved to a new column, a link added", async () => {
    const before = await liveDocument(db(), menu("marketing"));
    const versionBefore = (await liveVersion(db(), menu("marketing")))!;
    const vocab = await loadVocabulary(db(), ["product", "shape", "option"], { category: "marketing" });
    const moved = before.columns[0].groups[0].product;
    const added = nextTarget(before as Menu, vocab, moved);
    expect(added).not.toBeNull();

    let expected: Menu = before as Menu;
    await editAndPublish(db(), menu("marketing"), (doc) => {
      let next = moveGroupToColumn(addColumn(doc as Menu), moved, doc.columns.length);
      // The column the group left may be empty now, and an empty column is refused: the editor deletes it, so the test does.
      for (let empty = next.columns.findIndex((column) => column.groups.length === 0); empty !== -1; empty = next.columns.findIndex((column) => column.groups.length === 0)) next = removeColumn(next, empty);
      expected = addItem(next, moved, added!);
      Object.assign(doc, expected);
    });

    const after = await liveDocument(db(), menu("marketing"));
    expect(after).toEqual(expected);
    expect(after.columns.at(-1)?.groups.map((group) => group.product)).toEqual([moved]);
    expect(after.columns.at(-1)?.groups[0].items.at(-1)?.target).toEqual(added);
    expect(after.columns.flatMap((column) => column.groups)).toHaveLength(before.columns.flatMap((column) => column.groups).length);
    expect(await liveVersion(db(), menu("marketing"))).toBe(versionBefore + 1);
  });

  it("is refused when a link points at a shape of another category's product — the server resolves targets itself", async () => {
    const [foreign] = await rows<{ uid: string }>(`select s.uid::text uid from shape s join product p on p.id = s.product_id where p.category_id <> 'office' limit 1`);
    const error = await refusedEdit(db(), menu("office"), (doc) => {
      doc.columns[0].groups[0].items.push({ target: { shape: foreign.uid }, isFast: false, image: null, i18n: {} });
    });
    expect(issuesOf(error).map((issue) => issue.message)).toEqual([expect.stringContaining("không thuộc sản phẩm của nhóm")]);
    expect(issuesOf(error)[0].path).toMatch(/^columns\[0\]\.groups\[0\]\.items\[\d+\]\.target$/);
  });

  it("is refused when a link points at a shape that does not exist (one that lives only in an unpublished product draft)", async () => {
    const error = await refusedEdit(db(), menu("office"), (doc) => {
      doc.columns[0].groups[0].items.push({ target: { shape: "99999999-9999-4999-8999-999999999999" }, isFast: false, image: null, i18n: {} });
    });
    expect(error).toBeInstanceOf(Invalid);
  });

  it("is refused while a column is empty, and says which", async () => {
    const error = await refusedEdit(db(), menu("office"), (doc) => {
      Object.assign(doc, addColumn(doc as Menu));
    });
    expect(issuesOf(error)).toEqual([expect.objectContaining({ path: expect.stringMatching(/^columns\[\d+\]$/), message: expect.stringContaining("chưa có sản phẩm nào") })]);
  });
});

describe("the UI-copy rule at publish", () => {
  const ref = { type: "site_message" as const, id: "shopCategories" };

  it("publishes a translation that keeps the variable, and a text left empty in a language that is not a master one", async () => {
    await editAndPublish(db(), ref, (doc) => {
      const data = doc.data as Record<string, Record<string, unknown>>;
      data.zh.itemCount = "{count} 个产品";
      data.ko.itemCount = "";
    });
    const live = (await liveDocument(db(), ref)).data as Record<string, Record<string, string>>;
    expect(live.zh.itemCount).toBe("{count} 个产品");
    expect(live.ko.itemCount).toBe("");
  });

  it("refuses a variable the Vietnamese text does not have, naming the language and the text", async () => {
    const error = await refusedEdit(db(), ref, (doc) => {
      (doc.data as Record<string, Record<string, unknown>>).ja.itemCount = "{total} 商品";
    });
    expect(issuesOf(error)).toEqual([expect.objectContaining({ path: "data.ja.itemCount", message: expect.stringContaining("{total}") })]);
  });

  it("advises the editor of the same problem while the draft is still being written", async () => {
    const live = await liveDocument(db(), ref);
    const draft = structuredClone(live) as unknown as { data: Record<string, Record<string, unknown>> };
    draft.data.en.itemCount = "{count products";
    const issues = await validateSnapshot(db(), "site_message", draft);
    expect(issues).toEqual([expect.objectContaining({ path: "data.en.itemCount" })]);
  });
});

describe("the post list", () => {
  it("files each post under its post category, live or still a draft", async () => {
    const posts = await listSummaries(db(), "post");
    const stored = await rows<{ uid: string; category_key: string }>(`select uid::text uid, category_key from post`);
    expect(posts).toHaveLength(stored.length);
    for (const row of stored) expect(posts.find((post) => post.ref.id === row.uid)?.group).toBe(row.category_key);
  });

  it("files a post that exists only as a draft under the category its draft names", async () => {
    const [{ key }] = await rows<{ key: string }>(`select key from post_category limit 1`);
    const draft = await createDraft(db(), "post", { snapshot: { category: key, i18n: { vi: { title: "Bài mới" } } } }, null);
    expect((await listSummaries(db(), "post")).find((post) => post.ref.id === draft.ref.id)).toMatchObject({ group: key, version: null, label: "Bài mới" });
    await discardDraft(db(), draft.ref);
  });
});
