import { describe, expect, it } from "vitest";
import { diffDocuments, publishChanges } from "./diff";

describe("diffDocuments", () => {
  it("finds nothing between equal documents", () => {
    expect(diffDocuments({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 })).toEqual([]);
  });

  it("reports a changed value with both sides", () => {
    expect(diffDocuments({ i18n: { vi: { title: "A" } } }, { i18n: { vi: { title: "B" } } })).toEqual([{ path: "i18n.vi.title", kind: "changed", before: "A", after: "B" }]);
  });

  it("reports an added and a removed field once, without walking into them", () => {
    const changes = diffDocuments({ gone: { x: 1 }, same: 1 }, { added: { y: [1] }, same: 1 });
    expect(changes).toEqual(expect.arrayContaining([{ path: "added", kind: "added", after: { y: [1] } }, { path: "gone", kind: "removed", before: { x: 1 } }]));
    expect(changes).toHaveLength(2);
  });

  it("treats null as a value, not as absence", () => {
    expect(diffDocuments({ cover: null }, { cover: "a.webp" })).toEqual([{ path: "cover", kind: "changed", before: null, after: "a.webp" }]);
  });

  it("identifies array elements by uid, so an insertion in the middle is ONE change", () => {
    const options = (uids: string[]) => ({ options: uids.map((uid) => ({ uid, prices: { base: 1 } })) });
    expect(diffDocuments(options(["a", "b", "c"]), options(["a", "x", "b", "c"]))).toEqual([{ path: "options[x]", kind: "added", after: { uid: "x", prices: { base: 1 } } }]);
  });

  it("reaches into a keyed element: options[<uid>].prices.base", () => {
    const doc = (base: number) => ({ options: [{ uid: "u1", prices: { base } }] });
    expect(diffDocuments(doc(1), doc(2))).toEqual([{ path: "options[u1].prices.base", kind: "changed", before: 1, after: 2 }]);
  });

  it("identifies sizes by scope and tier, specs by scope, kind and item, bullets by kind and position", () => {
    const before = {
      sizes: [{ shape: null, tier: "large", w: 1 }],
      specs: [{ shape: null, kind: "technique", item: "offset", position: 0 }],
      bullets: [{ kind: "feature", position: 0, trait: "a" }],
    };
    const after = {
      sizes: [{ shape: null, tier: "small", w: 1 }, { shape: null, tier: "large", w: 2 }],
      specs: [{ shape: null, kind: "technique", item: "digital", position: 0 }, { shape: null, kind: "technique", item: "offset", position: 1 }],
      bullets: [{ kind: "feature", position: 0, trait: "b" }],
    };
    expect(diffDocuments(before, after).map((c) => [c.path, c.kind])).toEqual([
      ["sizes[*|small]", "added"],
      ["sizes[*|large].w", "changed"],
      ["specs[*|technique|digital]", "added"],
      ["specs[*|technique|offset].position", "changed"],
      ["bullets[feature:0].trait", "changed"],
    ]);
  });

  it("falls back to positions for arrays without identity, and when identities repeat", () => {
    expect(diffDocuments({ aliases: ["a", "b"] }, { aliases: ["a", "c", "d"] })).toEqual([
      { path: "aliases[1]", kind: "changed", before: "b", after: "c" },
      { path: "aliases[2]", kind: "added", after: "d" },
    ]);
    expect(diffDocuments({ l: [{ uid: "x", v: 1 }, { uid: "x", v: 2 }] }, { l: [{ uid: "x", v: 1 }] })).toEqual([{ path: "l[1]", kind: "removed", before: { uid: "x", v: 2 } }]);
  });

  it("reports a brand-new entity as one addition of the whole document", () => {
    expect(diffDocuments(null, { uid: "x" })).toEqual([{ path: "", kind: "added", after: { uid: "x" } }]);
  });
});

describe("publishChanges", () => {
  const product = (aliases: { category: string; slug: string }[]) => ({ slugs: { vi: { slug: "to-roi", aliases } } });
  const kept = { category: "tet", slug: "flyers" };

  it("does not list an old URL missing from the draft: a publish keeps it", () => {
    expect(diffDocuments(product([kept]), product([]))).toHaveLength(1);
    expect(publishChanges(product([kept]), product([]))).toEqual([]);
  });

  it("still lists a URL the draft adds, and every other change", () => {
    const changes = publishChanges({ ...product([]), status: "published" }, { ...product([kept]), status: "archived" });
    expect(changes.map((change) => [change.path, change.kind])).toEqual([
      ["slugs.vi.aliases[tet/flyers]", "added"],
      ["status", "changed"],
    ]);
  });

  it("treats a brand-new entity like diffDocuments does", () => {
    expect(publishChanges(null, { a: 1 })).toEqual([{ path: "", kind: "added", after: { a: 1 } }]);
  });
});
