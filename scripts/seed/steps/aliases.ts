import * as schema from "@/lib/db/schema";
import type { ProductRecord, SeedContext } from "../context";
import { linkedProductPaths, resolveSegment, segmentCandidates } from "../resolve";
import { KEBAB_SLUG } from "../util";

// Old and alternate URLs, kept as aliases so they keep resolving (an alias hit answers 308 to the canonical URL).

/**
 * Product-level aliases: SUBGROUP_ALIASES plus the cross-category fallback of `getSubgroupById`. Seeded: the
 * alternate slugs inside the product's own category, and any cross-category URL the source actually links to. The
 * other cross-category fallbacks are synthetic permutations nothing links to (`/products/office/lich-tet` showing a
 * Tet product); seeding them would reserve ~150 slugs for nothing, so they stop resolving — owner decision 9.
 */
export async function seedProductAliases(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<void> {
  const { tx, src, notes, stats } = ctx;
  const linked = linkedProductPaths(src);
  const candidateIds = new Set([...src.subgroups.map((s) => s.id), ...Object.keys(src.subgroupAliases)]);
  const rows: (typeof schema.productSlug.$inferInsert)[] = [];
  for (const category of src.categories) {
    for (const id of candidateIds) {
      const target = src.getSubgroupById(id, category.id);
      if (!target || (target.categoryId === category.id && target.id === id)) continue; // absent, or the canonical URL itself
      if (target.categoryId !== category.id && !linked.has(`${category.id}/${id}`)) {
        stats.droppedCrossCategoryAliases.push(`/products/${category.id}/${id} → ${target.categoryId}/${target.id}`);
        continue;
      }
      if (!KEBAB_SLUG.test(id)) {
        notes.add("alias-invalid", `${category.id}/${id}`);
        continue;
      }
      rows.push({ categoryId: category.id, slug: id, productId: products.get(`${target.categoryId}/${target.id}`)!.id, isCanonical: false });
    }
  }
  if (rows.length > 0) await tx.insert(schema.productSlug).values(rows);
  stats.productAliasRows = rows.length;
}

/**
 * Shape / option aliases: every candidate segment is run through the page's own resolver; whatever it accepts today
 * and is not already a canonical slug becomes an alias of the row it lands on.
 */
export async function seedSegmentAliases(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<void> {
  const { tx, src, notes, stats } = ctx;
  for (const product of products.values()) {
    const rows: (typeof schema.productSegment.$inferInsert)[] = [];
    for (const segment of segmentCandidates(src, product)) {
      const resolution = resolveSegment(src, product, segment);
      if (!resolution || product.takenSegments.has(segment)) continue;
      if (!KEBAB_SLUG.test(segment)) {
        notes.add("alias-invalid", segment);
        continue;
      }
      const shape = resolution.kind === "shape" ? product.shapes.find((s) => s.slug === resolution.slug) : undefined;
      const option = resolution.kind === "option" ? product.options.find((o) => o.slug === resolution.slug) : undefined;
      rows.push({ productId: product.id, slug: segment, shapeId: shape?.id ?? null, optionId: option?.id ?? null, isCanonical: false });
      product.takenSegments.add(segment);
    }
    if (rows.length > 0) await tx.insert(schema.productSegment).values(rows);
    stats.segmentAliasRows += rows.length;
  }
}
