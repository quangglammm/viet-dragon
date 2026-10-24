import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { LOCALES, localizedList, localizedText, translated } from "./localized";
import { formatMaterialDisplayName } from "./material-name";
import { readSizesAndSpecs, replayCardCalls, type SizeSpecReadback } from "./measures";
import { groupBy, isBlankText, orNull } from "./util";

// Read-back checks. Each compares what the DATABASE yields with what the SITE computes from the source today.
// A check says what it can and cannot prove: "storage fidelity" and "by construction" ones restate what the seed
// wrote; the others use an independent route (the source files, the page logic) and can fail.

let seeded: SeededDatabase;
let readback: SizeSpecReadback;
beforeAll(async () => {
  seeded = await createSeededDatabase("parity");
  readback = await readSizesAndSpecs(seeded.db);
}, 120_000);
afterAll(async () => {
  await seeded.close();
});

const rows = async <T extends object>(sql: string): Promise<T[]> => (await seeded.scratch.pool.query(sql)).rows as T[];
const products = () => [...seeded.outcome.products.values()];

describe("options", () => {
  it("keep their own names exactly as authored (page title, breadcrumb, alt text and lead message use them)", async () => {
    const stored = await rows<{ option_id: number; locale: string; name: string | null }>(`select option_id, locale, name from option_i18n`);
    const byKey = new Map(stored.map((r) => [`${r.option_id}|${r.locale}`, r.name]));
    const bad: string[] = [];
    let checked = 0;
    for (const product of products()) {
      for (const option of product.options) {
        for (const locale of LOCALES) {
          const authored = localizedText(option.source, "name", "option", locale);
          if (isBlankText(authored)) continue;
          checked += 1;
          if (byKey.get(`${option.id}|${locale}`) !== (authored as string).trim()) bad.push(`${product.key} ${locale}: ${authored}`);
        }
      }
    }
    expect(checked).toBe(550);
    expect(bad).toEqual([]);
  });

  // STORAGE FIDELITY: the heading is recomputed with the same display-name function the seed used, so this proves the
  // rule `card_title ?? stock name ?? name` reproduces it from what is stored, not that the function is right.
  it("reproduce today's card heading from card_title ?? stock name ?? name", async () => {
    const stored = await rows<{ option_id: number; locale: string; name: string | null; card_title: string | null; stock: string | null }>(
      `select i.option_id, i.locale, i.name, i.card_title, m.name stock from option_i18n i join option o on o.id = i.option_id left join material_i18n m on m.material_id = o.material_id and m.locale = i.locale`,
    );
    const byKey = new Map(stored.map((r) => [`${r.option_id}|${r.locale}`, r]));
    const bad: string[] = [];
    for (const product of products()) {
      for (const option of product.options) {
        for (const locale of LOCALES) {
          const authored = localizedText(option.source, "name", "option", locale);
          if (isBlankText(authored)) continue;
          const row = byKey.get(`${option.id}|${locale}`);
          const heading = row?.card_title ?? row?.stock ?? row?.name;
          if (heading !== formatMaterialDisplayName(authored as string, locale).trim()) bad.push(`${product.key} ${locale}: ${heading}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("keep taglines, bullet texts, bullet icons and photo lists", async () => {
    const taglines = new Map((await rows<{ option_id: number; locale: string; tagline: string | null }>(`select option_id, locale, tagline from option_i18n`)).map((r) => [`${r.option_id}|${r.locale}`, r.tagline]));
    const bullets = groupBy(
      await rows<{ option_id: number; kind: string; position: number; trait_key: string | null; locale: string | null; text: string | null }>(
        `select b.option_id, b.kind, b.position, b.trait_key, i.locale, i.text from option_bullet b left join option_bullet_i18n i on i.bullet_id = b.id`,
      ),
      (r) => Number(r.option_id),
    );
    const images = groupBy(
      await rows<{ option_id: number; variant: string; position: number; storage_key: string }>(
        `select oi.option_id, oi.variant, oi.position, m.storage_key from option_image oi join media m on m.id = oi.media_id order by 1, 2, 3`,
      ),
      (r) => Number(r.option_id),
    );
    const bad = { tagline: 0, text: 0, trait: 0, image: 0 };
    let textChecks = 0;
    let options = 0;
    for (const product of products()) {
      for (const option of product.options) {
        options += 1;
        const source = option.source;
        const mine = bullets.get(option.id) ?? [];
        for (const locale of LOCALES) {
          if ((orNull(localizedText(source, "tagline", "option", locale)) ?? null) !== (taglines.get(`${option.id}|${locale}`) ?? null) && !isBlankText(localizedText(source, "name", "option", locale))) bad.tagline += 1;
          for (const [kind, field] of [["feature", "description"], ["best_for", "bestFor"]] as const) {
            textChecks += 1;
            const wanted = localizedList(source, field, "option", locale) ?? [];
            const got: (string | undefined)[] = [];
            for (const r of mine.filter((m) => m.kind === kind && m.locale === locale)) got[r.position] = r.text ?? undefined;
            if (wanted.length !== got.filter((t) => t !== undefined).length || wanted.some((text, i) => text !== got[i])) bad.text += 1;
          }
        }
        const traits: (string | null)[] = [];
        for (const r of mine.filter((m) => m.kind === "feature")) traits[r.position] = r.trait_key;
        if ((source.descriptionTraits ?? []).some((trait, i) => (trait ?? null) !== (traits[i] ?? null))) bad.trait += 1;
        for (const [variant, one, many] of [["default", source.image, source.images], ["pure", source.pureImage, source.pureImages]] as const) {
          const wanted = (many?.length ? many : one ? [one] : []).map((p) => p.replace(/^\//, ""));
          const got = (images.get(option.id) ?? []).filter((i) => i.variant === variant).map((i) => i.storage_key);
          if (JSON.stringify(wanted) !== JSON.stringify(got)) bad.image += 1;
        }
      }
    }
    expect(options).toBe(110);
    expect(textChecks).toBe(1100);
    expect(bad).toEqual({ tagline: 0, text: 0, trait: 0, image: 0 });
  });
});

describe("text of products, shapes and categories", () => {
  it("product titles and descriptions match what the product page shows", async () => {
    const stored = new Map((await rows<{ product_id: number; locale: string; title: string; description: string | null }>(`select product_id, locale, title, description from product_i18n`)).map((r) => [`${r.product_id}|${r.locale}`, r]));
    const bad: string[] = [];
    for (const product of products()) {
      const sub = product.source;
      for (const locale of LOCALES) {
        const title = locale === "vi" ? sub.titleVi : locale === "en" ? sub.titleEn : (localizedText(sub, "title", "suffixed", locale) ?? translated(seeded.src.translations.ITEM_NAMES, sub.id, locale));
        const description = locale === "vi" ? sub.descriptionVi : locale === "en" ? sub.descriptionEn : (localizedText(sub, "description", "suffixed", locale) ?? translated(seeded.src.translations.ITEM_DESCS, sub.id, locale));
        const row = stored.get(`${product.id}|${locale}`);
        if ((row?.title ?? null) !== (title ?? null) || (row?.description ?? null) !== (orNull(description) ?? null)) bad.push(`${product.key} ${locale}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("shape names, descriptions and badges match", async () => {
    const stored = new Map((await rows<{ shape_id: number; locale: string; name: string; description: string | null; badge: string | null }>(`select shape_id, locale, name, description, badge from shape_i18n`)).map((r) => [`${r.shape_id}|${r.locale}`, r]));
    const { translations } = seeded.src;
    const bad: string[] = [];
    let checked = 0;
    for (const product of products()) {
      for (const shape of product.shapes) {
        const source = shape.source;
        for (const locale of LOCALES) {
          const name = locale === "vi" ? source.nameVi : locale === "en" ? source.nameEn : localizedText(source, "name", "suffixed", locale);
          if (name == null) continue;
          checked += 1;
          const description = locale === "vi" ? source.descriptionVi : locale === "en" ? source.descriptionEn : (localizedText(source, "description", "suffixed", locale) ?? translated(translations.SHAPE_DESCS, source.id, locale));
          const badge = locale === "vi" ? source.badgeVi : locale === "en" ? source.badgeEn : translated(translations.BADGE_TRANSLATIONS, source.badgeVi ?? "", locale);
          const row = stored.get(`${shape.id}|${locale}`);
          if (row?.name !== name || (row?.description ?? null) !== (orNull(description) ?? null) || (row?.badge ?? null) !== (orNull(badge) ?? null)) bad.push(`${product.key}/${source.id} ${locale}`);
        }
      }
    }
    expect(checked).toBeGreaterThan(300);
    expect(bad).toEqual([]);
  });

  it("category names match in every language they have", async () => {
    const stored = new Map((await rows<{ category_id: string; locale: string; name: string }>(`select category_id, locale, name from category_i18n`)).map((r) => [`${r.category_id}|${r.locale}`, r.name]));
    const bad: string[] = [];
    for (const category of seeded.src.categories) {
      for (const locale of LOCALES) {
        const name = locale === "vi" ? category.nameVi : locale === "en" ? category.nameEn : translated(seeded.src.translations.CATEGORY_NAMES, category.id, locale);
        if ((stored.get(`${category.id}|${locale}`) ?? null) !== (name ?? null)) bad.push(`${category.id} ${locale}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("sizes and spec lists", () => {
  // BY CONSTRUCTION: the rows were generated by these very calls, so this only proves the storing, de-duplicating and
  // parsing lose nothing in the canonical context (the Vietnamese product / shape name, no material).
  it("reproduce the canonical context for every product and shape", () => {
    const { src } = seeded;
    let checked = 0;
    const bad: string[] = [];
    for (const product of products()) {
      const sub = product.source;
      for (const shape of [null, ...product.shapes]) {
        const name = shape ? shape.source.nameVi : sub.titleVi;
        for (const locale of LOCALES) {
          checked += 1;
          if (JSON.stringify(src.sizes(name, locale, sub.id, shape?.source.id, sub.categoryId)) !== JSON.stringify(readback.sizes(product, shape, locale))) bad.push(`sizes ${product.key}/${shape?.source.id ?? ""} ${locale}`);
          if (JSON.stringify(src.specs.finishing(name, "", locale, sub.id, shape?.source.id, sub.categoryId)) !== JSON.stringify(readback.specs(product, shape, "finishing", locale))) bad.push(`finishing ${product.key}/${shape?.source.id ?? ""} ${locale}`);
          if (JSON.stringify(src.specs.materials(name, "", locale, sub.id, shape?.source.id, sub.categoryId)) !== JSON.stringify(readback.specs(product, shape, "material_hint", locale))) bad.push(`materials ${product.key}/${shape?.source.id ?? ""} ${locale}`);
        }
      }
    }
    expect(checked).toBe(510);
    expect(bad).toEqual([]);
  });

  // NOT a pass/fail: the card's real calls (localized name, the option, the material slug as the shape on material
  // pages) sometimes answer differently from the database's one answer. These are the owner's decision (§8 item 1).
  it("measures how far today's card is from the single stored answer", () => {
    const measure = replayCardCalls(seeded.src, seeded.outcome.products.values(), readback);
    expect(measure).toEqual({ renders: 4045, sizeDifferences: 425, materialHintDifferences: 1942, finishingDifferences: 117, rendersWithAnyDifference: 2163, distinctWithAnyDifference: 2143 });
  });
});
