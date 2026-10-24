import type { ProductOption } from "@/data/categories";
import type { ShapeItem } from "@/data/subgroups-catalog";
import * as schema from "@/lib/db/schema";
import { isIconName } from "@/lib/icons";
import type { MaterialRecord, OptionModel, SeedContext } from "../context";
import { LOCALES, localizedText, type Locale } from "../localized";
import { formatMaterialDisplayName } from "../material-name";
import { bump, isBlankText, majority, slugify, uniqueSlug } from "../util";

// The "stock" (Giấy loại C, PP film…) is a library entity shared by the products that offer it. Today every option
// copies the stock's name and drifts (docs/data-model.md §2 finding 1); the seed finds the distinct stocks by
// the name the card DISPLAYS, and keeps each option's own raw name separately (steps/options.ts).

interface Stock {
  names: Record<Locale, Map<string, number>>;
  icons: Map<string, number>;
  firstVietnameseName: string;
}

const NO_ICON = "";
const normalizedStockKey = (name: string): string => formatMaterialDisplayName(name, "vi").trim().toLowerCase().replace(/\s+/g, " ");
const emptyNames = (): Record<Locale, Map<string, number>> => Object.fromEntries(LOCALES.map((locale) => [locale, new Map<string, number>()])) as Record<Locale, Map<string, number>>;

/** Every option row of the source, in catalog order, with the scope (product or one shape) it is listed in. */
function collectOptionModels(sources: SeedContext["src"]): { stocks: Map<string, Stock>; models: OptionModel[] } {
  const stocks = new Map<string, Stock>();
  const models: OptionModel[] = [];
  for (const subgroup of sources.subgroups) {
    const productKey = `${subgroup.categoryId}/${subgroup.id}`;
    const scopes: [ShapeItem | null, ProductOption[]][] = [
      [null, subgroup.materials],
      ...subgroup.shapes.flatMap((shape): [ShapeItem, ProductOption[]][] => (shape.materials?.length ? [[shape, shape.materials]] : [])),
    ];
    for (const [shape, list] of scopes) {
      list.forEach((source, index) => {
        const materialKey = normalizedStockKey(source.nameVi);
        const stock = stocks.get(materialKey) ?? stocks.set(materialKey, { names: emptyNames(), icons: new Map(), firstVietnameseName: formatMaterialDisplayName(source.nameVi, "vi") }).get(materialKey)!;
        for (const locale of LOCALES) {
          const raw = localizedText(source, "name", "option", locale);
          if (!isBlankText(raw)) bump(stock.names[locale], formatMaterialDisplayName(raw as string, locale).trim());
        }
        bump(stock.icons, source.icon ?? NO_ICON);
        models.push({ productKey, shape, index, source, materialKey });
      });
    }
  }
  return { stocks, models };
}

export async function seedMaterials({ tx, src, notes }: SeedContext): Promise<{ materials: Map<string, MaterialRecord>; models: OptionModel[] }> {
  const { stocks, models } = collectOptionModels(src);
  const materials = new Map<string, MaterialRecord>();
  const usedSlugs = new Set<string>();
  for (const [key, stock] of stocks) {
    const slug = uniqueSlug(slugify(stock.firstVietnameseName), usedSlugs);
    const topIcon = majority(stock.icons).value;
    const icon = topIcon !== NO_ICON && isIconName(topIcon) ? topIcon : null;
    if (topIcon !== NO_ICON && !icon) notes.add("icon-unknown", `${stock.firstVietnameseName}: ${topIcon}`);
    const [row] = await tx.insert(schema.material).values({ slug, icon }).returning({ id: schema.material.id });

    const names: Partial<Record<Locale, string>> = {};
    const i18n: (typeof schema.materialI18n.$inferInsert)[] = [];
    for (const locale of LOCALES) {
      if (stock.names[locale].size === 0) continue;
      const { value, distinct } = majority(stock.names[locale]);
      names[locale] = value;
      i18n.push({ materialId: row.id, locale, name: value });
      if (distinct > 1) notes.add("material-name-conflict", `${stock.firstVietnameseName} [${locale}] → ${[...stock.names[locale].keys()].join(" | ")}`);
    }
    await tx.insert(schema.materialI18n).values(i18n);
    materials.set(key, { id: row.id, slug, icon, names });
  }
  return { materials, models };
}
