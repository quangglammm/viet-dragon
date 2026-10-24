import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { optionRecordFor, type ProductRecord } from "@/scripts/seed/context";
import { LOCALES } from "@/scripts/seed/localized";
import { resolveSegment } from "@/scripts/seed/resolve";
import { BASE_LABEL } from "@/scripts/seed/steps/sizes-specs";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { buildCatalog } from "./catalog";
import { loadCatalogInput } from "./load";
import { buildMenus } from "./menus";
import { navigationOf, type Navigation } from "./navigation";
import { categoryPageOf, glossaryOf, productPageOf, type ProductPageModel } from "./pages";
import type { Catalog, MenuView, ProductView } from "./types";
import { resolveUrl } from "./urls";

// What each catalog page and the navigation say, built from a database seeded from the old static files, against what the old pages
// computed from those files. The checks are in Vietnamese unless a test says otherwise (M1 compared every field in every language);
// here the subject is the choice of WHAT a page shows: which cards, in which order, with which links and anchors.

type Locale = (typeof LOCALES)[number];

let seeded: SeededDatabase;
let catalog: Catalog;
let menus: Record<string, MenuView>;

beforeAll(async () => {
  seeded = await createSeededDatabase("read-pages");
  const input = await loadCatalogInput(seeded.db);
  catalog = buildCatalog(input);
  menus = buildMenus(catalog, input.menus);
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const records = () => [...seeded.outcome.products.values()];
const viewOf = (record: Pick<ProductRecord, "uid">): ProductView => catalog.products.find((product) => product.uid === record.uid)!;
const navigation = (locale: Locale): Navigation => navigationOf(catalog, menus, locale);

/**
 * An old link in today's Vietnamese URL: the category segment is a localized word since the URL decision (`marketing` → `tiep-thi`; the
 * old one stays valid as an alias, which the resolver tests cover), everything after it is unchanged.
 */
const inVietnamese = (href: string): string => href.replace(/^\/products\/([^/#]+)/, (_, id: string) => `/products/${catalog.categories.find((category) => category.id === id)?.slugs.vi.slug ?? id}`);

/** `/products/a/b/c#d` → what the resolver is asked; the link is canonical when it answers "ok" for exactly that path. */
function isCanonical(locale: Locale, href: string): boolean {
  const [path, hash] = href.split("#");
  const [, , category, product, segment] = path.split("/");
  const resolved = resolveUrl(catalog, locale, { category, product, segment });
  return resolved.status === "ok" && (hash === undefined || hash !== "");
}

function modelOf(locale: Locale, record: ProductRecord, segment?: string): ProductPageModel {
  const product = viewOf(record);
  const category = catalog.categories.find((candidate) => candidate.id === product.category)!;
  const found = resolveUrl(catalog, locale, { category: category.slugs[locale].slug, product: product.slugs[locale].slug, segment });
  if (found.status !== "ok" || !found.product) throw new Error(`${record.key}/${segment ?? ""} in ${locale}: ${found.status}`);
  return productPageOf(catalog, locale, found.category, found.product, found.target);
}

describe("the tier names", () => {
  it("are, in the UI copy, the ones the stored size notes were derived against (the seed's)", () => {
    for (const locale of LOCALES) {
      const { materialCard } = JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")) as { materialCard: { tier: Record<string, string>; sizeLabel: string } };
      expect([materialCard.tier.large, materialCard.tier.medium, materialCard.tier.small], locale).toEqual([...BASE_LABEL[locale]]);
      expect(materialCard.sizeLabel).toBe("{tier} ({note})");
    }
  });
});

describe("the navigation", () => {
  it("reproduces the four mega-menus in Vietnamese: the same groups, links, labels and pictures, in the same order", () => {
    const { src } = seeded;
    const nav = navigation("vi");
    const bad: string[] = [];
    const renamed: string[] = [];
    const renamedAnchors: string[] = [];
    let links = 0;
    for (const [categoryId, columns] of Object.entries(src.menus)) {
      const menu = nav.categories.find((category) => category.id === categoryId)!.menu;
      if (menu.columns.length !== columns.length) bad.push(`${categoryId} columns`);
      columns.forEach((column, ci) =>
        column.groups.forEach((group, gi) => {
          const built = menu.columns[ci]?.groups[gi];
          if (!built) return bad.push(`${group.id} missing`);
          if (built.href !== inVietnamese(group.href)) bad.push(`${group.id} href ${built.href} ≠ ${inVietnamese(group.href)}`);
          if (built.image !== group.image) bad.push(`${group.id} image`);
          if (built.title !== group.titleVi) bad.push(`${group.id} title`);
          group.items.forEach((item, ii) => {
            links += 1;
            const link = built.items[ii];
            if (!link) return bad.push(`${item.id} missing`);
            if (link.label !== item.nameVi || link.image !== item.image || link.isFast !== Boolean(item.isFast)) bad.push(`${item.id} label/image/fast`);
            if (link.href !== inVietnamese(item.href)) {
              const [, , category, product, segment] = inVietnamese(item.href).split("#")[0].split("/");
              if (item.href.includes("#")) {
                // A shape link whose hash is an old name of the shape: the canonical anchor replaced it, and the old name still scrolls to the same card.
                const page = modelOf("vi", seeded.outcome.products.get(`${categoryId}/${group.href.split("/")[3]}`)!);
                const card = page.kind === "shapes" ? page.shapes.find((shape) => shape.anchor.id === link.href.split("#")[1]) : undefined;
                if (card?.anchor.aliases.includes(item.href.split("#")[1])) renamedAnchors.push(`${item.href} → ${link.href}`);
                else bad.push(`${item.id} href ${link.href} ≠ ${inVietnamese(item.href)}`);
              } else {
                // A material link written with an old name of the material: the old URL answers a redirect to the canonical page, and the new link points there directly.
                const old = resolveUrl(catalog, "vi", { category, product, segment });
                if (old.status === "redirect" && old.to === link.href) renamed.push(`${item.href} → ${link.href}`);
                else bad.push(`${item.id} href ${link.href} ≠ ${inVietnamese(item.href)}`);
              }
            }
          });
        }),
      );
    }
    expect(links).toBe(100);
    expect(bad).toEqual([]);
    // Every other link is character for character the old one.
    expect(renamed).toHaveLength(8);
    expect(renamedAnchors).toEqual(["/products/marketing/catalogues#ho-so-nang-luc → /products/tiep-thi/catalogues#profile-company"]);
  });

  it("shows behind the desktop menu the picture each of the four old menus used", () => {
    const defaults = Object.fromEntries(navigation("vi").categories.map((category) => [category.id, category.menu.defaultImage]));
    expect(defaults).toEqual({
      marketing: "/images/category/poster-bangron-standee.webp",
      office: "/images/category/danhthiep.webp",
      packaging: "/images/product/vd-item-decal.jpeg",
      tet: "/images/category/lichdeban.webp",
    });
  });

  it.each(LOCALES)("links only canonical URLs in %s, and every shape link's hash is that shape's anchor on its page", (locale) => {
    const bad: string[] = [];
    for (const category of navigation(locale).categories) {
      if (!isCanonical(locale, category.href)) bad.push(category.href);
      for (const card of category.cards) if (!isCanonical(locale, card.href)) bad.push(card.href);
      for (const group of category.menu.columns.flatMap((column) => column.groups)) {
        if (!isCanonical(locale, group.href)) bad.push(group.href);
        for (const item of group.items) {
          const [path, hash] = item.href.split("#");
          if (!isCanonical(locale, path)) bad.push(item.href);
          if (hash !== undefined) {
            const record = records().find((candidate) => viewOf(candidate).slugs[locale].slug === path.split("/")[3] && viewOf(candidate).category === category.id)!;
            const page = modelOf(locale, record);
            if (page.kind !== "shapes" || !page.shapes.some((shape) => shape.anchor.id === hash)) bad.push(`${item.href}: no such anchor`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("the category pages and the shop strips", () => {
  /** What the old products index and the old category pages (but Tet's) listed: the category's products, worded as the products are. */
  function oldItems(categoryId: string) {
    return seeded.src.subgroups.filter((sub) => sub.categoryId === categoryId).map((sub) => ({ id: sub.id, title: sub.titleVi, titleEn: sub.titleEn, image: sub.coverImage, sub }));
  }

  it("list the same products in the same order, worded and pictured as the products are", () => {
    const differences: string[] = [];
    for (const locale of ["vi", "en"] as const) {
      for (const category of navigation(locale).categories) {
        const old = oldItems(category.id);
        const ids = category.cards.map((card) => records().find((record) => record.uid === card.id)!.source.id);
        expect(ids, category.id).toEqual(old.map((item) => item.id));
        category.cards.forEach((card, at) => {
          const want = old[at];
          const title = locale === "vi" ? want.title : want.titleEn;
          const description = locale === "vi" ? want.sub.descriptionVi : want.sub.descriptionEn;
          if (card.title !== title) differences.push(`${locale} ${category.id}/${want.id} title: «${card.title}» for «${title}»`);
          if (card.description !== description) differences.push(`${locale} ${category.id}/${want.id} description`);
          if (card.image !== want.image) differences.push(`${locale} ${category.id}/${want.id} image: ${card.image} for ${want.image}`);
          if (locale === "vi" && card.href !== inVietnamese(`/products/${category.id}/${want.id}`)) differences.push(`${locale} ${category.id}/${want.id} href ${card.href}`);
        });
      }
    }
    expect(differences).toEqual([]);
  });

  it("no longer word the Tet cards after the mega-menu, as the old Tet page did (en: 1 of 8; vi: none)", () => {
    const groups = seeded.src.menus.tet.flatMap((column) => column.groups);
    const cards = Object.fromEntries((["vi", "en"] as const).map((locale) => [locale, navigation(locale).categories.find((category) => category.id === "tet")!.cards]));
    const changed: string[] = [];
    groups.forEach((group, at) => {
      for (const locale of ["vi", "en"] as const) {
        const was = locale === "vi" ? group.titleVi : group.titleEn;
        if (cards[locale][at].title !== was) changed.push(`${locale} ${group.href.split("/")[3]}: «${was}» → «${cards[locale][at].title}»`);
      }
    });
    expect(groups).toHaveLength(8);
    expect(changed).toEqual(["en bao-li-xi: «Lucky Money Envelopes» → «Red Envelopes - Lucky Money»"]);
  });

  it("choose the gallery picture under each card as the old category page did", () => {
    const bad: string[] = [];
    for (const category of navigation("vi").categories) {
      const old = oldItems(category.id);
      category.cards.forEach((card, at) => {
        const { sub, image } = old[at];
        const images = [image, ...sub.shapes.map((shape) => shape.image)];
        let want = image;
        if (images.length > 1) want = images.find((candidate) => candidate !== image) ?? image;
        else if (sub.materials?.length > 0) {
          const unique = sub.materials.flatMap((option) => [...(option.images ?? []), ...(option.pureImages ?? [])]).filter((candidate) => candidate !== image);
          if (unique.length >= 2) want = unique[1];
          else if (unique.length === 1) want = unique[0];
        }
        if (card.referenceImage !== want) bad.push(`${category.id}/${old[at].id}: ${card.referenceImage} for ${want}`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("link the neighbouring categories in the old order", () => {
    const bad: string[] = [];
    for (const [at, category] of catalog.categories.entries()) {
      const page = categoryPageOf(catalog, "vi", category);
      const prev = catalog.categories[at - 1];
      const next = catalog.categories[at + 1];
      if ((page.prev?.href ?? null) !== (prev ? inVietnamese(`/products/${prev.id}`) : null)) bad.push(`${category.id} prev`);
      if ((page.next?.href ?? null) !== (next ? inVietnamese(`/products/${next.id}`) : null)) bad.push(`${category.id} next`);
      if (page.meta.title !== `${seeded.src.categories[at].nameVi} | Viet Dragon`) bad.push(`${category.id} title`);
    }
    expect(bad).toEqual([]);
  });
});

describe("a product's page", () => {
  it("is a grid of its shapes when the old page showed one: the same shapes, order, names, pictures and anchors, and every old hash still finds its shape", () => {
    const { src } = seeded;
    const bad: string[] = [];
    let grids = 0;
    for (const record of records()) {
      const sub = record.source;
      if (sub.shapes.length === 0) continue;
      grids += 1;
      for (const locale of ["vi", "en"] as const) {
        const page = modelOf(locale, record);
        if (page.kind !== "shapes") {
          bad.push(`${record.key} ${locale} is ${page.kind}`);
          continue;
        }
        if (page.shapes.length !== sub.shapes.length) bad.push(`${record.key} ${locale} shape count`);
        page.shapes.forEach((card, at) => {
          const shape = sub.shapes[at];
          if (card.name !== (locale === "vi" ? shape.nameVi : shape.nameEn)) bad.push(`${record.key}/${shape.id} ${locale} name`);
          if (card.description !== (locale === "vi" ? shape.descriptionVi : shape.descriptionEn).trim() && locale === "vi") bad.push(`${record.key}/${shape.id} description`);
          if (locale === "vi" && card.href !== inVietnamese(`/products/${sub.categoryId}/${sub.id}/${shape.id}`)) bad.push(`${record.key}/${shape.id} href ${card.href}`);
          if (locale === "vi" && card.anchor.id !== shape.id) bad.push(`${record.key}/${shape.id} anchor ${card.anchor.id}`);
          const names = new Set([card.anchor.id, ...card.anchor.aliases]);
          for (const [alias, target] of Object.entries(src.shapeAliases)) if (target === shape.id && !names.has(alias)) bad.push(`${record.key}/${shape.id} alias ${alias}`);
          if (!names.has(shape.id)) bad.push(`${record.key}/${shape.id} old id`);
        });
      }
    }
    expect(grids).toBeGreaterThan(10);
    expect(bad).toEqual([]);
  });

  it("is the product's materials when it has no shapes, the old ones in the old order with the old product name", () => {
    const bad: string[] = [];
    let pages = 0;
    for (const record of records()) {
      const sub = record.source;
      if (sub.shapes.length > 0) continue;
      pages += 1;
      const page = modelOf("vi", record);
      if (page.kind !== "detail") {
        bad.push(`${record.key} is ${page.kind}`);
        continue;
      }
      const want = (sub.materials ?? []).map((material) => optionRecordFor(record, material)!.uid);
      if (page.cards.map((card) => card.uid).join() !== want.join()) bad.push(`${record.key} cards`);
      if (page.cards.some((card) => card.consultName !== sub.titleVi)) bad.push(`${record.key} consult name`);
      if (page.meta.title !== `${sub.titleVi} | Viet Dragon`) bad.push(`${record.key} title`);
    }
    expect(pages).toBeGreaterThan(0);
    expect(bad).toEqual([]);
  });

  it("links the products either side of it in the category as the old page did", () => {
    const bad: string[] = [];
    for (const record of records()) {
      if (record.source.shapes.length > 0) continue;
      const page = modelOf("vi", record);
      if (page.kind !== "detail") continue;
      const siblings = seeded.src.subgroups.filter((sub) => sub.categoryId === record.source.categoryId);
      const at = siblings.findIndex((sub) => sub.id === record.source.id);
      const prev = siblings[at - 1];
      const next = siblings[at + 1];
      if ((page.prev?.href ?? null) !== (prev ? inVietnamese(`/products/${prev.categoryId}/${prev.id}`) : null)) bad.push(`${record.key} prev ${page.prev?.href} for ${prev?.id}`);
      if ((page.next?.href ?? null) !== (next ? inVietnamese(`/products/${next.categoryId}/${next.id}`) : null)) bad.push(`${record.key} next ${page.next?.href} for ${next?.id}`);
    }
    expect(bad).toEqual([]);
  });
});

describe("a shape's page", () => {
  it("shows the materials of the shape, else of the product, named after the shape, with the old title, neighbours and picture", () => {
    const bad: string[] = [];
    let pages = 0;
    for (const record of records()) {
      const sub = record.source;
      for (const shapeRecord of record.shapes) {
        pages += 1;
        const shape = shapeRecord.source;
        const page = modelOf("vi", record, shape.id);
        if (page.kind !== "shape") {
          bad.push(`${record.key}/${shape.id} is ${page.kind}`);
          continue;
        }
        const materials = shape.materials && shape.materials.length > 0 ? shape.materials : (sub.materials ?? []);
        if (page.cards.map((card) => card.uid).join() !== materials.map((material) => optionRecordFor(record, material)!.uid).join()) bad.push(`${record.key}/${shape.id} cards`);
        materials.forEach((material, at) => {
          if (page.cards[at]?.consultName !== `${shape.nameVi} - ${material.nameVi}`) bad.push(`${record.key}/${shape.id} consult name ${at}`);
        });
        if (page.meta.title !== `${shape.nameVi} - ${sub.titleVi} | Viet Dragon`) bad.push(`${record.key}/${shape.id} title`);
        if (page.shape.description !== shape.descriptionVi.trim()) bad.push(`${record.key}/${shape.id} description`);
        const index = sub.shapes.indexOf(shape);
        const link = (other: (typeof sub.shapes)[number] | undefined) => (other ? inVietnamese(`/products/${sub.categoryId}/${sub.id}/${other.id}`) : null);
        if ((page.prev?.href ?? null) !== link(sub.shapes[index - 1])) bad.push(`${record.key}/${shape.id} prev`);
        if ((page.next?.href ?? null) !== link(sub.shapes[index + 1])) bad.push(`${record.key}/${shape.id} next`);
      }
    }
    expect(pages).toBe(77);
    expect(bad).toEqual([]);
  });
});

describe("a material's page", () => {
  it("shows the product's materials with the one the URL named picked out, for every material slug the old page accepted", () => {
    const { src } = seeded;
    const bad: string[] = [];
    let pages = 0;
    for (const record of records()) {
      const sub = record.source;
      const all = [...(sub.materials ?? []), ...sub.shapes.flatMap((shape) => shape.materials ?? [])];
      for (const material of all) {
        const segment = src.toSlug(material.nameVi);
        if (sub.shapes.some((shape) => shape.id === segment)) continue; // the old page treats the segment as the shape
        const old = resolveSegment(src, record, segment);
        if (old?.kind !== "option") continue;
        pages += 1;
        const page = modelOf("vi", record, segment);
        if (page.kind !== "material") {
          bad.push(`${record.key}/${segment} is ${page.kind}`);
          continue;
        }
        if (page.material.uid !== old.option.uid) bad.push(`${record.key}/${segment} target`);
        const shown = sub.materials && sub.materials.length > 0 ? sub.materials : all;
        if (page.cards.map((card) => card.uid).join() !== shown.map((option) => optionRecordFor(record, option)!.uid).join()) bad.push(`${record.key}/${segment} cards`);
        if (page.meta.title !== `${sub.titleVi} - ${old.option.source.nameVi} | Viet Dragon`) bad.push(`${record.key}/${segment} title`);
        if (page.cards.some((card) => !card.consultName.startsWith(`${sub.titleVi} - `))) bad.push(`${record.key}/${segment} consult name`);
      }
    }
    expect(pages).toBeGreaterThan(50);
    expect(bad).toEqual([]);
  });
});

describe("the glossary", () => {
  it("lists the traits of the old glossary with their Vietnamese and English text", () => {
    const old = Object.entries(seeded.src.traits);
    const vi = glossaryOf(catalog, "vi");
    const en = glossaryOf(catalog, "en");
    expect(vi.map((trait) => trait.key).sort()).toEqual(old.map(([key]) => key).sort());
    for (const [key, source] of old) {
      expect(vi.find((trait) => trait.key === key)).toMatchObject({ label: source.labelVi, description: source.descriptionVi });
      expect(en.find((trait) => trait.key === key)).toMatchObject({ label: source.label, description: source.description });
    }
  });
});
