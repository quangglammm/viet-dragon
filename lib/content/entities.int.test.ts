import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { slugsOf } from "@/tests/fixtures/documents";
import { editAndPublish, liveDocument, liveVersion, type RefOf } from "@/tests/helpers/content-lifecycle";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import { composeEntity, listEntities } from "./compose";
import { deleteEntity } from "./delete";
import { createDraft, discardDraft, openDraft, saveDraft } from "./drafts";
import { Invalid } from "./errors";
import { publishDraft } from "./publish";
import { listRevisions, startRestore } from "./restore";
import { listSummaries } from "./summaries";

// Every entity type through the shipped services: the seeded data round-trips, and a new record of each type can be created,
// edited, archived, deleted and brought back.

let seeded: SeededDatabase;
beforeAll(async () => {
  seeded = await createSeededDatabase("entities");
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const db = () => seeded.db;
const pool = () => seeded.scratch.pool;
const rows = async <T extends object>(sql: string, params: unknown[] = []): Promise<T[]> => (await pool().query(sql, params)).rows as T[];
const thrown = (promise: Promise<unknown>) => promise.then(() => null, (error: unknown) => error);
const json = (value: unknown) => JSON.stringify(value);
const asRecord = (value: unknown) => value as Record<string, unknown>;

describe("publishing every seeded entity unchanged", () => {
  it("stores each of the 198 documents exactly as composed, one new revision and one version each", async () => {
    const refs = await listEntities(db());
    expect(refs).toHaveLength(seeded.outcome.revisions);

    const before = new Map<string, { document: string; version: number }>();
    for (const ref of refs) {
      const composed = (await composeEntity(db(), ref.type, ref.id))!;
      before.set(`${ref.type}:${ref.id}`, { document: json(composed.document), version: composed.version });
    }
    const revisionsBefore = Number((await rows<{ n: number }>(`select count(*)::int n from content_revision`))[0].n);

    const changed: string[] = [];
    const wrongVersion: string[] = [];
    for (const ref of refs) {
      await editAndPublish(db(), ref as RefOf<DraftEntityType>, () => undefined);
      const after = (await composeEntity(db(), ref.type, ref.id))!;
      const was = before.get(`${ref.type}:${ref.id}`)!;
      if (json(after.document) !== was.document) changed.push(`${ref.type}:${ref.id}`);
      if (after.version !== was.version + 1) wrongVersion.push(`${ref.type}:${ref.id} ${was.version}→${after.version}`);
    }
    expect(changed, "documents that changed by being published unchanged").toEqual([]);
    expect(wrongVersion).toEqual([]);
    expect(Number((await rows<{ n: number }>(`select count(*)::int n from content_revision`))[0].n)).toBe(revisionsBefore + refs.length);
    expect(await rows(`select 1 from content_draft`)).toEqual([]);
  });
});

interface Subject {
  type: DraftEntityType;
  /** The immutable key of a vocabulary record; uid entities get a generated uid. */
  key?: string;
  document: (seed: Seed) => Record<string, unknown>;
  /** One field the editor changes: [dotted path, new value]. */
  edit: [string, unknown];
  /** Products, posts and Fast Print items must be archived before they can be deleted. */
  archiveFirst?: boolean;
  /** Structural records (categories) are never deleted. */
  permanent?: boolean;
}

interface Seed {
  image: string;
  postCategory: string;
  unit: string;
}

const both = (vi: string, en: string) => ({ vi: { name: vi }, en: { name: en } });
const labels = (vi: string, en: string) => ({ vi: { label: vi }, en: { label: en } });

const SUBJECTS: Subject[] = [
  { type: "material", key: "vat-lieu-moi", document: () => ({ icon: null, i18n: both("Vật liệu mới", "New stock") }), edit: ["i18n.vi.name", "Vật liệu đã sửa"] },
  { type: "trait", key: "dac-diem-moi", document: () => ({ icon: "Sparkles", i18n: { vi: { label: "Đặc điểm", description: "Mô tả" }, en: { label: "Trait" } } }), edit: ["i18n.en.label", "Edited trait"] },
  { type: "unit", key: "don-vi-moi", document: () => ({ i18n: labels("Đơn vị", "Unit") }), edit: ["i18n.vi.label", "Đơn vị đã sửa"] },
  { type: "spec_item", key: "technique/in-moi", document: () => ({ isDefault: false, i18n: labels("In mới", "New printing") }), edit: ["isDefault", true] },
  { type: "post_category", key: "chuyen-muc-moi", document: () => ({ i18n: labels("Chuyên mục", "Section") }), edit: ["i18n.en.label", "Edited section"] },
  {
    type: "category",
    key: "danh-muc-moi",
    document: () => ({ slugs: slugsOf<string>("danh-muc-moi", "new-category"), icon: "Briefcase", cover: null, ogImage: null, position: 9, i18n: both("Danh mục mới", "New category") }),
    edit: ["position", 7],
    permanent: true,
  },
  {
    type: "post",
    archiveFirst: true,
    document: (seed) => ({
      slugs: slugsOf<string>("bai-viet-moi", "new-post"),
      category: seed.postCategory,
      publishedOn: "2026-10-24",
      readTimeMin: 3,
      cover: null,
      ogImage: null,
      contentFormat: "plain",
      status: "published",
      i18n: { vi: { title: "Bài mới", content: "Nội dung" }, en: { title: "New post", content: "Body" } },
    }),
    edit: ["i18n.vi.title", "Bài đã sửa"],
  },
  {
    type: "fast_print_item",
    archiveFirst: true,
    document: (seed) => ({ key: "fast-moi", image: null, icon: "Zap", turnaroundHours: 24, fromPrice: 1000, unit: seed.unit, position: 99, status: "published", i18n: both("In nhanh mới", "New fast print") }),
    edit: ["fromPrice", 2500],
  },
  {
    type: "showcase_item",
    document: (seed) => ({ key: "showcase-moi", media: seed.image, aspect: "wide", position: 99, i18n: labels("Ảnh mới", "New picture") }),
    edit: ["aspect", "tall"],
  },
  { type: "site_message", key: "thuNghiem", document: () => ({ data: { vi: { a: { b: "x" } }, en: { a: { b: "y" } } } }), edit: ["data.vi.a.b", "đã sửa"] },
];

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  const last = parts.pop()!;
  const holder = parts.reduce<Record<string, unknown>>((node, part) => node[part] as Record<string, unknown>, target);
  holder[last] = value;
}

describe.each(SUBJECTS)("a new $type", (subject) => {
  let seed: Seed;
  let ref: RefOf<DraftEntityType>;
  let expected: Record<string, unknown>;

  beforeAll(async () => {
    const [{ storage_key: image }] = await rows<{ storage_key: string }>(`select storage_key from media where kind = 'image' limit 1`);
    const [{ key: postCategory }] = await rows<{ key: string }>(`select key from post_category limit 1`);
    const [{ key: unit }] = await rows<{ key: string }>(`select key from unit limit 1`);
    seed = { image, postCategory, unit };
  });

  it("is created at version 1 and stored as written", async () => {
    const draft = await createDraft(db(), subject.type, { key: subject.key, snapshot: subject.document(seed) }, null);
    ref = draft.ref as RefOf<DraftEntityType>;
    const identity = subject.key === undefined ? { uid: ref.id } : { key: subject.key };
    expected = { schema: 2, ...identity, ...subject.document(seed) };
    const result = await publishDraft(db(), ref, { expectDraftVersion: draft.draftVersion, author: null });
    expect(result).toMatchObject({ version: 1, action: "create" });
    expect(asRecord(await liveDocument(db(), ref))).toEqual(expected);
    expect(await rows(`select 1 from content_draft where entity_type = $1`, [subject.type])).toEqual([]);
  });

  it("can be edited: the change is stored, the version moves, a revision is written", async () => {
    const edited = structuredClone(expected);
    setPath(edited, ...subject.edit);
    const result = await editAndPublish(db(), ref, (doc) => setPath(asRecord(doc), ...subject.edit));
    expect(result).toMatchObject({ version: 2, action: "update" });
    expect(asRecord(await liveDocument(db(), ref))).toEqual(edited);
    expect((await listRevisions(db(), ref)).map((r) => [r.version, r.action])).toEqual([[2, "update"], [1, "create"]]);
    expected = edited;
  });

  it("shows in the list, with its Vietnamese label and no draft", async () => {
    const summaries = await listSummaries(db(), subject.type);
    const mine = summaries.find((s) => s.ref.id === ref.id);
    expect(mine).toMatchObject({ version: 2, draft: null });
    expect(mine?.label).toBeTruthy();
  });

  it("is archived first when the type has a status, and then deleted", async () => {
    if (subject.permanent) {
      expect(await thrown(deleteEntity(db(), ref, { author: null }))).toBeInstanceOf(Invalid);
      expect(await composeEntity(db(), ref.type, ref.id)).not.toBeNull();
      return;
    }
    if (subject.archiveFirst) {
      expect(await thrown(deleteEntity(db(), ref, { author: null }))).toMatchObject({ code: "NOT_ARCHIVED" });
      const archived = await editAndPublish(db(), ref, (doc) => void (asRecord(doc).status = "archived"));
      expect(archived).toMatchObject({ version: 3, action: "archive" });
    }
    const before = (await liveVersion(db(), ref))!;
    const deleted = await deleteEntity(db(), ref, { author: null, comment: "dọn dẹp" });
    expect(deleted.version).toBe(before + 1);
    expect(await composeEntity(db(), ref.type, ref.id)).toBeNull();
    expect(await listRevisions(db(), ref).then((all) => all[0])).toMatchObject({ version: before + 1, action: "delete", comment: "dọn dẹp" });
  });

  it.skipIf(subject.permanent)("can be brought back from its last revision: the numbering continues instead of colliding", async () => {
    const [latest] = await listRevisions(db(), ref);
    const draft = await startRestore(db(), ref, latest.version, null);
    expect(draft.baseVersion).toBeNull();
    const result = await publishDraft(db(), ref, { expectDraftVersion: draft.draftVersion, author: null });
    expect(result).toMatchObject({ version: latest.version + 1, action: "restore" });
    expect((await composeEntity(db(), ref.type, ref.id))?.version).toBe(latest.version + 1);
  });
});

describe("renaming a URL", () => {
  it("a post keeps its old slug in the language it was renamed in — and only there", async () => {
    const subject = SUBJECTS.find((s) => s.type === "post")!;
    const [{ key: postCategory }] = await rows<{ key: string }>(`select key from post_category limit 1`);
    const draft = await createDraft(db(), "post", { snapshot: { ...subject.document({ image: "", postCategory, unit: "" }), slugs: slugsOf<string>("bai-doi-ten", "rename-post") } }, null);
    const ref = draft.ref as RefOf<"post">;
    await publishDraft(db(), ref, { expectDraftVersion: draft.draftVersion, author: null });

    await editAndPublish(db(), ref, (doc) => {
      doc.slugs.vi.slug = "bai-da-doi-ten";
      doc.slugs.vi.aliases = ["bai-co-san"];
    });
    await editAndPublish(db(), ref, (doc) => void (doc.slugs.vi.slug = "bai-doi-ten-lan-hai"));
    const post = await liveDocument(db(), ref);
    expect(post.slugs.vi.slug).toBe("bai-doi-ten-lan-hai");
    expect(post.slugs.vi.aliases).toEqual(["bai-co-san", "bai-da-doi-ten", "bai-doi-ten"]);
    expect(post.slugs.en).toEqual({ slug: "rename-post", aliases: [] });
    const claimed = await rows<{ post_id: string }>(`select post_id from post_slug where locale = 'vi' and slug = 'bai-doi-ten'`);
    expect(claimed).toHaveLength(1);
  });

  it("a category keeps its old segment, and a post cannot take another post's URL", async () => {
    const existing = await liveDocument(db(), { type: "category", id: "tet" });
    const oldVi = existing.slugs.vi.slug;
    await editAndPublish(db(), { type: "category", id: "tet" }, (doc) => void (doc.slugs.vi.slug = "an-pham-tet-moi"));
    const after = await liveDocument(db(), { type: "category", id: "tet" });
    expect(after.slugs.vi.aliases).toContain(oldVi);
    expect(after.slugs.en).toEqual(existing.slugs.en);
    await editAndPublish(db(), { type: "category", id: "tet" }, (doc) => void (doc.slugs.vi.slug = oldVi));

    const [other] = await rows<{ uid: string }>(`select uid from post limit 1`);
    const taken = (await liveDocument(db(), { type: "post", id: other.uid })).slugs.vi.slug;
    const [{ key: postCategory }] = await rows<{ key: string }>(`select key from post_category limit 1`);
    const subject = SUBJECTS.find((s) => s.type === "post")!;
    const draft = await createDraft(db(), "post", { snapshot: { ...subject.document({ image: "", postCategory, unit: "" }), slugs: slugsOf<string>(taken, "another-post") } }, null);
    const refused = await thrown(publishDraft(db(), draft.ref, { expectDraftVersion: draft.draftVersion, author: null }));
    expect(refused).toBeInstanceOf(Invalid);
    expect((refused as Invalid).issues[0].message).toMatch(/bài khác/);
    await discardDraft(db(), draft.ref);
  });
});

describe("a site message", () => {
  const ref = { type: "site_message" as const, id: "thuNghiemVersion" };

  it("has one version for all its languages: the highest row, and a publish moves every language to the next", async () => {
    const draft = await createDraft(db(), "site_message", { key: ref.id, snapshot: { data: { vi: { t: "vi" }, en: { t: "en" }, zh: { t: "zh" } } } }, null);
    await publishDraft(db(), ref, { expectDraftVersion: draft.draftVersion, author: null });
    await pool().query(`update site_message set version = 5 where namespace = $1 and locale = 'vi'`, [ref.id]);
    expect(await liveVersion(db(), ref)).toBe(5);

    const published = await editAndPublish(db(), ref, (doc) => void (doc.data.en = { t: "edited" }));
    expect(published.version).toBe(6);
    expect((await rows<{ locale: string; version: number }>(`select locale, version from site_message where namespace = $1 order by locale`, [ref.id])).map((r) => r.version)).toEqual([6, 6, 6]);
  });

  it("drops a language that the document no longer contains, and goes stale when one row is bumped behind a draft", async () => {
    await editAndPublish(db(), ref, (doc) => void delete doc.data.zh);
    expect((await rows<{ locale: string }>(`select locale from site_message where namespace = $1 order by locale`, [ref.id])).map((r) => r.locale)).toEqual(["en", "vi"]);

    const draft = await openDraft(db(), ref, null);
    await pool().query(`update site_message set version = version + 1 where namespace = $1 and locale = 'en'`, [ref.id]);
    expect(await thrown(publishDraft(db(), ref, { expectDraftVersion: draft.draftVersion, author: null }))).toMatchObject({ code: "STALE_BASE" });
    await discardDraft(db(), ref);
  });

  it("refuses a document without any language", async () => {
    const draft = await openDraft(db(), ref, null);
    const saved = await saveDraft(db(), ref, { snapshot: { ...draft.snapshot, data: {} }, expectDraftVersion: draft.draftVersion, author: null });
    const refused = await thrown(publishDraft(db(), ref, { expectDraftVersion: saved.draftVersion, author: null }));
    expect((refused as Invalid).issues).toContainEqual({ path: "data", message: "Cần có nội dung của ít nhất một ngôn ngữ." });
    await discardDraft(db(), ref);
  });
});

describe("the lists", () => {
  it("show a brand-new draft before it is published, and an open draft next to its live row", async () => {
    const fresh = await createDraft(db(), "unit", { key: "chua-xuat-ban", snapshot: { i18n: labels("Chưa xuất bản", "Unpublished") } }, null);
    const [live] = await rows<{ key: string }>(`select key from unit limit 1`);
    await openDraft(db(), { type: "unit", id: live.key }, null);

    const summaries = await listSummaries(db(), "unit");
    expect(summaries.find((s) => s.ref.id === "chua-xuat-ban")).toMatchObject({ label: "Chưa xuất bản", version: null, updatedAt: null, draft: { baseVersion: null } });
    expect(summaries.find((s) => s.ref.id === live.key)?.draft).toMatchObject({ draftVersion: 1 });
    await discardDraft(db(), fresh.ref);
    await discardDraft(db(), { type: "unit", id: live.key });
  });

  it("name the category of a product, live or still a draft (the product list groups by it), and of nothing else", async () => {
    const [live] = await rows<{ uid: string; category_id: string }>(`select uid::text as uid, category_id from product limit 1`);
    const fresh = await createDraft(db(), "product", { snapshot: { category: "tet", i18n: { vi: { title: "Sản phẩm mới" } } } }, null);

    const products = await listSummaries(db(), "product");
    expect(products.find((s) => s.ref.id === live.uid)?.group).toBe(live.category_id);
    expect(products.find((s) => s.ref.id === fresh.ref.id)).toMatchObject({ group: "tet", version: null });
    expect((await listSummaries(db(), "unit")).every((s) => s.group === null)).toBe(true);
    await discardDraft(db(), fresh.ref);
  });

  it("list every entity of every type", async () => {
    const refs = await listEntities(db());
    const total = (await Promise.all([...new Set(refs.map((r) => r.type))].map((type) => listSummaries(db(), type)))).flat();
    expect(total.length).toBeGreaterThanOrEqual(refs.length);
  });
});
