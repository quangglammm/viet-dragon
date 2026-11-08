import { eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { DbExecutor } from "@/lib/db/types";
import { pickLocale } from "@/lib/locale";
import type { SizeItem } from "@/scripts/seed/legacy/product-sizes";
import type { ProductRecord, ShapeRecord } from "./context";
import { LOCALES, localizedText, type Locale } from "./localized";
import { formatMaterialDisplayName } from "./material-name";
import type { Sources } from "./sources";
import { BASE_LABEL, TIERS } from "./steps/sizes-specs";
import { groupBy } from "./util";

// Reading sizes and spec lists back out of the database in the shape the site's code returns them, and measuring
// how far the database's ONE answer per product / shape is from what the product card computes today.

type SpecKind = "finishing" | "material_hint";

export interface SizeSpecReadback {
  sizes: (product: ProductRecord, shape: ShapeRecord | null, locale: Locale) => SizeItem[];
  specs: (product: ProductRecord, shape: ShapeRecord | null, kind: SpecKind, locale: Locale) => string[];
}

const scopeKey = (productId: number, shapeId: number | null): string => `${productId}|${shapeId ?? ""}`;
const centimetres = (millimetres: number): string => (millimetres / 10).toString();

export async function readSizesAndSpecs(x: DbExecutor): Promise<SizeSpecReadback> {
  const sizeRows = await x.select().from(schema.sizeOption);
  const notes = await x.select().from(schema.sizeOptionI18n);
  const notesBySize = groupBy(notes, (n) => n.sizeOptionId);
  const sizesByScope = groupBy(sizeRows, (z) => scopeKey(z.productId, z.shapeId));

  const specRows = await x
    .select({ productId: schema.productSpec.productId, shapeId: schema.productSpec.shapeId, kind: schema.specItem.kind, position: schema.productSpec.position, locale: schema.specItemI18n.locale, label: schema.specItemI18n.label })
    .from(schema.productSpec)
    .innerJoin(schema.specItem, eq(schema.specItem.id, schema.productSpec.specItemId))
    .innerJoin(schema.specItemI18n, eq(schema.specItemI18n.specItemId, schema.specItem.id));
  const specsByScope = groupBy(specRows, (r) => `${scopeKey(r.productId, r.shapeId)}|${r.kind}|${r.locale}`);

  return {
    sizes: (product, shape, locale) => {
      // A shape's own rows win; otherwise the product's.
      const rows = (shape && sizesByScope.get(scopeKey(product.id, shape.id))) || sizesByScope.get(scopeKey(product.id, null)) || [];
      return TIERS.flatMap((tier, index) => {
        const row = rows.find((r) => r.tier === tier);
        if (!row) return [];
        const note = notesBySize.get(row.id)?.find((n) => n.locale === locale)?.note;
        const dims = row.dimsText ?? `${centimetres(row.widthMm!)} x ${centimetres(row.heightMm!)}${row.depthMm ? ` x ${centimetres(row.depthMm)}` : ""} cm`;
        return [{ id: tier, label: note ? `${BASE_LABEL[locale][index]} (${note})` : BASE_LABEL[locale][index], dims }];
      });
    },
    specs: (product, shape, kind, locale) => {
      const pick = (shapeId: number | null) => specsByScope.get(`${scopeKey(product.id, shapeId)}|${kind}|${locale}`);
      const rows = (shape && pick(shape.id)) || pick(null) || [];
      return [...rows].sort((a, b) => a.position - b.position).map((r) => r.label);
    },
  };
}

export interface ReplayMeasure {
  renders: number;
  sizeDifferences: number;
  materialHintDifferences: number;
  finishingDifferences: number;
  rendersWithAnyDifference: number;
  /**
   * The same, counting options that share a Vietnamese name in one page context once (the original audit's key:
   * kind | product | shape | option name | language). 2,143 in the design document was this number set against `renders`.
   */
  distinctWithAnyDifference: number;
}

interface CardContext {
  kind: "product" | "shape" | "material-page";
  option: Sources["subgroups"][number]["materials"][number];
  shape: ShapeRecord | null;
  shapeId: string | undefined;
  productName: (locale: Locale) => string;
}

/**
 * Replays the product card's REAL calls (page × option × language): the name it passes is localized, it includes the
 * option, and on material pages the material slug stands in for the shape id. Counts the renders where today's code
 * answers differently from the database's single answer — a measure for the owner (docs/data-model.md §8 item 1),
 * not a pass/fail.
 */
export function replayCardCalls(src: Sources, products: Iterable<ProductRecord>, readback: SizeSpecReadback): ReplayMeasure {
  const optionName = (o: CardContext["option"], l: Locale) => pickLocale(l, o.nameVi, o.name, o.nameZh, o.nameJa, o.nameKo);
  const shapeName = (s: ShapeRecord["source"], l: Locale) => pickLocale(l, s.nameVi, s.nameEn, s.nameZh, s.nameJa, s.nameKo);
  const distinct = new Set<string>();
  const measure: ReplayMeasure = { renders: 0, sizeDifferences: 0, materialHintDifferences: 0, finishingDifferences: 0, rendersWithAnyDifference: 0, distinctWithAnyDifference: 0 };

  for (const product of products) {
    const sub = product.source;
    const title = (l: Locale) => pickLocale(l, sub.titleVi, sub.titleEn, localizedText(sub, "title", "suffixed", "zh"), localizedText(sub, "title", "suffixed", "ja"), localizedText(sub, "title", "suffixed", "ko"));
    const productPageTitle = (l: Locale) =>
      pickLocale(l, sub.titleVi, sub.titleEn, src.translations.ITEM_NAMES[sub.id]?.zh ?? sub.titleZh, src.translations.ITEM_NAMES[sub.id]?.ja ?? sub.titleJa, src.translations.ITEM_NAMES[sub.id]?.ko ?? sub.titleKo);
    const allOptions = [...sub.materials, ...sub.shapes.flatMap((s) => s.materials ?? [])];
    const contexts: CardContext[] = [];
    if (sub.shapes.length === 0) for (const option of sub.materials) contexts.push({ kind: "product", option, shape: null, shapeId: undefined, productName: productPageTitle });
    for (const shape of product.shapes) {
      for (const option of shape.source.materials?.length ? shape.source.materials : sub.materials) {
        contexts.push({ kind: "shape", option, shape, shapeId: shape.source.id, productName: (l) => `${shapeName(shape.source, l)} - ${optionName(option, l)}` });
      }
    }
    const shapeIds = new Set(sub.shapes.map((s) => s.id));
    for (const material of allOptions) {
      const segment = src.toSlug(material.nameVi);
      if (shapeIds.has(segment)) continue;
      for (const option of sub.materials.length ? sub.materials : allOptions) {
        contexts.push({ kind: "material-page", option, shape: null, shapeId: segment, productName: (l) => `${title(l)} - ${optionName(option, l)}` });
      }
    }
    for (const context of contexts) {
      for (const locale of LOCALES) {
        measure.renders += 1;
        const name = context.productName(locale);
        const current = formatMaterialDisplayName(optionName(context.option, locale), locale);
        const sizes = JSON.stringify(src.sizes(name, locale, sub.id, context.shapeId, sub.categoryId)) !== JSON.stringify(readback.sizes(product, context.shape, locale));
        const materials = JSON.stringify(src.specs.materials(name, current, locale, sub.id, context.shapeId, sub.categoryId)) !== JSON.stringify(readback.specs(product, context.shape, "material_hint", locale));
        const finishing = JSON.stringify(src.specs.finishing(name, current, locale, sub.id, context.shapeId, sub.categoryId)) !== JSON.stringify(readback.specs(product, context.shape, "finishing", locale));
        measure.sizeDifferences += Number(sizes);
        measure.materialHintDifferences += Number(materials);
        measure.finishingDifferences += Number(finishing);
        measure.rendersWithAnyDifference += Number(sizes || materials || finishing);
        if (sizes || materials || finishing) distinct.add(`${context.kind}|${product.key}|${context.shapeId}|${context.option.nameVi}|${locale}`);
      }
    }
  }
  measure.distinctWithAnyDifference = distinct.size;
  return measure;
}

