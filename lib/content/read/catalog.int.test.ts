import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isIconName } from "@/lib/icons";
import type { ProductRecord } from "@/scripts/seed/context";
import { LOCALES, localizedList, localizedText, translated } from "@/scripts/seed/localized";
import { formatMaterialDisplayName } from "@/scripts/seed/material-name";
import { readSizesAndSpecs, replayCardCalls, type SizeSpecReadback } from "@/scripts/seed/measures";
import { menuSegment, resolveSegment, segmentCandidates } from "@/scripts/seed/resolve";
import { suggestedBulletsFor } from "@/scripts/seed/suggested-translations";
import { isBlankText, orNull } from "@/scripts/seed/util";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { buildCatalog } from "./catalog";
import { sizeOf } from "./card";
import { loadCatalogInput } from "./load";
import { buildMenus } from "./menus";
import { sizesFor, specsFor } from "./selectors";
import type { Catalog, MenuView, ProductView } from "./types";
import { resolveUrl } from "./urls";

// Equivalence: what the public site's view of the catalog says, read from a database seeded from the old static files, against what
// those files said — field by field, language by language. Where the file and the page disagree (sizes and specs that vary with the
// name, per-product names in zh/ja/ko…) the seed picked one answer and the owner decides (docs/data-model.md §8); those are measured.

let seeded: SeededDatabase;
let catalog: Catalog;
let menus: Record<string, MenuView>;
let registered: ReadonlySet<string>;

beforeAll(async () => {
  seeded = await createSeededDatabase("read-catalog");
  const input = await loadCatalogInput(seeded.db);
  catalog = buildCatalog(input);
  menus = buildMenus(catalog, input.menus);
  registered = new Set((await seeded.scratch.pool.query(`select storage_key from media`)).rows.map((row: { storage_key: string }) => row.storage_key));
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const records = () => [...seeded.outcome.products.values()];
const viewOf = (record: Pick<ProductRecord, "uid">): ProductView => {
  const view = catalog.products.find((product) => product.uid === record.uid);
  if (!view) throw new Error(`no view of ${record.uid}`);
  return view;
};
const noSlash = (path: string): string => path.replace(/^\//, "");
/** The path the site would serve, or null when the file is not one the media library holds (the seed leaves those out). */
const served = (path: string | undefined): string | null => (path && registered.has(noSlash(path)) ? `/${noSlash(path)}` : null);

describe("the catalog", () => {
  it("holds every category and every product the old files listed, in their order", () => {
    expect(catalog.categories.map((category) => category.id)).toEqual(seeded.src.categories.map((category) => category.id));
    expect(catalog.products.map((product) => product.uid)).toEqual(
      seeded.src.categories.flatMap((category) => records().filter((record) => record.source.categoryId === category.id).map((record) => record.uid)),
    );
    expect(catalog.products).toHaveLength(25);
  });

  it("stays well under the data cache's size limit (2 MB per entry)", () => {
    const bytes = Buffer.byteLength(JSON.stringify(catalog));
    expect(bytes).toBeLessThan(1_500_000);
  });

  it("names the categories in every language they have", () => {
    const bad: string[] = [];
    for (const source of seeded.src.categories) {
      const view = catalog.categories.find((category) => category.id === source.id)!;
      for (const locale of LOCALES) {
        const want = locale === "vi" ? source.nameVi : locale === "en" ? source.nameEn : translated(seeded.src.translations.CATEGORY_NAMES, source.id, locale);
        if ((view.name[locale] ?? null) !== (want ?? null)) bad.push(`${source.id} ${locale}`);
      }
      if (view.cover !== source.coverImage) bad.push(`${source.id} cover`);
      if (view.icon !== source.icon) bad.push(`${source.id} icon`);
    }
    expect(bad).toEqual([]);
  });
});

describe("products and shapes", () => {
  it("carry the title, description, cover and slugs the old product page used", () => {
    const { translations } = seeded.src;
    const bad: string[] = [];
    for (const record of records()) {
      const sub = record.source;
      const view = viewOf(record);
      for (const locale of LOCALES) {
        const title = locale === "vi" ? sub.titleVi : locale === "en" ? sub.titleEn : (localizedText(sub, "title", "suffixed", locale) ?? translated(translations.ITEM_NAMES, sub.id, locale));
        const description = locale === "vi" ? sub.descriptionVi : locale === "en" ? sub.descriptionEn : (localizedText(sub, "description", "suffixed", locale) ?? translated(translations.ITEM_DESCS, sub.id, locale));
        if ((view.title[locale] ?? null) !== (title ?? null) || (view.description[locale] ?? null) !== (orNull(description) ?? null)) bad.push(`${record.key} ${locale} text`);
        if (view.slugs[locale].slug !== record.slugs[locale]) bad.push(`${record.key} ${locale} slug`);
      }
      if (view.cover !== served(sub.coverImage)) bad.push(`${record.key} cover`);
      if (view.category !== sub.categoryId) bad.push(`${record.key} category`);
    }
    expect(bad).toEqual([]);
  });

  it("carry each shape's names, descriptions, badges, image and slugs, in the old order", () => {
    const { translations } = seeded.src;
    const bad: string[] = [];
    let checked = 0;
    for (const record of records()) {
      const view = viewOf(record);
      if (view.shapes.map((shape) => shape.uid).join() !== record.shapes.map((shape) => shape.uid).join()) bad.push(`${record.key} shape order`);
      for (const shapeRecord of record.shapes) {
        const source = shapeRecord.source;
        const shape = view.shapes.find((candidate) => candidate.uid === shapeRecord.uid)!;
        for (const locale of LOCALES) {
          if (shape.slugs[locale].slug !== shapeRecord.slugs[locale]) bad.push(`${record.key}/${source.id} ${locale} slug`);
          const name = locale === "vi" ? source.nameVi : locale === "en" ? source.nameEn : localizedText(source, "name", "suffixed", locale);
          if ((shape.name[locale] ?? null) !== (name ?? null)) bad.push(`${record.key}/${source.id} ${locale} name`);
          if (name == null) continue;
          checked += 1;
          const description = locale === "vi" ? source.descriptionVi : locale === "en" ? source.descriptionEn : (localizedText(source, "description", "suffixed", locale) ?? translated(translations.SHAPE_DESCS, source.id, locale));
          const badge = locale === "vi" ? source.badgeVi : locale === "en" ? source.badgeEn : translated(translations.BADGE_TRANSLATIONS, source.badgeVi ?? "", locale);
          if ((shape.description[locale] ?? null) !== (orNull(description) ?? null)) bad.push(`${record.key}/${source.id} ${locale} description`);
          if ((shape.badge[locale] ?? null) !== (orNull(badge) ?? null)) bad.push(`${record.key}/${source.id} ${locale} badge`);
        }
        if (shape.image !== served(source.image)) bad.push(`${record.key}/${source.id} image`);
      }
    }
    expect(checked).toBeGreaterThan(300);
    expect(bad).toEqual([]);
  });
});

describe("options", () => {
  it("carry the name, card heading, tagline, bullets, trait icons, photos, switches and prices of every option (110 of them)", () => {
    const bad: string[] = [];
    let options = 0;
    for (const record of records()) {
      const view = viewOf(record);
      for (const optionRecord of record.options) {
        options += 1;
        const source = optionRecord.source;
        const option = view.options.find((candidate) => candidate.uid === optionRecord.uid);
        const where = `${record.key} ${source.nameVi}`;
        if (!option) {
          bad.push(`${where} missing`);
          continue;
        }
        if (option.shape !== (optionRecord.shapeRecord?.uid ?? null)) bad.push(`${where} scope`);
        for (const locale of LOCALES) {
          if (option.slugs[locale].slug !== optionRecord.slugs[locale]) bad.push(`${where} ${locale} slug`);
          const authored = localizedText(source, "name", "option", locale);
          const named = !isBlankText(authored);
          if ((option.name[locale] ?? null) !== (named ? (authored as string).trim() : null)) bad.push(`${where} ${locale} name`);
          // The heading the card shows today: the stock name the old code computed from the authored one.
          if ((option.title[locale] ?? null) !== (named ? formatMaterialDisplayName(authored as string, locale).trim() : null)) bad.push(`${where} ${locale} heading`);
          if (named && (option.tagline[locale] ?? null) !== (orNull(localizedText(source, "tagline", "option", locale)) ?? null)) bad.push(`${where} ${locale} tagline`);
          for (const [kind, field] of [["feature", "description"], ["best_for", "bestFor"]] as const) {
            const wanted = suggestedBulletsFor(record.key, source, kind, locale) ?? localizedList(source, field, "option", locale) ?? [];
            const got = kind === "feature" ? option.features.map((feature) => feature.text[locale]) : option.bestFor.map((line) => line[locale]);
            if (wanted.length !== got.filter((text) => text !== undefined).length || wanted.some((text, index) => text !== got[index])) bad.push(`${where} ${locale} ${kind}`);
          }
        }
        const traits = option.features.map((feature) => feature.trait);
        (source.descriptionTraits ?? []).forEach((trait, index) => {
          if ((traits[index] ?? null) !== (catalog.traits[trait] ? trait : null)) bad.push(`${where} trait ${index}`);
        });
        for (const [wantedPaths, got] of [
          [source.images?.length ? source.images : source.image ? [source.image] : [], option.images],
          [source.pureImages?.length ? source.pureImages : source.pureImage ? [source.pureImage] : [], option.pureImages],
        ] as const) {
          const wanted = wantedPaths.map(served).filter((path): path is string => path !== null);
          if (JSON.stringify(wanted) !== JSON.stringify(got)) bad.push(`${where} photos`);
        }
        if (option.hideFoil !== Boolean(source.hideFoilCheckbox) || option.hideDoubleSided !== Boolean(source.hideDoubleSidedCheckbox)) bad.push(`${where} switches`);
        const prices = [source.basePrice ?? null, source.doubleSidedPrice ?? null, source.foilPrice ?? null, source.foil2SidesPrice ?? null];
        if (JSON.stringify(prices) !== JSON.stringify([option.prices.base, option.prices.doubleSided, option.prices.foil, option.prices.foil2])) bad.push(`${where} prices`);
        if (source.icon && isIconName(source.icon) && option.icon !== source.icon) bad.push(`${where} icon`);
      }
      if (view.options.length !== record.options.length) bad.push(`${record.key} option count`);
    }
    expect(options).toBe(110);
    expect(bad).toEqual([]);
  });

  it("describe every trait the old glossary had, in Vietnamese and English", () => {
    const bad: string[] = [];
    for (const [key, source] of Object.entries(seeded.src.traits)) {
      const view = catalog.traits[key];
      if (!view || !view.icon) bad.push(`${key} missing`);
      else if (view.label.vi !== source.labelVi || view.label.en !== source.label || view.description.vi !== source.descriptionVi || view.description.en !== source.description) bad.push(`${key} text`);
    }
    expect(bad).toEqual([]);
  });
});

describe("sizes and spec lists", () => {
  /** The view's sizes and spec lists in the shape the old code returned them, so they can be compared with it and with the database. */
  function viewReadback(): SizeSpecReadback {
    return {
      sizes: (record, shape, locale) => sizesFor(viewOf(record), shape?.uid ?? null).map((size) => sizeOf(size, locale)),
      specs: (record, shape, kind, locale) => specsFor(viewOf(record), shape?.uid ?? null, kind).flatMap((spec) => (spec.label[locale] ? [spec.label[locale]] : [])),
    };
  }

  it("reproduce the canonical context of the old code for every product and shape (510 contexts)", () => {
    const readback = viewReadback();
    const { src } = seeded;
    const bad: string[] = [];
    let checked = 0;
    for (const record of records()) {
      const sub = record.source;
      for (const shape of [null, ...record.shapes]) {
        const name = shape ? shape.source.nameVi : sub.titleVi;
        for (const locale of LOCALES) {
          checked += 1;
          const where = `${record.key}/${shape?.source.id ?? "-"} ${locale}`;
          if (JSON.stringify(src.sizes(name, locale, sub.id, shape?.source.id, sub.categoryId)) !== JSON.stringify(readback.sizes(record, shape, locale))) bad.push(`sizes ${where}`);
          if (JSON.stringify(src.specs.finishing(name, "", locale, sub.id, shape?.source.id, sub.categoryId)) !== JSON.stringify(readback.specs(record, shape, "finishing", locale))) bad.push(`finishing ${where}`);
          if (JSON.stringify(src.specs.materials(name, "", locale, sub.id, shape?.source.id, sub.categoryId)) !== JSON.stringify(readback.specs(record, shape, "material_hint", locale))) bad.push(`materials ${where}`);
        }
      }
    }
    expect(checked).toBe(510);
    expect(bad).toEqual([]);
  });

  it("carry the printing techniques of the old card, in every language", () => {
    const bad: string[] = [];
    for (const record of records()) {
      for (const locale of LOCALES) {
        const got = specsFor(viewOf(record), null, "technique").map((spec) => spec.label[locale]);
        if (JSON.stringify(got) !== JSON.stringify(seeded.src.specs.techniques[locale])) bad.push(`${record.key} ${locale}`);
      }
    }
    expect(bad).toEqual([]);
  });

  // The view answers exactly what the database stores: replaying the old card's real calls against it measures the same distance
  // from today's output as the seed measured — the owner's decision (docs/data-model.md §8 item 1), not a defect of this layer.
  it("measures the same distance from today's card as the database's own answer does", async () => {
    const stored = await readSizesAndSpecs(seeded.db);
    const measure = replayCardCalls(seeded.src, seeded.outcome.products.values(), viewReadback());
    expect(measure).toEqual(replayCardCalls(seeded.src, seeded.outcome.products.values(), stored));
    expect(measure).toEqual({ renders: 4045, sizeDifferences: 425, materialHintDifferences: 1942, finishingDifferences: 117, rendersWithAnyDifference: 2163, distinctWithAnyDifference: 2143 });
  });
});

describe("menus", () => {
  it("can be rebuilt from the view exactly as the original files define them", () => {
    const { src } = seeded;
    let checks = 0;
    const bad: string[] = [];
    const expectEqual = (label: string, got: unknown, want: unknown) => {
      checks += 1;
      if (got !== want) bad.push(`${label}: ${String(got)} ≠ ${String(want)}`);
    };
    for (const [categoryId, columns] of Object.entries(src.menus)) {
      const menu = menus[categoryId];
      expectEqual(`${categoryId} column count`, menu.columns.length, columns.length);
      columns.forEach((column, ci) => {
        const viewColumn = menu.columns[ci];
        expectEqual(`${categoryId} column ${ci + 1} number`, viewColumn?.column, ci + 1);
        expectEqual(`${categoryId} column ${ci + 1} groups`, viewColumn?.groups.length, column.groups.length);
        column.groups.forEach((group, gi) => {
          const viewGroup = viewColumn?.groups[gi];
          if (!viewGroup) return;
          const [, , productId] = group.href.split("/").filter(Boolean);
          const record = seeded.outcome.products.get(`${categoryId}/${productId}`)!;
          const product = viewOf(record);
          expectEqual(`${group.id} product`, viewGroup.product, record.uid);
          for (const locale of LOCALES) {
            const want = localizedText(group, "title", "suffixed", locale);
            if (want?.trim()) expectEqual(`${group.id} title ${locale}`, viewGroup.title[locale], want);
          }
          expectEqual(`${group.id} image`, viewGroup.image, group.image);
          if (categoryId === "tet") {
            const sub = src.getSubgroupById(group.id, categoryId)!;
            for (const locale of LOCALES) {
              const want = locale === "vi" ? sub.descriptionVi : locale === "en" ? sub.descriptionEn : (translated(src.translations.ITEM_DESCS, group.id, locale) ?? sub.descriptionEn);
              expectEqual(`${group.id} description ${locale}`, viewGroup.description[locale] ?? viewGroup.description.en, want);
            }
          }
          expectEqual(`${group.id} item count`, viewGroup.items.length, group.items.length);
          group.items.forEach((item, ii) => {
            const viewItem = viewGroup.items[ii];
            if (!viewItem) return;
            const segment = menuSegment(item.href);
            const resolved = segment ? resolveSegment(src, record, segment) : null;
            const wantUid = resolved ? (resolved.kind === "shape" ? resolved.shape.uid : resolved.option.uid) : null;
            const gotUid = "shape" in viewItem.target ? viewItem.target.shape : viewItem.target.option;
            expectEqual(`${item.id} target`, gotUid, wantUid);
            expectEqual(`${item.id} Fast Print flag`, viewItem.isFast, Boolean(item.isFast));
            expectEqual(`${item.id} image`, viewItem.image, item.image);
            for (const locale of LOCALES) {
              const want = localizedText(item, "name", "suffixed", locale);
              if (want?.trim()) expectEqual(`${item.id} label ${locale}`, viewItem.label[locale], want);
            }
          });
          void product;
        });
      });
    }
    expect(bad).toEqual([]);
    expect(checks).toBeGreaterThan(800);
  });

  it("measures the menu texts that now come from the product instead of the menu file (owner decision 5)", () => {
    let derived = 0;
    for (const [categoryId, columns] of Object.entries(seeded.src.menus)) {
      menus[categoryId].columns.forEach((viewColumn, ci) =>
        columns[ci].groups.forEach((group, gi) => {
          for (const locale of LOCALES) if (!localizedText(group, "title", "suffixed", locale)?.trim() && viewColumn.groups[gi].title[locale]) derived += 1;
        }),
      );
    }
    // Languages the old menu file left blank now show the product's own title where the product has one (the old menu fell back to English).
    expect(derived).toBeGreaterThanOrEqual(0);
    console.info(`menu group titles taken from the product where the old menu had none: ${derived}`);
  });
});

describe("URLs", () => {
  /** The category, product and segment slugs of the page in a language, to ask the resolver about them. */
  const urlOf = (locale: (typeof LOCALES)[number], record: ProductRecord) => {
    const view = viewOf(record);
    const category = catalog.categories.find((candidate) => candidate.id === view.category)!;
    return { category: category.slugs[locale].slug, product: view.slugs[locale].slug };
  };

  it("send every candidate segment the old product pages accepted to the same shape or option, in every language", () => {
    const { src } = seeded;
    let checked = 0;
    const differences: string[] = [];
    for (const record of records()) {
      for (const locale of LOCALES) {
        const base = urlOf(locale, record);
        for (const segment of segmentCandidates(src, record)) {
          const old = resolveSegment(src, record, segment);
          if (!old) continue;
          checked += 1;
          const wanted = old.kind === "shape" ? old.shape.uid : old.option.uid;
          let resolved = resolveUrl(catalog, locale, { ...base, segment });
          if (resolved.status === "redirect") {
            const [, , category, product, target] = resolved.to.split("/");
            resolved = resolveUrl(catalog, locale, { category, product, segment: target });
          }
          const got = resolved.status === "ok" && resolved.target ? (resolved.target.shape ?? resolved.target.option)!.uid : null;
          if (got !== wanted) differences.push(`${record.key} ${locale} ${segment}`);
        }
      }
    }
    expect(checked).toBeGreaterThan(2000); // candidates the old page accepted (the seed test also counts the ones it rejected)
    expect(differences).toEqual([]);
  });

  it("find every /products/… link written in the public source (127 of them), in every language", () => {
    const unresolved: string[] = [];
    for (const [href, file] of seeded.src.productLinks) {
      const [path, hash] = href.split("#");
      const parts = path.split("/").filter(Boolean);
      if (parts[1] === "fast-print") continue;
      for (const locale of LOCALES) {
        const asked = { category: parts[1], product: parts[2], segment: parts[3] };
        const status = resolveUrl(catalog, locale, parts.length <= 1 ? { category: "" } : asked).status;
        if (parts.length > 1 && status === "notFound") unresolved.push(`${href} (${file}) in ${locale}`);
        if (hash && parts[2] && resolveUrl(catalog, locale, { ...asked, segment: hash }).status === "notFound") unresolved.push(`${href}#${hash} (${file}) in ${locale}`);
      }
    }
    expect(seeded.src.productLinks.size).toBe(127); // 130 before the chrome moved to the database and the examples in lib/menu-active.ts were rewritten
    expect(unresolved).toEqual([]);
  });
});
