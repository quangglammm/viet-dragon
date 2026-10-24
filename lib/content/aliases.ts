import { and, eq, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import { composeProduct } from "./compose/product";
import { Invalid, NotFound } from "./errors";
import { writeRevision } from "./revision";
import type { LocaleCode } from "./schemas";

// A publish never drops an old URL (restoring an old revision must not lose newer ones). Letting one go is a deliberate act
// of its own, per language: this. Canonical URLs cannot be released.

export interface ReleaseAliasInput {
  productUid: string;
  locale: LocaleCode;
  slug: string;
  /** Present for the product's own URL (`/<category>/<slug>`); absent for a shape / option segment. */
  category?: string;
  author: string | null;
}

export async function releaseAlias(db: Db, input: ReleaseAliasInput): Promise<{ version: number }> {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .select({ id: schema.product.id, version: schema.product.version })
      .from(schema.product)
      .where(eq(schema.product.uid, input.productUid))
      .for("no key update");
    if (!product) throw new NotFound("Không tìm thấy sản phẩm.");

    const removed =
      input.category === undefined
        ? await tx
            .delete(schema.productSegment)
            .where(and(eq(schema.productSegment.productId, product.id), eq(schema.productSegment.locale, input.locale), eq(schema.productSegment.slug, input.slug), eq(schema.productSegment.isCanonical, false)))
            .returning({ slug: schema.productSegment.slug })
        : await tx
            .delete(schema.productSlug)
            .where(and(eq(schema.productSlug.productId, product.id), eq(schema.productSlug.locale, input.locale), eq(schema.productSlug.categoryId, input.category), eq(schema.productSlug.slug, input.slug), eq(schema.productSlug.isCanonical, false)))
            .returning({ slug: schema.productSlug.slug });
    if (removed.length === 0) {
      throw new Invalid([{ path: "slug", message: `«${input.slug}» không phải đường dẫn cũ của sản phẩm này (đường dẫn chính không thể gỡ).` }]);
    }

    const version = product.version + 1;
    await tx.update(schema.product).set({ version, updatedAt: sql`now()`, updatedBy: input.author }).where(eq(schema.product.id, product.id));
    const stored = await composeProduct(tx, input.productUid);
    if (!stored) throw new Error(`product ${input.productUid} cannot be read back`);
    await writeRevision(tx, {
      entityType: "product",
      identity: { entityUid: input.productUid, entityKey: null },
      version,
      action: "update",
      snapshot: stored.document,
      comment: `Gỡ đường dẫn cũ «${input.slug}» (${input.locale})`,
      author: input.author,
    });
    return { version };
  });
}
