import { and, eq, inArray, sql } from "drizzle-orm";
import { composeEntity } from "@/lib/content/compose";
import { writeRevision } from "@/lib/content/revision";
import { documentIdentity, parseDocument } from "@/lib/content/schemas";
import type { DraftEntityType } from "@/lib/db/content/drafts";
import * as schema from "@/lib/db/schema";
import type { ProductRecord, SeedContext } from "../context";
import { BULLET_SUGGESTIONS, SUGGESTED_LOCALES, SUGGESTION_COMMENT, TRAIT_SUGGESTIONS } from "../suggested-translations";

// Chinese, Japanese and Korean text the site never had: the trait glossary, and three Tet-flyer options whose
// "best for" list is one summarizing line. Applied AFTER revision 1 is written, as revision 2 of each affected entity,
// so the history shows exactly what was machine-suggested and restoring revision 1 brings the original data back.

async function recordRevision(ctx: SeedContext, type: DraftEntityType, id: string): Promise<void> {
  const composed = await composeEntity(ctx.tx, type, id);
  if (!composed) throw new Error(`${type} ${id} cannot be composed after its suggested translations`);
  const parsed = parseDocument(type, composed.document);
  if (!parsed.success) {
    const first = parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`The ${type} ${id} does not satisfy its document schema after the suggested translations — ${first.join(" | ")}`);
  }
  await writeRevision(ctx.tx, {
    entityType: type,
    identity: documentIdentity(type, parsed.data as { uid?: string; key?: string }),
    version: composed.version,
    action: "update",
    snapshot: parsed.data,
    comment: SUGGESTION_COMMENT,
  });
}

async function suggestTraits(ctx: SeedContext): Promise<number> {
  const { tx } = ctx;
  for (const [key, byLocale] of Object.entries(TRAIT_SUGGESTIONS)) {
    await tx.insert(schema.traitI18n).values(SUGGESTED_LOCALES.map((locale) => ({ traitKey: key, locale, label: byLocale[locale].label, description: byLocale[locale].description })));
    await tx.update(schema.trait).set({ version: sql`${schema.trait.version} + 1`, updatedAt: sql`now()` }).where(eq(schema.trait.key, key));
    await recordRevision(ctx, "trait", key);
  }
  return Object.keys(TRAIT_SUGGESTIONS).length;
}

async function suggestBullets(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<number> {
  const { tx } = ctx;
  const changed = new Set<ProductRecord>();
  for (const suggestion of BULLET_SUGGESTIONS) {
    const product = products.get(suggestion.product);
    // Only an option that still has ONE zh/ja/ko line where Vietnamese has as many as the suggestions (a same-named option that legitimately
    // has a single bullet in every language is left alone). If the source was fixed meanwhile, there is nothing to replace.
    const options = product?.options.filter((o) => o.source.nameVi === suggestion.optionNameVi && o.source.bestForZh?.length === 1 && o.source.bestForVi.length === suggestion.bestFor.zh.length) ?? [];
    if (!product || options.length === 0) throw new Error(`Suggested bullets for "${suggestion.optionNameVi}" (${suggestion.product}) match no option with a single zh/ja/ko line — update suggested-translations.ts`);
    for (const option of options) {
      const bullets = await tx
        .select({ id: schema.optionBullet.id, position: schema.optionBullet.position })
        .from(schema.optionBullet)
        .where(and(eq(schema.optionBullet.optionId, option.id), eq(schema.optionBullet.kind, "best_for")));
      bullets.sort((a, b) => a.position - b.position);
      if (bullets.length !== suggestion.bestFor.zh.length) throw new Error(`"${suggestion.optionNameVi}" has ${bullets.length} best-for bullets, the suggestions have ${suggestion.bestFor.zh.length}`);
      const ids = bullets.map((b) => b.id);
      await tx.delete(schema.optionBulletI18n).where(and(inArray(schema.optionBulletI18n.bulletId, ids), inArray(schema.optionBulletI18n.locale, [...SUGGESTED_LOCALES])));
      await tx.insert(schema.optionBulletI18n).values(
        bullets.flatMap((bullet, index) => SUGGESTED_LOCALES.map((locale) => ({ bulletId: bullet.id, locale, text: suggestion.bestFor[locale][index] }))),
      );
      changed.add(product);
    }
  }
  for (const product of changed) {
    await tx.update(schema.product).set({ version: sql`${schema.product.version} + 1`, updatedAt: sql`now()` }).where(eq(schema.product.id, product.id));
    await recordRevision(ctx, "product", product.uid);
  }
  return changed.size;
}

/** Applies the suggestions; resolves with how many entities got a revision 2. */
export async function seedSuggestedTranslations(ctx: SeedContext, products: Map<string, ProductRecord>): Promise<number> {
  return (await suggestTraits(ctx)) + (await suggestBullets(ctx, products));
}
