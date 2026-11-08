import { and, asc, eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { VocabOption, Vocabulary } from "./editor/vocabulary";
import type { DbExecutor } from "@/lib/db/types";
import { listSummaries } from "./summaries";

/** What a list is narrowed to: a menu picks among the products of its own category, and among their shapes and options. */
export interface VocabularyScope {
  category?: string;
}

const VI = "vi";

/** The published shapes and options of the category's products, in the order the product shows them. `value` is the uid a menu item stores. */
async function menuTargets(x: DbExecutor, category: string): Promise<Pick<Vocabulary, "shape" | "option">> {
  const shapes = await x
    .select({ uid: schema.shape.uid, name: schema.shapeI18n.name, product: schema.product.uid })
    .from(schema.shape)
    .innerJoin(schema.product, and(eq(schema.product.id, schema.shape.productId), eq(schema.product.categoryId, category)))
    .leftJoin(schema.shapeI18n, and(eq(schema.shapeI18n.shapeId, schema.shape.id), eq(schema.shapeI18n.locale, VI)))
    .orderBy(asc(schema.shape.productId), asc(schema.shape.position));
  const options = await x
    .select({ uid: schema.option.uid, name: schema.optionI18n.name, material: schema.materialI18n.name, product: schema.product.uid })
    .from(schema.option)
    .innerJoin(schema.product, and(eq(schema.product.id, schema.option.productId), eq(schema.product.categoryId, category)))
    .leftJoin(schema.optionI18n, and(eq(schema.optionI18n.optionId, schema.option.id), eq(schema.optionI18n.locale, VI)))
    .leftJoin(schema.materialI18n, and(eq(schema.materialI18n.materialId, schema.option.materialId), eq(schema.materialI18n.locale, VI)))
    .orderBy(asc(schema.option.productId), asc(schema.option.position));
  return {
    shape: shapes.map((row): VocabOption => ({ value: row.uid, label: row.name ?? row.uid, group: row.product })),
    option: options.map((row): VocabOption => ({ value: row.uid, label: row.name ?? row.material ?? row.uid, group: row.product })),
  };
}

/** The lists an editor picks from (categories, materials, units…), as options labelled in Vietnamese. */
export async function loadVocabulary(x: DbExecutor, kinds: readonly (keyof Vocabulary)[], scope: VocabularyScope = {}): Promise<Vocabulary> {
  const vocabulary: Vocabulary = {};
  for (const kind of kinds) {
    if (kind === "shape" || kind === "option") {
      if (scope.category !== undefined) Object.assign(vocabulary, await menuTargets(x, scope.category));
      continue;
    }
    const options: VocabOption[] = (await listSummaries(x, kind))
      .filter((row) => row.version !== null && (kind !== "product" || scope.category === undefined || row.group === scope.category))
      .map((row) => ({ value: row.ref.id, label: row.label ?? row.ref.id }))
      .sort((a, b) => a.label.localeCompare(b.label, "vi"));
    vocabulary[kind] = options;
  }
  return vocabulary;
}
