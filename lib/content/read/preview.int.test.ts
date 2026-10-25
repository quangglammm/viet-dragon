import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { composeEntity, type EntityRef } from "@/lib/content/compose";
import { createDraft, openDraft, saveDraft } from "@/lib/content/drafts";
import type { DocumentFor, ProductDocument } from "@/lib/content/schemas";
import { LOCALES } from "@/lib/content/schemas";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { loadBlog, loadCatalog, loadFastPrint, loadMenus, loadMessages } from "./load";
import { loadPreviewOverlay } from "./preview";
import { previewPathOf } from "./preview-target";
import { resolveUrl } from "./urls";

// The preview on a database seeded from the real site: drafts laid over the published reads change what the builders produce, and
// only that — the rows stay as they were, and what cannot be shown is held back with its reason.

let seeded: SeededDatabase;

beforeAll(async () => {
  seeded = await createSeededDatabase("read-preview");
}, 180_000);
afterAll(async () => {
  await seeded.close();
});
afterEach(async () => {
  await seeded.scratch.pool.query("delete from content_draft");
});

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

/** Edits the entity's draft the way the editor does: open (or start) it, change a copy of the document, autosave. */
async function editDraft<T extends EntityRef["type"]>(ref: EntityRef & { type: T }, mutate: (document: DocumentFor<T>) => void): Promise<void> {
  const draft = await openDraft(seeded.db, ref, null);
  const document = structuredClone(draft.snapshot) as unknown as DocumentFor<T>;
  mutate(document);
  await saveDraft(seeded.db, ref, { snapshot: document, expectDraftVersion: draft.draftVersion, author: null });
}

describe("the catalog with a draft laid over it", () => {
  it("shows an edited product's new title, while the published read and the rows keep the old one", async () => {
    const published = await loadCatalog(seeded.db);
    const product = published.products[0];
    await editDraft({ type: "product", id: product.uid }, (document) => {
      document.i18n.vi = { ...document.i18n.vi!, title: "Tiêu đề bản nháp" };
    });

    const overlay = await loadPreviewOverlay(seeded.db);
    expect(overlay.skipped).toEqual([]);
    expect(overlay.applied).toEqual([{ ref: { type: "product", id: product.uid }, label: "Tiêu đề bản nháp", isNew: false }]);

    const previewed = await loadCatalog(seeded.db, overlay);
    expect(previewed.products.find((candidate) => candidate.uid === product.uid)?.title.vi).toBe("Tiêu đề bản nháp");
    expect(previewed.products).toHaveLength(published.products.length);

    expect((await loadCatalog(seeded.db)).products.find((candidate) => candidate.uid === product.uid)?.title.vi).toBe(product.title.vi);
    expect((await composeEntity(seeded.db, "product", product.uid))?.document.i18n.vi?.title).toBe(product.title.vi);
  });

  it("gives a product that was never published its own page, at the URL its draft names", async () => {
    const published = await loadCatalog(seeded.db);
    const source = (await composeEntity(seeded.db, "product", published.products[0].uid))!.document;
    // Every uid in the copy is new, so shapes and options stay consistent with each other (scopes point at the copy's own shapes).
    const ids = new Map<string, string>();
    const copy = JSON.parse(JSON.stringify(source).replace(UUID, (id) => ids.get(id) ?? ids.set(id, randomUUID()).get(id)!)) as ProductDocument;
    for (const locale of LOCALES) copy.slugs[locale] = { slug: `xem-truoc-${locale}`, aliases: [] };
    copy.i18n.vi = { ...copy.i18n.vi!, title: "Sản phẩm chỉ có trong bản xem trước" };
    const created = await createDraft(seeded.db, "product", { snapshot: copy }, null);

    const overlay = await loadPreviewOverlay(seeded.db);
    expect(overlay.skipped).toEqual([]);
    expect(overlay.applied).toEqual([{ ref: created.ref, label: "Sản phẩm chỉ có trong bản xem trước", isNew: true }]);

    const previewed = await loadCatalog(seeded.db, overlay);
    expect(previewed.products).toHaveLength(published.products.length + 1);
    const path = previewPathOf(created.ref, "vi", { catalog: previewed, blog: await loadBlog(seeded.db, overlay) });
    expect(path).toMatch(/\/xem-truoc-vi$/);
    const [, , category, product] = path.split("/");
    expect(resolveUrl(previewed, "vi", { category, product })).toMatchObject({ status: "ok" });
    // The same address on the published site is a 404.
    expect(resolveUrl(published, "vi", { category, product })).toEqual({ status: "notFound" });
  });

  it("holds an invalid draft back, with the first thing wrong with it, and shows the published product instead", async () => {
    const published = await loadCatalog(seeded.db);
    const product = published.products[1];
    await editDraft({ type: "product", id: product.uid }, (document) => {
      delete document.i18n.vi;
    });

    const overlay = await loadPreviewOverlay(seeded.db);
    expect(overlay.applied).toEqual([]);
    expect(overlay.skipped).toHaveLength(1);
    expect(overlay.skipped[0].ref).toEqual({ type: "product", id: product.uid });
    expect(overlay.skipped[0].issue).not.toBe("");
    expect((await loadCatalog(seeded.db, overlay)).products.find((candidate) => candidate.uid === product.uid)?.title.vi).toBe(product.title.vi);
  });

  it("takes an archived draft out of the site, like publishing it would", async () => {
    const published = await loadCatalog(seeded.db);
    const product = published.products[2];
    await editDraft({ type: "product", id: product.uid }, (document) => {
      document.status = "archived";
    });
    const previewed = await loadCatalog(seeded.db, await loadPreviewOverlay(seeded.db));
    expect(previewed.products.map((candidate) => candidate.uid)).not.toContain(product.uid);
    expect(published.products.map((candidate) => candidate.uid)).toContain(product.uid);
  });
});

describe("the other reads", () => {
  it("shows an edited post, a new status and the blog's own order", async () => {
    const published = await loadBlog(seeded.db);
    const [first, second] = published.posts;
    await editDraft({ type: "post", id: first.uid }, (document) => {
      document.i18n.vi = { ...document.i18n.vi!, title: "Bài viết đã sửa" };
    });
    await editDraft({ type: "post", id: second.uid }, (document) => {
      document.status = "archived";
    });
    const previewed = await loadBlog(seeded.db, await loadPreviewOverlay(seeded.db));
    expect(previewed.posts.find((post) => post.uid === first.uid)?.title.vi).toBe("Bài viết đã sửa");
    expect(previewed.posts.map((post) => post.uid)).not.toContain(second.uid);
    expect(previewed.posts).toHaveLength(published.posts.length - 1);
  });

  it("shows an edited menu", async () => {
    const published = await loadMenus(seeded.db);
    const before = published.marketing.columns.length;
    expect(before).toBeGreaterThan(1);
    await editDraft({ type: "menu", id: "marketing" }, (document) => {
      document.columns.pop();
    });
    const previewed = await loadMenus(seeded.db, await loadPreviewOverlay(seeded.db));
    expect(previewed.marketing.columns).toHaveLength(before - 1);
    expect(previewed.office).toEqual(published.office);
  });

  it("shows an edited UI text in its language, over the file's defaults", async () => {
    const before = (await loadMessages(seeded.db, "vi")) as { siteMeta: { title: string } };
    await editDraft({ type: "site_message", id: "siteMeta" }, (document) => {
      document.data.vi = { ...document.data.vi, title: "Tên website thử" };
    });
    const overlay = await loadPreviewOverlay(seeded.db);
    expect(overlay.skipped).toEqual([]);
    expect(((await loadMessages(seeded.db, "vi", overlay)) as { siteMeta: { title: string } }).siteMeta.title).toBe("Tên website thử");
    expect(((await loadMessages(seeded.db, "en", overlay)) as { siteMeta: { title: string } }).siteMeta.title).not.toBe("Tên website thử");
    expect(((await loadMessages(seeded.db, "vi")) as { siteMeta: { title: string } }).siteMeta.title).toBe(before.siteMeta.title);
  });

  it("shows an edited Fast Print price", async () => {
    const published = await loadFastPrint(seeded.db);
    const item = published.items[0];
    await editDraft({ type: "fast_print_item", id: item.uid }, (document) => {
      document.fromPrice = 987_000;
    });
    const previewed = await loadFastPrint(seeded.db, await loadPreviewOverlay(seeded.db));
    expect(previewed.items.find((candidate) => candidate.uid === item.uid)?.fromPrice).toBe(987_000);
    expect((await loadFastPrint(seeded.db)).items.find((candidate) => candidate.uid === item.uid)?.fromPrice).toBe(item.fromPrice);
  });
});

describe("a preview that is empty", () => {
  it("reads exactly what the published read does", async () => {
    const overlay = await loadPreviewOverlay(seeded.db);
    expect(overlay.applied).toEqual([]);
    expect(overlay.skipped).toEqual([]);
    expect(await loadCatalog(seeded.db, overlay)).toEqual(await loadCatalog(seeded.db));
    expect(await loadMenus(seeded.db, overlay)).toEqual(await loadMenus(seeded.db));
    expect(await loadBlog(seeded.db, overlay)).toEqual(await loadBlog(seeded.db));
  });
});
