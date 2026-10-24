import { describe, expect, it } from "vitest";
import { UID, productDocument, slugsOf } from "@/tests/fixtures/documents";
import { LOCALES } from "../schemas";
import {
  addBullet, addOption, addShape, addSize, addSpec, followChildNames, hasFreeTier, moveBullet, moveOption, moveShape, moveSpec, moveToCategory, removeBullet,
  removeOption, removeShape, removeSize, removeSpec, scopedToShape, setBulletKind, setChildSlug, setOptionScope, setProductSlug, setSpecKind, takenSlugs, type Product,
} from "./product-ops";
import { PRODUCT_SECTIONS, sectionOfPath } from "./product-sections";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** The fixture: shapes A5 (position 0) and A4 (1); options for the whole product (0), for A5 (1 → its own group) and one more. */
const base = (): Product => productDocument();
const positions = (list: { position: number }[]) => list.map((item) => item.position);

describe("shapes", () => {
  it("adds one at the end with a valid placeholder slug in every language, nothing translated yet", () => {
    const product = base();
    const next = addShape(product);
    expect(next.shapes).toHaveLength(3);
    expect(product.shapes).toHaveLength(2); // the input is untouched
    const added = next.shapes[2];
    expect(added.position).toBe(2);
    expect(added.image).toBeNull();
    expect(added.i18n).toEqual({});
    for (const locale of LOCALES) expect(added.slugs[locale].slug).toMatch(KEBAB);
    expect(added.uid).not.toBe(next.shapes[0].uid);
  });

  it("removes a shape together with everything scoped to it, and closes the gap in the positions", () => {
    const product = base();
    const next = removeShape(product, UID.shapeA5);
    expect(next.shapes.map((s) => s.uid)).toEqual([UID.shapeA4]);
    expect(positions(next.shapes)).toEqual([0]);
    expect(next.options.map((o) => o.uid)).toEqual([UID.option]); // the A5-only option went
    expect(next.sizes.every((s) => s.shape !== UID.shapeA5)).toBe(true);
    expect(next.specs.every((s) => s.shape !== UID.shapeA5)).toBe(true);
    expect(scopedToShape(product, UID.shapeA5)).toEqual({ options: 1, sizes: 1, specs: 1 });
    expect(scopedToShape(product, UID.shapeA4)).toEqual({ options: 0, sizes: 0, specs: 0 });
  });

  it("swaps with its neighbour and renumbers; the ends do nothing", () => {
    const moved = moveShape(base(), UID.shapeA4, -1);
    expect(moved.shapes.map((s) => [s.uid, s.position])).toEqual([[UID.shapeA4, 0], [UID.shapeA5, 1]]);
    expect(moveShape(base(), UID.shapeA5, -1).shapes.map((s) => s.uid)).toEqual([UID.shapeA5, UID.shapeA4]);
    expect(moveShape(base(), "missing", 1)).toEqual(base());
  });
});

describe("options", () => {
  it("adds an option at the end of its own scope, with no material chosen yet", () => {
    const wholeProduct = addOption(base(), null);
    const added = wholeProduct.options[wholeProduct.options.length - 1];
    expect(added).toMatchObject({ shape: null, material: "", position: 1, unit: null, bullets: [], images: { default: [], pure: [] } });
    expect(added.prices).toEqual({ base: null, doubleSided: null, foil: null, foil2: null });
    const forA4 = addOption(base(), UID.shapeA4);
    expect(forA4.options[forA4.options.length - 1]).toMatchObject({ shape: UID.shapeA4, position: 0 }); // A4 had none
  });

  it("removes one and renumbers its scope only", () => {
    const product = addOption(addOption(base(), null), null);
    const [first, second, third] = product.options.filter((o) => o.shape === null);
    const next = removeOption(product, second.uid);
    const whole = next.options.filter((o) => o.shape === null);
    expect(whole.map((o) => o.uid)).toEqual([first.uid, third.uid]);
    expect(positions(whole)).toEqual([0, 1]);
    expect(next.options.find((o) => o.shape === UID.shapeA5)?.position).toBe(0); // every group is numbered from 0
  });

  it("moves within its scope only", () => {
    const product = addOption(base(), null);
    const whole = product.options.filter((o) => o.shape === null);
    const moved = moveOption(product, whole[1].uid, -1);
    expect(moved.options.filter((o) => o.shape === null).map((o) => [o.uid, o.position])).toEqual([[whole[1].uid, 0], [whole[0].uid, 1]]);
    expect(moveOption(product, whole[0].uid, -1).options.map((o) => o.uid)).toEqual(product.options.map((o) => o.uid));
  });

  it("changes scope: it goes to the end of the new group and the old one closes up", () => {
    const product = addOption(base(), null);
    const whole = product.options.filter((o) => o.shape === null);
    const next = setOptionScope(product, whole[0].uid, UID.shapeA5);
    const moved = next.options.find((o) => o.uid === whole[0].uid)!;
    expect(moved).toMatchObject({ shape: UID.shapeA5, position: 1 });
    expect(next.options.filter((o) => o.shape === null).map((o) => o.position)).toEqual([0]);
  });
});

describe("bullets", () => {
  const withBullets = (): Product => {
    const product = base();
    product.options[0].bullets = [
      { kind: "feature", position: 0, trait: "glossy-coat", i18n: { vi: "a" } },
      { kind: "feature", position: 1, trait: "foil-accent", i18n: { vi: "b" } },
      { kind: "best_for", position: 0, trait: null, i18n: { vi: "c" } },
    ];
    return product;
  };
  const uid = () => base().options[0].uid;

  it("adds a feature after the last feature (features come first) and a 'best for' at the end, each with its own numbering", () => {
    const afterFeature = addBullet(withBullets(), uid(), "feature").options[0].bullets;
    expect(afterFeature.map((b) => [b.kind, b.position])).toEqual([["feature", 0], ["feature", 1], ["feature", 2], ["best_for", 0]]);
    const afterBestFor = addBullet(withBullets(), uid(), "best_for").options[0].bullets;
    expect(afterBestFor.map((b) => [b.kind, b.position])).toEqual([["feature", 0], ["feature", 1], ["best_for", 0], ["best_for", 1]]);
    const empty = base();
    empty.options[0].bullets = [];
    expect(addBullet(empty, uid(), "best_for").options[0].bullets[0]).toMatchObject({ kind: "best_for", position: 0, trait: null });
  });

  it("removes one and closes the gap within its kind", () => {
    const bullets = removeBullet(withBullets(), uid(), 0).options[0].bullets;
    expect(bullets.map((b) => [b.i18n.vi, b.kind, b.position])).toEqual([["b", "feature", 0], ["c", "best_for", 0]]);
  });

  it("moves within its kind and never across kinds", () => {
    const moved = moveBullet(withBullets(), uid(), 1, -1).options[0].bullets;
    expect(moved.map((b) => [b.i18n.vi, b.position])).toEqual([["b", 0], ["a", 1], ["c", 0]]);
    expect(moveBullet(withBullets(), uid(), 2, -1).options[0].bullets.map((b) => b.i18n.vi)).toEqual(["a", "b", "c"]);
  });

  it("turning a feature into a 'best for' line drops its icon and moves it to the end", () => {
    const bullets = setBulletKind(withBullets(), uid(), 0, "best_for").options[0].bullets;
    expect(bullets.map((b) => [b.i18n.vi, b.kind, b.position, b.trait])).toEqual([["b", "feature", 0, "foil-accent"], ["a", "best_for", 0, null], ["c", "best_for", 1, null]]);
  });
});

describe("sizes", () => {
  it("adds the first tier the scope has not used, and stops at three", () => {
    let product = base(); // whole product has "large"
    product = addSize(product, null);
    expect(product.sizes[product.sizes.length - 1]).toMatchObject({ shape: null, tier: "medium", w: null, text: null });
    expect(hasFreeTier(product, null)).toBe(true);
    product = addSize(product, null);
    expect(hasFreeTier(product, null)).toBe(false);
    expect(addSize(product, null)).toBe(product);
    expect(hasFreeTier(product, UID.shapeA4)).toBe(true);
  });
  it("removes by index", () => {
    expect(removeSize(base(), 0).sizes).toHaveLength(1);
  });
});

describe("specs", () => {
  it("adds to the end of its scope and kind, moves within them, removes and renumbers", () => {
    let product = addSpec(addSpec(base(), null, "technique"), null, "technique");
    const techniques = () => product.specs.filter((s) => s.shape === null && s.kind === "technique");
    expect(positions(techniques())).toEqual([0, 1, 2]);
    product = moveSpec(product, product.specs.indexOf(techniques()[2]), -1);
    expect(positions(techniques())).toEqual([0, 1, 2]);
    product = removeSpec(product, product.specs.indexOf(techniques()[0]));
    expect(positions(techniques())).toEqual([0, 1]);
  });
  it("changing the kind clears the chosen item (it was picked from the old kind's list)", () => {
    const product = setSpecKind(base(), 0, "finishing");
    expect(product.specs[0]).toMatchObject({ kind: "finishing", item: "" });
  });
});

describe("URLs", () => {
  it("moving to a category drops the alias that would equal the new canonical URL, in that language only", () => {
    const product = base();
    product.slugs = slugsOf("to-roi", "flyers", { vi: [{ category: "tet", slug: "to-roi" }, { category: "office", slug: "tai-lieu" }], en: [{ category: "tet", slug: "to-roi" }] });
    const moved = moveToCategory(product, "tet");
    expect(moved.category).toBe("tet");
    expect(moved.slugs.vi.aliases).toEqual([{ category: "office", slug: "tai-lieu" }]);
    expect(moved.slugs.en.aliases).toEqual([{ category: "tet", slug: "to-roi" }]); // English's canonical is "flyers": no clash
  });

  it("choosing a slug the product already answers to makes it canonical and removes the alias", () => {
    const next = setProductSlug(base(), "vi", "flyer"); // the fixture lists marketing/flyer as a Vietnamese alias
    expect(next.slugs.vi.slug).toBe("flyer");
    expect(next.slugs.vi.aliases).toEqual([]);
  });

  it("does the same for a shape's plain aliases", () => {
    const next = setChildSlug(base(), "shapes", UID.shapeA4, "vi", "kho-a4");
    expect(next.shapes[1].slugs.vi).toEqual({ slug: "kho-a4", aliases: [] });
  });

  it("knows every slug the other shapes and options answer to, per language", () => {
    const taken = takenSlugs(base(), UID.shapeA5);
    expect(taken.vi?.has("a4")).toBe(true);
    expect(taken.vi?.has("kho-a4")).toBe(true); // an alias counts
    expect(taken.vi?.has("a5")).toBe(false); // its own slug does not
    expect(taken.en?.has("type-c-paper")).toBe(true);
  });

  it("a new shape follows the names typed for it (zh/ja/ko follow English)", () => {
    let product = addShape(base());
    const added = product.shapes[2];
    const before = structuredClone(added);
    product = { ...product, shapes: product.shapes.map((s) => (s.uid === added.uid ? { ...s, i18n: { vi: { name: "Khổ A3" } } } : s)) };
    product = followChildNames(product, "shapes", added.uid, before);
    expect(product.shapes[2].slugs.vi.slug).toBe("kho-a3");
    expect(product.shapes[2].slugs.en.slug).toMatch(/^moi-/);
    const beforeEn = structuredClone(product.shapes[2]);
    product = { ...product, shapes: product.shapes.map((s) => (s.uid === added.uid ? { ...s, i18n: { ...s.i18n, en: { name: "A3 size" } } } : s)) };
    product = followChildNames(product, "shapes", added.uid, beforeEn);
    expect(LOCALES.filter((l) => l !== "vi").map((l) => product.shapes[2].slugs[l].slug)).toEqual(["a3-size", "a3-size", "a3-size", "a3-size"]);
  });

  it("does not take a slug another shape or option already has", () => {
    let product = addShape(base());
    const added = product.shapes[2];
    const before = structuredClone(added);
    product = { ...product, shapes: product.shapes.map((s) => (s.uid === added.uid ? { ...s, i18n: { vi: { name: "A4" } } } : s)) };
    product = followChildNames(product, "shapes", added.uid, before);
    expect(product.shapes[2].slugs.vi.slug).toBe("a4-2"); // "a4" is the A4 shape's
  });
});

describe("sectionOfPath", () => {
  it.each([
    ["category", "general"],
    ["i18n.vi.title", "general"],
    ["cover", "general"],
    ["slugs.vi.slug", "urls"],
    ["i18n.en.seoTitle", "urls"],
    ["ogImage", "urls"],
    ["shapes[0].i18n.vi.name", "shapes"],
    ["options[2].prices.base", "options"],
    ["sizes[0].w", "sizes"],
    ["specs[1].item", "specs"],
  ])("%s belongs to %s", (path, section) => {
    expect(sectionOfPath(path)).toBe(section);
  });
  it("only names sections that exist", () => {
    expect(PRODUCT_SECTIONS.map((s) => s.id)).toEqual(["general", "urls", "shapes", "options", "sizes", "specs"]);
  });
});
