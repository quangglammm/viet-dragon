import * as schema from "@/lib/db/schema";
import type { ProductRecord, SeedContext } from "../context";
import { LOCALES } from "../localized";
import { linkedProductPaths, resolveSegment, segmentCandidates } from "../resolve";
import { KEBAB_SLUG } from "../util";

// Old and alternate URLs, kept as aliases so they keep resolving (an alias hit answers 308 to the canonical URL).
// URLs are per language, and every old URL worked in every language, so each alias is seeded in all of them. In
// the languages whose slug differs from today's (English, and zh/ja/ko which copy it), today's slug is itself an alias.

/**
 * Product-level aliases: SUBGROUP_ALIASES plus the cross-category fallback of `getSubgroupById`, and each product's own
 * old slug. Seeded: the alternate slugs inside the product's own category, and any cross-category URL the source
 * actually links to. The other cross-category fallbacks are synthetic permutations nothing links to
 * (`/products/office/lich-tet` showing a Tet product); seeding them would reserve ~150 slugs for nothing, so they stop
 * resolving — owner decision. A slug that is already some product's canonical slug in that language is never an alias.
 */
export async function seedProductAliases(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<void> {
  const { tx, src, notes, stats } = ctx;
  const linked = linkedProductPaths(src);
  const candidateIds = new Set([...src.subgroups.map((s) => s.id), ...Object.keys(src.subgroupAliases)]);

  const taken = new Map<string, Set<string>>(); // "<language>|<category>" → slugs in use
  const takenIn = (locale: string, category: string): Set<string> => taken.get(`${locale}|${category}`) ?? taken.set(`${locale}|${category}`, new Set()).get(`${locale}|${category}`)!;
  for (const product of products.values()) for (const locale of LOCALES) takenIn(locale, product.source.categoryId).add(product.slugs[locale]);

  const rows: (typeof schema.productSlug.$inferInsert)[] = [];
  for (const category of src.categories) {
    for (const id of candidateIds) {
      const target = src.getSubgroupById(id, category.id);
      if (!target) continue;
      if (target.categoryId !== category.id && !linked.has(`${category.id}/${id}`)) {
        stats.droppedCrossCategoryAliases.push(`/products/${category.id}/${id} → ${target.categoryId}/${target.id}`);
        continue;
      }
      if (!KEBAB_SLUG.test(id)) {
        notes.add("alias-invalid", `${category.id}/${id}`);
        continue;
      }
      const productId = products.get(`${target.categoryId}/${target.id}`)!.id;
      for (const locale of LOCALES) {
        if (takenIn(locale, category.id).has(id)) continue;
        takenIn(locale, category.id).add(id);
        rows.push({ locale, categoryId: category.id, slug: id, productId, isCanonical: false });
      }
    }
  }
  if (rows.length > 0) await tx.insert(schema.productSlug).values(rows);
  stats.productAliasRows = rows.length;
}

/**
 * Shape / option aliases: every candidate segment is run through the page's own resolver; whatever it accepts today
 * and is not already a canonical slug becomes an alias of the row it lands on — in every language.
 */
export async function seedSegmentAliases(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<void> {
  const { tx, src, notes, stats } = ctx;
  for (const product of products.values()) {
    const rows: (typeof schema.productSegment.$inferInsert)[] = [];
    for (const segment of segmentCandidates(src, product)) {
      const resolution = resolveSegment(src, product, segment);
      if (!resolution) continue;
      if (!KEBAB_SLUG.test(segment)) {
        notes.add("alias-invalid", segment);
        continue;
      }
      for (const locale of LOCALES) {
        if (product.takenSegments[locale].has(segment)) continue;
        product.takenSegments[locale].add(segment);
        rows.push({
          productId: product.id,
          locale,
          slug: segment,
          shapeId: resolution.kind === "shape" ? resolution.shape.id : null,
          optionId: resolution.kind === "option" ? resolution.option.id : null,
          isCanonical: false,
        });
      }
    }
    if (rows.length > 0) await tx.insert(schema.productSegment).values(rows);
    stats.segmentAliasRows += rows.length;
  }
}
