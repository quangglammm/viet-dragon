import * as schema from "@/lib/db/schema";
import type { SizeItem } from "@/scripts/seed/legacy/product-sizes";
import type { ProductRecord, SeedContext, ShapeRecord } from "../context";
import { LOCALES, localizedText, type Locale } from "../localized";
import { parseDimensionsCm } from "../parse";
import { groupBy, isBlankText, slugify, uniqueSlug } from "../util";

// Sizes and spec lists are INFERRED today: lib/product-sizes.ts and lib/product-specs.ts match substrings of the
// product / shape name (in whatever language the page is shown in). The database keeps ONE answer per product and
// per shape, taken from the Vietnamese name. Where today's answer varies with the language or the option, the seed
// takes the Vietnamese one and counts the difference for the owner (docs/data-model.md §8 item 1).

export const TIERS = ["large", "medium", "small"] as const;
export const BASE_LABEL: Record<Locale, readonly [string, string, string]> = {
  vi: ["Lớn", "Vừa", "Nhỏ"],
  en: ["Large", "Medium", "Small"],
  zh: ["大号", "中号", "小号"],
  ja: ["大", "中", "小"],
  ko: ["대", "중", "소"],
};

const sizeSignature = (sizes: SizeItem[]): string => JSON.stringify(sizes.map((size) => `${size.id}:${size.dims}`));

async function storeSizes(ctx: SeedContext, product: ProductRecord, shape: ShapeRecord | null, name: string): Promise<void> {
  const { tx, src, notes } = ctx;
  const sub = product.source;
  const byLocale = Object.fromEntries(LOCALES.map((locale) => [locale, src.sizes(name, locale, sub.id, shape?.source.id, sub.categoryId)])) as Record<Locale, SizeItem[]>;
  for (const [t, tier] of TIERS.entries()) {
    const vi = byLocale.vi[t];
    const dims = parseDimensionsCm(vi.dims, (text) => notes.add("size-sub-mm", text));
    const [row] = await tx
      .insert(schema.sizeOption)
      .values({ productId: product.id, shapeId: shape?.id ?? null, tier, widthMm: dims?.w ?? null, heightMm: dims?.h ?? null, depthMm: dims?.d ?? null, dimsText: dims ? null : vi.dims })
      .returning({ id: schema.sizeOption.id });
    // The label is "<Large> (<note>)" in every language; the note is the only translated part worth storing.
    const notesRows: (typeof schema.sizeOptionI18n.$inferInsert)[] = [];
    for (const locale of LOCALES) {
      const label = byLocale[locale][t].label;
      const base = BASE_LABEL[locale][t];
      if (label === base) continue;
      const match = label.match(/^(.*?) \((.*)\)$/);
      if (match && match[1] === base) notesRows.push({ sizeOptionId: row.id, locale, note: match[2] });
      else notes.add("size-label-unparseable", `${locale}: ${label}`);
    }
    if (notesRows.length > 0) await tx.insert(schema.sizeOptionI18n).values(notesRows);
  }
}

export async function seedSizes(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<void> {
  const { src, stats } = ctx;
  for (const product of products.values()) {
    const sub = product.source;
    const allLanguages = (name: string, shapeId: string | undefined): string => JSON.stringify(LOCALES.map((locale) => src.sizes(name, locale, sub.id, shapeId, sub.categoryId)));
    const baseline = allLanguages(sub.titleVi, undefined);
    const productVaries = new Set(LOCALES.map((locale) => sizeSignature(src.sizes(localizedText(sub, "title", "suffixed", locale) ?? sub.titleEn, locale, sub.id, undefined, sub.categoryId)))).size > 1;
    if (productVaries) stats.sizeLanguageDependent.push(product.key);
    await storeSizes(ctx, product, null, sub.titleVi);
    for (const shape of product.shapes) {
      const source = shape.source;
      const varies = new Set(LOCALES.map((locale) => sizeSignature(src.sizes(localizedText(source, "name", "suffixed", locale) ?? source.nameEn, locale, sub.id, source.id, sub.categoryId)))).size > 1;
      if (varies) stats.sizeLanguageDependent.push(`${product.key}/${source.id}`);
      // A shape gets its own rows only when its answer (dimensions or any language's label) differs from the product's.
      if (allLanguages(source.nameVi, source.id) !== baseline) await storeSizes(ctx, product, shape, source.nameVi);
    }
  }
}

type SpecKind = "technique" | "finishing" | "material_hint";
type Tuple = readonly (string | undefined)[];
interface Assignment {
  product: ProductRecord;
  shape: ShapeRecord | null;
  kind: SpecKind;
  tupleKey: string;
  position: number;
}

const TUPLE_SEPARATOR = String.fromCharCode(0x1f);
const SPEC_KIND_LABEL: Record<SpecKind, string> = { technique: "công nghệ in", finishing: "hoàn thiện", material_hint: "chất liệu gợi ý" };
const SPEC_KINDS: readonly SpecKind[] = ["technique", "finishing", "material_hint"];

export async function seedSpecs(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<void> {
  const { tx, src, notes, stats } = ctx;
  // A spec item is identified by its full five-language tuple: the same Vietnamese phrase translated differently in
  // two lists becomes two items (owner decision 4).
  const registry = new Map<SpecKind, Map<string, Tuple>>(SPEC_KINDS.map((kind) => [kind, new Map()]));
  const register = (kind: SpecKind, tuple: Tuple): string => {
    const key = tuple.map((text) => text ?? "").join(TUPLE_SEPARATOR);
    if (!registry.get(kind)!.has(key)) registry.get(kind)!.set(key, tuple);
    return key;
  };
  const listFor = (kind: Exclude<SpecKind, "technique">, name: string, shapeId: string | undefined, product: ProductRecord): string[] => {
    const call = kind === "finishing" ? src.specs.finishing : src.specs.materials;
    const lists = LOCALES.map((locale) => call(name, "", locale, product.source.id, shapeId, product.source.categoryId));
    if (lists.some((list) => list.length !== lists[0].length)) notes.add("spec-length-differs-by-locale", `${product.key} (${SPEC_KIND_LABEL[kind]})`);
    return lists[0].map((_, i) => register(kind, lists.map((list) => list[i])));
  };

  const assignments: Assignment[] = [];
  const techniques = src.specs.techniques.vi.map((_, i) => register("technique", LOCALES.map((locale) => src.specs.techniques[locale][i])));
  for (const product of products.values()) {
    const sub = product.source;
    techniques.forEach((tupleKey, position) => assignments.push({ product, shape: null, kind: "technique", tupleKey, position }));
    for (const kind of ["finishing", "material_hint"] as const) {
      const productKeys = listFor(kind, sub.titleVi, undefined, product);
      productKeys.forEach((tupleKey, position) => assignments.push({ product, shape: null, kind, tupleKey, position }));
      for (const shape of product.shapes) {
        const shapeKeys = listFor(kind, shape.source.nameVi, shape.source.id, product);
        if (JSON.stringify(shapeKeys) !== JSON.stringify(productKeys)) shapeKeys.forEach((tupleKey, position) => assignments.push({ product, shape, kind, tupleKey, position }));
      }
      const call = kind === "finishing" ? src.specs.finishing : src.specs.materials;
      const varies = new Set(LOCALES.map((locale) => JSON.stringify(call(localizedText(sub, "title", "suffixed", locale) ?? sub.titleEn, "", "vi", sub.id, undefined, sub.categoryId)))).size > 1;
      if (varies) stats.specLanguageDependent.push(`${product.key} ${kind}`);
    }
  }

  const itemIds = new Map<string, number>();
  for (const kind of SPEC_KINDS) {
    const usedKeys = new Set<string>();
    const sameVietnamese = groupBy([...registry.get(kind)!.values()], (tuple) => tuple[0] ?? "");
    for (const [vietnamese, tuples] of sameVietnamese) if (tuples.length > 1) notes.add("spec-same-vi-different-translation", `${SPEC_KIND_LABEL[kind]}: ${vietnamese}`);
    for (const [tupleKey, tuple] of registry.get(kind)!) {
      const [row] = await tx
        .insert(schema.specItem)
        .values({ kind, key: uniqueSlug(slugify(tuple[0] ?? ""), usedKeys), isDefault: kind === "technique" })
        .returning({ id: schema.specItem.id });
      itemIds.set(`${kind}|${tupleKey}`, row.id);
      const labels = LOCALES.flatMap((locale, i) => (isBlankText(tuple[i]) ? [] : [{ specItemId: row.id, locale, label: tuple[i] as string }]));
      await tx.insert(schema.specItemI18n).values(labels);
    }
  }
  if (assignments.length > 0) {
    await tx.insert(schema.productSpec).values(
      assignments.map((a) => ({ productId: a.product.id, shapeId: a.shape?.id ?? null, specItemId: itemIds.get(`${a.kind}|${a.tupleKey}`)!, position: a.position })),
    );
  }
  stats.specAssignments = assignments.length;
}
