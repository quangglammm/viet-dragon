import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { slugsOf } from "@/tests/fixtures/documents";
import { editAndPublish, liveDocument, liveVersion } from "@/tests/helpers/content-lifecycle";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { releaseAlias } from "./aliases";
import { createDraft, discardDraft, getDraft, openDraft, rebaseDraft, saveDraft } from "./drafts";
import { Conflict, Invalid, NotFound } from "./errors";
import { publishDraft } from "./publish";
import { getRevision, listRevisions, startRestore } from "./restore";
import type { ProductDocument } from "./schemas";
import { USAGES, usedBy } from "./used-by";
import { validateSnapshot } from "./validate";

let seeded: SeededDatabase;
beforeAll(async () => {
  seeded = await createSeededDatabase("draft-lifecycle");
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const db = () => seeded.db;
const pool = () => seeded.scratch.pool;
const ref = (key: string) => {
  const product = seeded.outcome.products.get(key);
  if (!product) throw new Error(`no seeded product ${key}`);
  return { type: "product" as const, id: product.uid };
};
const rows = async <T extends object>(sql: string, params: unknown[] = []): Promise<T[]> => (await pool().query(sql, params)).rows as T[];
const thrown = (promise: Promise<unknown>) => promise.then(() => null, (error: unknown) => error);

describe("draft → preview → publish", () => {
  const target = () => ref("marketing/to-roi");

  it("saving a draft leaves the live entity alone; autosave moves the lock token forward", async () => {
    const before = await liveDocument(db(), target());
    const draft = await openDraft(db(), target(), null);
    expect(draft.baseVersion).toBe(await liveVersion(db(), target()));
    const edited = structuredClone(draft.snapshot) as unknown as ProductDocument;
    edited.i18n.vi!.title += " — bản nháp";
    const first = await saveDraft(db(), target(), { snapshot: edited, expectDraftVersion: draft.draftVersion, author: null });
    edited.i18n.en!.title += " (draft)";
    const second = await saveDraft(db(), target(), { snapshot: edited, expectDraftVersion: first.draftVersion, author: null });

    expect(first.draftVersion).toBe(draft.draftVersion + 1);
    expect(second.draftVersion).toBe(draft.draftVersion + 2);
    expect(await liveDocument(db(), target())).toEqual(before);

    // A co-editor still holding the old lock token cannot overwrite the newer save.
    const stale = await thrown(saveDraft(db(), target(), { snapshot: edited, expectDraftVersion: first.draftVersion, author: null }));
    expect(stale).toMatchObject({ code: "DRAFT_CHANGED" });
    // Publishing is bound to what was previewed: a draft saved after the preview is refused.
    const unseen = await thrown(publishDraft(db(), target(), { expectDraftVersion: first.draftVersion, author: null }));
    expect(unseen).toMatchObject({ code: "DRAFT_CHANGED" });
    expect(await getDraft(db(), target())).not.toBeNull();

    const published = await publishDraft(db(), target(), { expectDraftVersion: second.draftVersion, author: null });
    expect(published.version).toBe(draft.baseVersion! + 1);
    expect((await liveDocument(db(), target())).i18n.vi!.title).toMatch(/bản nháp$/);
    expect(await getDraft(db(), target())).toBeNull();
    expect(await rows(`select 1 from draft_reference`)).toEqual([]);
    expect(await thrown(publishDraft(db(), target(), { expectDraftVersion: second.draftVersion, author: null }))).toMatchObject({ code: "GONE" });
  });

  it("publishing the same draft twice at once: one wins, the other is told the draft is gone", async () => {
    const mine = ref("marketing/catalogues");
    const draft = await openDraft(db(), mine, null);
    const versionBefore = (await liveVersion(db(), mine))!;
    const settled = await Promise.allSettled([
      publishDraft(db(), mine, { expectDraftVersion: draft.draftVersion, author: null }),
      publishDraft(db(), mine, { expectDraftVersion: draft.draftVersion, author: null }),
    ]);
    expect(settled.filter((s) => s.status === "fulfilled")).toHaveLength(1);
    const loser = settled.find((s): s is PromiseRejectedResult => s.status === "rejected");
    expect(loser?.reason).toMatchObject({ code: "GONE" });
    expect(await liveVersion(db(), mine)).toBe(versionBefore + 1);
  });

  it("an open draft is resumed, also when two editors open it at the same moment", async () => {
    const other = ref("marketing/ve-tickets");
    const [a, b] = await Promise.all([openDraft(db(), other, null), openDraft(db(), other, null)]);
    expect(a.id).toBe(b.id);
    expect(await rows(`select 1 from content_draft where entity_uid = $1`, [other.id])).toHaveLength(1);
    await discardDraft(db(), other);
  });

  it("accepts an incomplete draft, advises on what is missing, and refuses to publish it", async () => {
    const draft = await createDraft(db(), "product", { snapshot: { category: "tet", i18n: { vi: { title: "Mới" } } } }, null);
    const issues = await validateSnapshot(db(), "product", draft.snapshot);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.map((i) => i.path)).toEqual(expect.arrayContaining(["slugs", "status", "shapes", "options"]));
    const refused = await thrown(publishDraft(db(), draft.ref, { expectDraftVersion: draft.draftVersion, author: null }));
    expect(refused).toBeInstanceOf(Invalid);
    expect(await getDraft(db(), draft.ref)).not.toBeNull();
    await discardDraft(db(), draft.ref);
  });

  it("refuses a snapshot that is not a JSON object, or that belongs to another entity", async () => {
    const mine = ref("marketing/ve-tickets");
    const draft = await openDraft(db(), mine, null);
    expect(await thrown(saveDraft(db(), mine, { snapshot: [1, 2], expectDraftVersion: draft.draftVersion, author: null }))).toBeInstanceOf(Invalid);
    const foreign = await liveDocument(db(), ref("marketing/to-gap"));
    expect(await thrown(saveDraft(db(), mine, { snapshot: foreign, expectDraftVersion: draft.draftVersion, author: null }))).toMatchObject({ issues: [{ path: "uid" }] });
    // …and the database refuses it too, even if the application is bypassed.
    const sqlError = await thrown(pool().query(`insert into content_draft (entity_type, entity_uid, base_version, snapshot) select 'product', $1, 1, jsonb_build_object('uid', $2::text)`, [ref("marketing/to-gap").id, mine.id]));
    expect(sqlError).toMatchObject({ code: "23514" });
    await discardDraft(db(), mine);
  });

  it("discarding needs the lock token when given one, and removes the draft's references", async () => {
    const mine = ref("marketing/ve-tickets");
    const draft = await openDraft(db(), mine, null);
    expect(await rows(`select 1 from draft_reference where draft_id = $1`, [draft.id])).not.toHaveLength(0);
    expect(await thrown(discardDraft(db(), mine, draft.draftVersion + 5))).toMatchObject({ code: "DRAFT_CHANGED" });
    await discardDraft(db(), mine, draft.draftVersion);
    expect(await getDraft(db(), mine)).toBeNull();
    expect(await rows(`select 1 from draft_reference where draft_id = $1`, [draft.id])).toEqual([]);
    expect(await thrown(discardDraft(db(), mine))).toBeInstanceOf(NotFound);
  });

  it("cannot create what exists, open what does not, or rebase onto nothing", async () => {
    const live = await liveDocument(db(), ref("marketing/ve-tickets"));
    expect(await thrown(createDraft(db(), "material", { key: "giay-loai-c", snapshot: {} }, null))).toMatchObject({ code: "ALREADY_EXISTS" });
    expect(await thrown(openDraft(db(), { type: "product", id: "99999999-9999-4999-8999-999999999999" }, null))).toBeInstanceOf(NotFound);
    expect(await thrown(rebaseDraft(db(), ref("marketing/ve-tickets"), null))).toMatchObject({ code: "GONE" });
    expect(live.uid).toBe(ref("marketing/ve-tickets").id);
    expect(await thrown(createDraft(db(), "material", { snapshot: {} }, null))).toBeInstanceOf(Invalid); // a key entity needs a key
    expect(await thrown(createDraft(db(), "material", { key: "Not A Key", snapshot: {} }, null))).toBeInstanceOf(Invalid);
  });

  it("an entity type without an applier yet answers with a clear refusal", async () => {
    const draft = await createDraft(db(), "trait", { key: "thu-nghiem", snapshot: { icon: "Sparkles", i18n: { vi: { label: "Thử" }, en: { label: "Try" } } } }, null);
    const refused = await thrown(publishDraft(db(), draft.ref, { expectDraftVersion: draft.draftVersion, author: null }));
    expect(refused).toMatchObject({ issues: [{ message: "Loại nội dung này chưa hỗ trợ xuất bản." }] });
    await discardDraft(db(), draft.ref);
  });
});

describe("what an open draft refers to ('used by' sees drafts)", () => {
  const target = () => ref("office/danh-thiep");

  it("an autosave records exactly what the draft points at, and rewrites it on the next save", async () => {
    const draft = await openDraft(db(), target(), null);
    const edited = structuredClone(draft.snapshot) as unknown as ProductDocument;
    edited.options[0].unit = "hop";
    const saved = await saveDraft(db(), target(), { snapshot: edited, expectDraftVersion: draft.draftVersion, author: null });
    const refs = await rows<{ ref_type: string; ref_key: string }>(`select ref_type, ref_key from draft_reference where draft_id = $1`, [draft.id]);
    expect(new Set(refs.map((r) => r.ref_type))).toEqual(new Set(["material", "unit", "trait", "spec_item", "media"]));
    expect(refs).toContainEqual({ ref_type: "unit", ref_key: "hop" });
    expect(await usedBy(db(), "unit", "hop")).toMatchObject({ drafts: 1 });

    edited.options[0].unit = null;
    await saveDraft(db(), target(), { snapshot: edited, expectDraftVersion: saved.draftVersion, author: null });
    expect((await usedBy(db(), "unit", "hop")).drafts).toBe(edited.options.some((o) => o.unit === "hop") ? 1 : 0);
    await discardDraft(db(), target());
    expect(await usedBy(db(), "unit", "hop")).toMatchObject({ drafts: 0 });
  });

  it("counts live rows too (material, trait, spec item)", async () => {
    const [material] = await rows<{ slug: string }>(`select m.slug from material m join option o on o.material_id = m.id limit 1`);
    expect((await usedBy(db(), "material", material.slug)).live).toBeGreaterThan(0);
    const [trait] = await rows<{ trait_key: string }>(`select trait_key from option_bullet where trait_key is not null limit 1`);
    expect((await usedBy(db(), "trait", trait.trait_key)).live).toBeGreaterThan(0);
    const [spec] = await rows<{ id: string }>(`select i.kind || '/' || i.key id from product_spec s join spec_item i on i.id = s.spec_item_id limit 1`);
    expect((await usedBy(db(), "spec_item", spec.id)).live).toBeGreaterThan(0);
    expect(await usedBy(db(), "material", "khong-co")).toEqual({ live: 0, drafts: 0 });
  });

  it("counts the live uses of a unit in Fast Print items as well as in options", async () => {
    const [{ unit_key }] = await rows<{ unit_key: string }>(`select unit_key from fast_print_item where unit_key is not null limit 1`);
    const inOptions = Number((await rows<{ n: number }>(`select count(*)::int n from option where unit_key = $1`, [unit_key]))[0].n);
    const inFastPrint = Number((await rows<{ n: number }>(`select count(*)::int n from fast_print_item where unit_key = $1`, [unit_key]))[0].n);
    expect(inFastPrint).toBeGreaterThan(0);
    expect((await usedBy(db(), "unit", unit_key)).live).toBe(inOptions + inFastPrint);
  });

  it("knows every column that references these tables: a new foreign key cannot slip past 'used by'", async () => {
    const found = await rows<{ tbl: string; col: string; ref: string }>(`
      select c.conrelid::regclass::text tbl, a.attname col, c.confrelid::regclass::text ref
        from pg_constraint c join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
       where c.contype = 'f' and c.confdeltype <> 'c' and c.confrelid::regclass::text in ('material', 'unit', 'trait', 'spec_item')
       order by 1, 2`);
    const registered = Object.entries(USAGES).flatMap(([type, usage]) => usage.columns.map(({ table, column }) => ({ tbl: table, col: column, ref: type })));
    const sort = <T extends { tbl: string; col: string }>(list: T[]) => [...list].sort((a, b) => `${a.tbl}.${a.col}`.localeCompare(`${b.tbl}.${b.col}`));
    expect(sort(registered)).toEqual(sort(found));
  });
});

describe("restoring a revision", () => {
  const target = () => ref("packaging/hop-giay");

  it("lists the revisions newest first and reads one back", async () => {
    await editAndPublish(db(), target(), (d) => void (d.i18n.vi!.title += " (v)"), { comment: "đổi tên" });
    const list = await listRevisions(db(), target());
    expect(list.map((r) => r.version)).toEqual([...list.map((r) => r.version)].sort((a, b) => b - a));
    expect(list[0]).toMatchObject({ comment: "đổi tên", action: "update" });
    const revision = await getRevision(db(), target(), list[0].version);
    expect(revision?.snapshot).toEqual(await liveDocument(db(), target()));
    expect(await getRevision(db(), target(), 9999)).toBeNull();
  });

  it("opens a revision as a draft; it needs publishing, and only one draft can be open", async () => {
    const [latest] = await listRevisions(db(), target());
    const before = await liveDocument(db(), target());
    const first = await listRevisions(db(), target()).then((all) => all[all.length - 1]);
    const draft = await startRestore(db(), target(), first.version, null);
    expect(draft.note).toBe(`restore:${first.version}`);
    expect(draft.baseVersion).toBe(latest.version);
    expect(await liveDocument(db(), target())).toEqual(before);
    expect(await thrown(startRestore(db(), target(), first.version, null))).toMatchObject({ code: "DRAFT_EXISTS" });
    await publishDraft(db(), target(), { expectDraftVersion: draft.draftVersion, author: null });
    expect((await liveDocument(db(), target())).i18n.vi!.title).toBe(before.i18n.vi!.title.replace(" (v)", ""));
    expect(await thrown(startRestore(db(), target(), 9999, null))).toBeInstanceOf(NotFound);
  });

  it("when the library moved on: restoring a revision that needs a deleted record fails clearly and changes nothing", async () => {
    const client = await pool().connect();
    try {
      await client.query("begin");
      await client.query(`insert into material (slug) values ('tam-thoi')`);
      await client.query(`insert into material_i18n (material_id, locale, name) select id, l, 'Tạm thời' from material, unnest(array['vi', 'en']) l where slug = 'tam-thoi'`);
      await client.query("commit");
    } finally {
      client.release();
    }
    const withTemp = await editAndPublish(db(), target(), (d) => {
      d.options.push({ ...structuredClone(d.options[0]), uid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", slugs: slugsOf("tam-thoi-opt", "temp-opt"), material: "tam-thoi", position: 99, shape: null });
    });
    await editAndPublish(db(), target(), (d) => void (d.options = d.options.filter((o) => o.material !== "tam-thoi")));
    expect(await usedBy(db(), "material", "tam-thoi")).toEqual({ live: 0, drafts: 0 });

    // An open draft that mentions it is counted — the foreign keys alone cannot see drafts.
    const draft = await openDraft(db(), target(), null);
    const mention = structuredClone(draft.snapshot) as unknown as ProductDocument;
    mention.options.push({ ...structuredClone(mention.options[0]), uid: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", slugs: slugsOf("dang-nhap", "in-draft"), material: "tam-thoi", position: 98, shape: null });
    await saveDraft(db(), target(), { snapshot: mention, expectDraftVersion: draft.draftVersion, author: null });
    expect(await usedBy(db(), "material", "tam-thoi")).toEqual({ live: 0, drafts: 1 });
    await discardDraft(db(), target());
    await pool().query(`delete from material where slug = 'tam-thoi'`);

    const before = await liveDocument(db(), target());
    const restore = await startRestore(db(), target(), withTemp.version, null);
    const refused = await thrown(publishDraft(db(), target(), { expectDraftVersion: restore.draftVersion, author: null }));
    expect(refused).toBeInstanceOf(Invalid);
    expect((refused as Invalid).issues).toContainEqual({ path: expect.stringMatching(/^options\[\d+\]\.material$/), message: "Không tìm thấy chất liệu «tam-thoi»." });
    expect(await liveDocument(db(), target())).toEqual(before);
    expect(await getDraft(db(), target())).not.toBeNull();
    await discardDraft(db(), target());
  });
});

describe("releasing an old URL", () => {
  const target = () => ref("office/danh-thiep");

  it("is its own act, per language: the other languages keep theirs, and it is a revision", async () => {
    const before = await liveDocument(db(), target());
    const alias = before.slugs.en.aliases[0];
    expect(alias, "the seed keeps today's Vietnamese slug as an English alias").toBeDefined();
    expect(before.slugs.zh.aliases).toContainEqual(alias);
    const versionBefore = (await liveVersion(db(), target()))!;

    const result = await releaseAlias(db(), { productUid: target().id, locale: "en", category: alias.category, slug: alias.slug, author: null });
    expect(result.version).toBe(versionBefore + 1);
    const after = await liveDocument(db(), target());
    expect(after.slugs.en.aliases).not.toContainEqual(alias);
    expect(after.slugs.zh.aliases).toContainEqual(alias);
    expect(after.slugs.vi).toEqual(before.slugs.vi);
    const [revision] = await listRevisions(db(), target());
    expect(revision).toMatchObject({ version: result.version, action: "update" });
    expect(revision.comment).toContain(alias.slug);
  });

  it("works for a shape or option segment, and refuses a canonical URL, a stranger's URL and a missing product", async () => {
    const doc = await liveDocument(db(), target());
    const owner = [...doc.shapes, ...doc.options].find((child) => Object.values(child.slugs).some((entry) => entry.aliases.length > 0));
    if (owner) {
      const locale = (Object.keys(owner.slugs) as (keyof typeof owner.slugs)[]).find((l) => owner.slugs[l].aliases.length > 0)!;
      const slug = owner.slugs[locale].aliases[0];
      await releaseAlias(db(), { productUid: target().id, locale, slug, author: null });
      const after = await liveDocument(db(), target());
      expect([...after.shapes, ...after.options].flatMap((child) => child.slugs[locale].aliases)).not.toContain(slug);
    }
    const canonical = doc.slugs.vi.slug;
    expect(await thrown(releaseAlias(db(), { productUid: target().id, locale: "vi", category: doc.category, slug: canonical, author: null }))).toMatchObject({ issues: [{ path: "slug" }] });
    expect(await thrown(releaseAlias(db(), { productUid: target().id, locale: "vi", category: doc.category, slug: "khong-co-url-nay", author: null }))).toBeInstanceOf(Invalid);
    expect(await thrown(releaseAlias(db(), { productUid: "99999999-9999-4999-8999-999999999999", locale: "vi", slug: "x", author: null }))).toBeInstanceOf(NotFound);
  });

  it("makes an open draft stale: it has to be rebased before it can publish", async () => {
    const draft = await openDraft(db(), target(), null);
    const doc = await liveDocument(db(), target());
    const alias = doc.slugs.ja.aliases[0];
    await releaseAlias(db(), { productUid: target().id, locale: "ja", category: alias.category, slug: alias.slug, author: null });
    const refused = await thrown(publishDraft(db(), target(), { expectDraftVersion: draft.draftVersion, author: null }));
    expect(refused).toBeInstanceOf(Conflict);
    expect(refused).toMatchObject({ code: "STALE_BASE" });
    await discardDraft(db(), target());
  });
});
