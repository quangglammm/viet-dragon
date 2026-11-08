import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { slugsOf } from "@/tests/fixtures/documents";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { editAndPublish, liveDocument, liveVersion, refusedEdit, withSortedAliases, withoutAliases } from "@/tests/helpers/content-lifecycle";
import { createDraft, draftChanges, getDraft, openDraft, rebaseDraft, saveDraft } from "./drafts";
import { Conflict, Invalid } from "./errors";
import { publishDraft } from "./publish";
import { startRestore } from "./restore";
import type { ProductDocument } from "./schemas";
import { LOCALES } from "./schemas";

// The product aggregate end to end on the real seeded data: the lifecycle the prototype proved (docs/spike), now through the
// shipped drafts / publish services, with a slug in every language.

let seeded: SeededDatabase;
beforeAll(async () => {
  seeded = await createSeededDatabase("product-lifecycle");
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

const AGGREGATE_TABLES = [
  "product", "product_i18n", "product_slug", "product_segment", "shape", "shape_i18n", "option", "option_i18n", "option_bullet", "option_bullet_i18n",
  "option_image", "size_option", "size_option_i18n", "product_spec", "menu_group", "menu_group_i18n", "menu_item", "menu_item_i18n",
];
const counts = async () => Object.fromEntries(await Promise.all(AGGREGATE_TABLES.map(async (t) => [t, Number((await rows<{ n: number }>(`select count(*)::int n from ${t}`))[0].n)])));
const childIds = async () => Object.fromEntries((await rows<{ k: string; uid: string; id: string }>(`select 'shape' k, uid, id from shape union all select 'option', uid, id from option`)).map((r) => [`${r.k}:${r.uid}`, Number(r.id)]));
const productVersions = async () => Object.fromEntries((await rows<{ uid: string; version: number }>(`select uid, version from product`)).map((r) => [r.uid, r.version]));
const menuItemsPointingAt = async (column: "shape_id" | "option_id") => new Set((await rows<{ uid: string }>(`select t.uid from menu_item i join ${column === "shape_id" ? "shape" : "option"} t on t.id = i.${column}`)).map((r) => r.uid));

/** Moves a product to another category. Becoming canonical there, an old alias of the same slug must go (a canonical slug cannot also be an alias). */
const moveTo = (category: string) => (doc: ProductDocument) => {
  doc.category = category;
  for (const locale of LOCALES) doc.slugs[locale].aliases = doc.slugs[locale].aliases.filter((a) => !(a.category === category && a.slug === doc.slugs[locale].slug));
};

/** A copy of a document that is a NEW product: fresh uids everywhere, no shape-scoped content, a free slug. */
function brandNewFrom(source: ProductDocument): ProductDocument {
  const copy = structuredClone(source);
  copy.uid = randomUUID();
  copy.shapes = [];
  copy.options = copy.options.filter((o) => o.shape === null).map((o) => ({ ...o, uid: randomUUID() }));
  copy.sizes = copy.sizes.filter((z) => z.shape === null);
  copy.specs = copy.specs.filter((x) => x.shape === null);
  return copy;
}

describe("publishing a product without changing it", () => {
  it("stores every one of the products exactly as composed, keeps every shape/option id, and gains or loses no row", async () => {
    const keys = [...seeded.outcome.products.keys()];
    expect(keys.length).toBe(Number((await rows<{ n: number }>(`select count(*)::int n from product`))[0].n));
    const documents = new Map(await Promise.all(keys.map(async (key) => [key, await liveDocument(db(), ref(key))] as const)));
    const countsBefore = await counts();
    const idsBefore = await childIds();
    const versionsBefore = await productVersions();

    for (const key of keys) await editAndPublish(db(), ref(key), () => undefined);

    const mismatched: string[] = [];
    for (const key of keys) if (JSON.stringify(await liveDocument(db(), ref(key))) !== JSON.stringify(documents.get(key))) mismatched.push(key);
    expect(mismatched, "documents that changed by being published unchanged").toEqual([]);
    expect(await counts()).toEqual(countsBefore);
    expect(await childIds()).toEqual(idsBefore);
    const versionsAfter = await productVersions();
    for (const [uid, version] of Object.entries(versionsBefore)) expect(versionsAfter[uid], uid).toBe(version + 1);
  });

  it("writes a revision with the stored document, one per publish", async () => {
    const target = ref("office/danh-thiep");
    const before = (await rows<{ n: number }>(`select count(*)::int n from content_revision where entity_uid = $1`, [target.id]))[0].n;
    const result = await editAndPublish(db(), target, () => undefined, { comment: "không đổi" });
    const revisions = await rows<{ version: number; action: string; comment: string; snapshot: unknown }>(`select version, action, comment, snapshot from content_revision where entity_uid = $1 order by version desc`, [target.id]);
    expect(revisions).toHaveLength(before + 1);
    expect(revisions[0]).toMatchObject({ version: result.version, action: "update", comment: "không đổi" });
    expect(revisions[0].snapshot).toEqual(await liveDocument(db(), target));
  });
});

describe("editing", () => {
  it("stores edits as made, keeps the old URL of whatever was renamed — in that language only — and keeps menu rows", async () => {
    const target = ref("tet/to-roi");
    const base = await liveDocument(db(), target);
    expect(base.shapes.length).toBeGreaterThanOrEqual(3);
    const menuShapes = await menuItemsPointingAt("shape_id");
    const menuOptions = await menuItemsPointingAt("option_id");
    const removable = base.options.find((o) => !menuOptions.has(o.uid));
    expect(removable, "an option no menu points at").toBeDefined();
    const [s0, s1] = base.shapes;
    const newShape = randomUUID();
    const menuItemsBefore = Number((await rows<{ n: number }>(`select count(*)::int n from menu_item`))[0].n);

    const edited = structuredClone(base);
    edited.slugs.vi.slug = "to-roi-tet-moi";
    edited.i18n.vi!.title += " (đã sửa)";
    // Two shapes swap their Vietnamese slugs in ONE publish; another is renamed in Vietnamese AND English.
    const [first, second, third] = edited.shapes;
    [first.slugs.vi.slug, second.slugs.vi.slug] = [second.slugs.vi.slug, first.slugs.vi.slug];
    third.slugs.vi.slug += "-v2";
    third.slugs.en.slug += "-v2";
    edited.options = edited.options.filter((o) => o.uid !== removable!.uid);
    const [option] = edited.options;
    const oldOptionSlug = option.slugs.vi.slug;
    option.slugs.vi.slug += "-moi";
    const lastFeature = option.bullets.map((b) => b.kind).lastIndexOf("feature");
    option.bullets.splice(lastFeature + 1, 0, { kind: "feature", position: option.bullets.filter((b) => b.kind === "feature").length, trait: "glossy-coat", i18n: { vi: "Điểm mới", en: "New point" } });
    option.prices.base = 150000;
    option.unit = "hop";
    edited.shapes.push({ uid: newShape, slugs: slugsOf("hinh-thu-nghiem", "test-shape"), position: edited.shapes.length, image: s0.image, ogImage: null, i18n: { vi: { name: "Hình thử nghiệm", badge: "Mới" }, en: { name: "Test shape" } } });
    const size = edited.sizes.find((z) => z.tier === "large" && z.shape === null)!;
    size.w = (size.w ?? 100) + 10;

    const result = await editAndPublish(db(), target, (doc) => Object.assign(doc, structuredClone(edited)));
    const stored = await liveDocument(db(), target);

    expect(withoutAliases(stored)).toEqual(withoutAliases(edited));
    // Product URL: Vietnamese renamed → the old one is an alias there; English untouched.
    expect(stored.slugs.vi.aliases).toContainEqual({ category: "tet", slug: base.slugs.vi.slug });
    expect(stored.slugs.en.aliases).toEqual(base.slugs.en.aliases);
    const stored0 = stored.shapes.find((s) => s.uid === third.uid)!;
    const base0 = base.shapes.find((s) => s.uid === third.uid)!;
    expect(stored0.slugs.vi.aliases).toContain(base0.slugs.vi.slug);
    expect(stored0.slugs.en.aliases).toContain(base0.slugs.en.slug);
    expect(stored0.slugs.zh.aliases).toEqual(base0.slugs.zh.aliases); // an untouched language is untouched
    expect(stored.options.find((o) => o.uid === option.uid)!.slugs.vi.aliases).toContain(oldOptionSlug);
    // The swap: each of the two shapes has the other's old slug now (so neither old URL is lost).
    expect(stored.shapes.find((s) => s.uid === first.uid)!.slugs.vi.slug).toBe(s1.slugs.vi.slug);
    expect(stored.shapes.find((s) => s.uid === second.uid)!.slugs.vi.slug).toBe(s0.slugs.vi.slug);
    // Menus: the rows that pointed at this product's shapes and options survived (only the removed option could have gone).
    expect(Number((await rows<{ n: number }>(`select count(*)::int n from menu_item`))[0].n)).toBe(menuItemsBefore);
    expect(menuShapes.size).toBeGreaterThan(0);
    const revision = await rows<{ snapshot: unknown }>(`select snapshot from content_revision where entity_uid = $1 and version = $2`, [target.id, result.version]);
    expect(revision[0].snapshot).toEqual(stored);
  });

  it("moves a product to another category: the old URL stays, in every language", async () => {
    const target = ref("office/ao-thun");
    const base = await liveDocument(db(), target);
    await editAndPublish(db(), target, moveTo("marketing"));
    const moved = await liveDocument(db(), target);
    expect(moved.category).toBe("marketing");
    for (const locale of LOCALES) {
      expect(moved.slugs[locale].slug, locale).toBe(base.slugs[locale].slug);
      expect(moved.slugs[locale].aliases, locale).toContainEqual({ category: "office", slug: base.slugs[locale].slug });
    }
    expect({ shapes: moved.shapes, options: moved.options }).toEqual({ shapes: base.shapes, options: base.options });
    const resolved = await rows<{ product_id: string }>(`select product_id from product_slug where locale = 'vi' and category_id = 'office' and slug = $1`, [base.slugs.vi.slug]);
    expect(resolved).toHaveLength(1);
    await editAndPublish(db(), target, moveTo("office"));
  });
});

describe("publishing at the same time", () => {
  it("two products moving between the same two categories in opposite directions do not deadlock", async () => {
    const a = ref("office/giay-ghi-chu");
    const b = ref("marketing/ve-tickets");
    const draftOf = async (target: typeof a, category: string) => {
      const draft = await openDraft(db(), target, null);
      const document = structuredClone(draft.snapshot) as unknown as ProductDocument;
      moveTo(category)(document);
      return saveDraft(db(), target, { snapshot: document, expectDraftVersion: draft.draftVersion, author: null });
    };
    const [draftA, draftB] = [await draftOf(a, "marketing"), await draftOf(b, "office")];
    const settled = await Promise.allSettled([
      publishDraft(db(), a, { expectDraftVersion: draftA.draftVersion, author: null }),
      publishDraft(db(), b, { expectDraftVersion: draftB.draftVersion, author: null }),
    ]);
    expect(settled.map((s) => s.status)).toEqual(["fulfilled", "fulfilled"]);
    expect((await liveDocument(db(), a)).category).toBe("marketing");
    expect((await liveDocument(db(), b)).category).toBe("office");
  });
});

describe("refusing what must not be published", () => {
  it("refuses a stale draft with a field-level diff, and keeps it; rebase is the knowing overwrite", async () => {
    const target = ref("marketing/vouchers");
    const draft = await openDraft(db(), target, null);
    const edited = structuredClone(draft.snapshot) as unknown as ProductDocument;
    edited.i18n.vi!.title = "Bản của biên tập viên A";
    const saved = await saveDraft(db(), target, { snapshot: edited, expectDraftVersion: draft.draftVersion, author: null });
    // Somebody changes the live product behind the draft's back (here: a URL is released, which is its own publish).
    await pool().query(`update product set version = version + 1 where uid = $1`, [target.id]);

    const refused = await publishDraft(db(), target, { expectDraftVersion: saved.draftVersion, author: null }).catch((e: unknown) => e);
    expect(refused).toBeInstanceOf(Conflict);
    expect(refused).toMatchObject({ code: "STALE_BASE" });
    expect((refused as Conflict).changes.map((c) => c.path)).toContain("i18n.vi.title");
    expect(await getDraft(db(), target)).not.toBeNull();

    const rebased = await rebaseDraft(db(), target, null);
    expect(rebased.baseVersion).toBe(await liveVersion(db(), target));
    expect((await draftChanges(db(), target)).map((c) => c.path)).toEqual(["i18n.vi.title"]);
    await publishDraft(db(), target, { expectDraftVersion: rebased.draftVersion, author: null });
    expect((await liveDocument(db(), target)).i18n.vi?.title).toBe("Bản của biên tập viên A");
  });

  it("refuses a NEW draft that carries the uid of an existing product (it used to wipe the product)", async () => {
    const target = ref("marketing/to-gap");
    const before = await liveDocument(db(), target);
    const forged = JSON.stringify({ ...before, i18n: { vi: { title: "ĐÈ LÊN" }, en: { title: "OVERWRITE" } }, shapes: [], options: [], sizes: [], specs: [] });
    await pool().query(`insert into content_draft (entity_type, entity_uid, base_version, snapshot) values ('product', $1, null, $2::jsonb)`, [target.id, forged]);
    const refused = await publishDraft(db(), target, { expectDraftVersion: 1, author: null }).catch((e: unknown) => e);
    expect(refused).toMatchObject({ code: "ALREADY_EXISTS" });
    expect(await liveDocument(db(), target)).toEqual(before);
    await pool().query(`delete from content_draft where entity_uid = $1`, [target.id]);

    const viaService = await createDraft(db(), "product", { snapshot: { ...before } }, null);
    expect(viaService.ref.id).not.toBe(target.id); // the service generates a fresh uid and ignores the one sent
    await pool().query(`delete from content_draft where entity_uid = $1`, [viaService.ref.id]);
  });

  it("creates a genuinely new product (version 1) and refuses a second publish of the same draft", async () => {
    const source = await liveDocument(db(), ref("marketing/vouchers"));
    const document = brandNewFrom(source);
    for (const locale of LOCALES) document.slugs[locale] = { slug: `san-pham-moi-${locale}`, aliases: [] };
    const draft = await createDraft(db(), "product", { snapshot: document }, null);
    const created = await publishDraft(db(), draft.ref, { expectDraftVersion: draft.draftVersion, author: null });
    expect(created).toMatchObject({ version: 1, action: "create" });
    expect((await liveDocument(db(), draft.ref as { type: "product"; id: string })).slugs.vi.slug).toBe("san-pham-moi-vi");
    const again = await publishDraft(db(), draft.ref, { expectDraftVersion: draft.draftVersion, author: null }).catch((e: unknown) => e);
    expect(again).toMatchObject({ code: "GONE" });
  });

  it("explains a slug another product already uses, per language, and rolls everything back", async () => {
    const source = await liveDocument(db(), ref("marketing/vouchers"));
    const other = await liveDocument(db(), ref("marketing/to-gap"));
    const document = brandNewFrom(source);
    for (const locale of LOCALES) document.slugs[locale] = { slug: `trung-${locale}`, aliases: [] };
    document.slugs.en.slug = other.slugs.en.slug; // only English collides
    const productsBefore = Number((await rows<{ n: number }>(`select count(*)::int n from product`))[0].n);
    const draft = await createDraft(db(), "product", { snapshot: document }, null);
    const refused = await publishDraft(db(), draft.ref, { expectDraftVersion: draft.draftVersion, author: null }).catch((e: unknown) => e);
    expect(refused).toBeInstanceOf(Invalid);
    expect((refused as Invalid).issues[0].message).toMatch(/đã được sản phẩm khác dùng/);
    expect(Number((await rows<{ n: number }>(`select count(*)::int n from product`))[0].n)).toBe(productsBefore);
    await pool().query(`delete from content_draft where entity_uid = $1`, [draft.ref.id]);
  });

  describe("an invalid document changes nothing and keeps the draft", () => {
    const target = () => ref("tet/to-roi");
    const attempt = async (mutate: (doc: ProductDocument) => void) => {
      const before = await liveDocument(db(), target());
      const error = await refusedEdit(db(), target(), mutate);
      expect(await liveDocument(db(), target()), "live data changed by a refused publish").toEqual(before);
      return error;
    };
    const issuesOf = (error: unknown) => (error instanceof Invalid ? error.issues : []);

    it("an unknown material, named at its field", async () => {
      const error = await attempt((d) => void (d.options[0].material = "khong-co-chat-lieu"));
      expect(issuesOf(error)).toContainEqual({ path: "options[0].material", message: "Không tìm thấy chất liệu «khong-co-chat-lieu»." });
    });
    it("a bullet icon (trait) that does not exist", async () => {
      const error = await attempt((d) => {
        const bullet = d.options.flatMap((o) => o.bullets).find((b) => b.kind === "feature")!;
        bullet.trait = "khong-co-trait";
      });
      expect(issuesOf(error).some((i) => /biểu tượng đặc điểm «khong-co-trait»/.test(i.message))).toBe(true);
    });
    it("an Open Graph image that is a video", async () => {
      const [video] = await rows<{ storage_key: string }>(`select storage_key from media where kind = 'video' limit 1`);
      const error = await attempt((d) => void (d.ogImage = video.storage_key));
      expect(issuesOf(error)).toContainEqual({ path: "ogImage", message: `«${video.storage_key}» là video, nhưng ô này chỉ nhận ảnh.` });
    });
    it("a blank Vietnamese title (an ideographic space only)", async () => {
      const error = await attempt((d) => void (d.i18n.vi!.title = String.fromCharCode(0x3000)));
      expect(issuesOf(error).map((i) => i.path)).toContain("i18n.vi.title");
    });
    it("a missing Vietnamese or English title", async () => {
      const error = await attempt((d) => void delete d.i18n.en);
      expect(issuesOf(error)).toContainEqual({ path: "i18n.en", message: "Bắt buộc có nội dung tiếng Anh." });
    });
    it("a shape slug equal to an option slug in the same language", async () => {
      const error = await attempt((d) => void (d.shapes[0].slugs.vi.slug = d.options[0].slugs.vi.slug));
      expect(issuesOf(error).some((i) => /đang bị dùng hai lần/.test(i.message))).toBe(true);
    });
    it("duplicate bullet positions", async () => {
      const error = await attempt((d) => void d.options[0].bullets.push({ ...d.options[0].bullets[0] }));
      expect(error).toBeInstanceOf(Invalid);
    });
    it("removing a shape that a menu still points at — caught at COMMIT, the whole publish rolled back", async () => {
      const inMenu = await menuItemsPointingAt("shape_id");
      const error = await attempt((d) => {
        const shape = d.shapes.find((s) => inMenu.has(s.uid))!;
        d.shapes = d.shapes.filter((s) => s.uid !== shape.uid);
        d.options = d.options.filter((o) => o.shape !== shape.uid);
        d.sizes = d.sizes.filter((z) => z.shape !== shape.uid);
        d.specs = d.specs.filter((x) => x.shape !== shape.uid);
      });
      expect(issuesOf(error)[0].message).toMatch(/menu/);
    });
    it("a shape and an option sharing a uid", async () => {
      const error = await attempt((d) => void (d.options[0].uid = d.shapes[0].uid));
      expect(issuesOf(error).some((i) => /Mã định danh .* bị trùng/.test(i.message))).toBe(true);
    });
    it("an option uid that already belongs to ANOTHER product", async () => {
      const [{ uid }] = await rows<{ uid: string }>(`select o.uid from option o join product p on p.id = o.product_id where p.uid <> $1 limit 1`, [target().id]);
      const error = await attempt((d) => void d.options.push({ ...structuredClone(d.options[0]), uid, slugs: slugsOf("moi-xin", "new-offer"), position: 98 }));
      expect(issuesOf(error)[0].message).toMatch(/mã định danh/);
    });
  });
});

describe("URLs are never lost", () => {
  it("renamed a→b→c then restored to the first document: every old URL still resolves, in each language", async () => {
    const target = ref("office/giay-tieu-de");
    const first = await liveDocument(db(), target);
    const firstVersion = (await liveVersion(db(), target))!;
    for (const suffix of ["-b", "-c"]) {
      await editAndPublish(db(), target, (d) => {
        for (const locale of ["vi", "en"] as const) {
          d.slugs[locale].slug = first.slugs[locale].slug + suffix;
          d.shapes.forEach((s) => void (s.slugs[locale].slug += suffix));
        }
      });
    }
    const draft = await startRestore(db(), target, firstVersion, null);
    await publishDraft(db(), target, { expectDraftVersion: draft.draftVersion, author: null });

    const restored = await liveDocument(db(), target);
    for (const locale of ["vi", "en"] as const) {
      expect(restored.slugs[locale].slug, locale).toBe(first.slugs[locale].slug);
      for (const suffix of ["-b", "-c"]) expect(restored.slugs[locale].aliases, `${locale} ${suffix}`).toContainEqual({ category: "office", slug: first.slugs[locale].slug + suffix });
    }
    for (const shape of first.shapes) {
      const now = restored.shapes.find((s) => s.uid === shape.uid)!;
      expect(now.slugs.vi.aliases).toEqual(expect.arrayContaining([`${shape.slugs.vi.slug}-b`, `${shape.slugs.vi.slug}-b-c`]));
    }
    const [{ action, comment }] = await rows<{ action: string; comment: string }>(`select action, comment from content_revision where entity_uid = $1 order by version desc limit 1`, [target.id]);
    expect(action).toBe("restore");
    expect(comment).toBe(`Khôi phục phiên bản ${firstVersion}`);
  });
});

describe("a shape renamed while an option takes its old slug", () => {
  it("the explicit alias wins and nothing crashes", async () => {
    const target = ref("office/bao-thu");
    const base = await liveDocument(db(), target);
    const oldSlug = base.shapes[0].slugs.vi.slug;
    await editAndPublish(db(), target, (d) => {
      d.shapes[0].slugs.vi.slug = `${oldSlug}-moi`;
      d.options[0].slugs.vi.aliases = [...d.options[0].slugs.vi.aliases, oldSlug];
    });
    const [owner] = await rows<{ shape_id: string | null; option_id: string | null }>(`select s.shape_id, s.option_id from product_segment s join product p on p.id = s.product_id where p.uid = $1 and s.locale = 'vi' and s.slug = $2`, [target.id, oldSlug]);
    expect(owner.option_id).not.toBeNull();
    expect(owner.shape_id).toBeNull();
  });
});

describe("every field of the document survives a publish", () => {
  it("text in each language, images, icons, flags, prices, units, sizes, specs and aliases are stored and read back unchanged", async () => {
    const target = ref("office/danh-thiep");
    const base = await liveDocument(db(), target);
    const [otherTrait] = await rows<{ key: string }>(`select key from trait where key <> coalesce($1, '') order by key limit 1`, [base.options[0].bullets.find((b) => b.trait)?.trait ?? null]);
    const otherMedia = base.shapes[1]?.image ?? base.cover;

    const sentinel = structuredClone(base);
    const option = sentinel.options[0];
    const shape = sentinel.shapes[0];
    sentinel.position = base.position + 1;
    sentinel.cover = otherMedia;
    sentinel.i18n.ja = { title: "日本語", description: "説明", seoTitle: "SEO 日本語", seoDescription: "SEO 説明" };
    shape.image = otherMedia;
    shape.i18n.ko = { name: "테스트", description: "설명", badge: "배지" };
    option.icon = "Gem";
    option.hideFoil = true;
    option.hideDoubleSided = true;
    option.prices = { base: 1000, doubleSided: 2000, foil: 3000, foil2: 4000 };
    option.unit = "hop";
    option.i18n.ja = { name: "名前", cardTitle: "見出し", tagline: "キャッチ" };
    const feature = option.bullets.find((b) => b.kind === "feature")!;
    feature.trait = otherTrait.key;
    feature.i18n.ko = "한국어 글머리";
    option.bullets.push({ kind: "best_for", position: 90, trait: null, i18n: { vi: "Dành cho thử nghiệm", ja: "テスト向け" } });
    option.images = { default: [...option.images.default].reverse(), pure: [...option.images.pure, otherMedia as string] };
    const size = sentinel.sizes.find((z) => z.shape === null && z.tier === "large")!;
    Object.assign(size, { w: null, h: null, d: null, text: "Size XL", i18n: { ko: "참고" } });
    sentinel.specs.filter((x) => x.shape === null && x.kind === "finishing").forEach((x, i, all) => void (x.position = all.length - 1 - i));
    sentinel.slugs.vi.aliases.push({ category: "office", slug: "danh-thiep-cu" });
    shape.slugs.vi.aliases.push("hinh-cu");
    option.slugs.vi.aliases.push("chat-lieu-cu");

    await editAndPublish(db(), target, (doc) => Object.assign(doc, structuredClone(sentinel)));
    // The stored document lists specs in order of position; everything else is in the order it was written.
    const inStoredOrder = (doc: ProductDocument): ProductDocument => ({ ...doc, specs: [...doc.specs].sort((a, b) => (a.shape ?? "").localeCompare(b.shape ?? "") || a.kind.localeCompare(b.kind) || a.position - b.position) });
    expect(withSortedAliases(await liveDocument(db(), target))).toEqual(withSortedAliases(inStoredOrder(sentinel)));
  });
});
