import { asc, eq } from "drizzle-orm";
import type { DbExecutor } from "@/lib/db/types";
import * as schema from "@/lib/db/schema";
import { DOCUMENT_SCHEMA, type ProductDocument } from "../schemas";
import { byText, coverMedia, everyLocale, groupByKey, i18nMap, imageMedia, ogMedia, optional, seoOf, type Composed, type LocaleCode } from "./shared";

// Rows → the product document: the product with its shapes, options (bullets, photos), sizes and specs.
// Own children refer to each other by uid, library records and media by immutable key.

const TIER_ORDER = { large: 0, medium: 1, small: 2 } as const;
const BULLET_ORDER = { feature: 0, best_for: 1 } as const;

type SegmentRow = { locale: string; slug: string; isCanonical: boolean; shapeUid: string | null; optionUid: string | null };
type Slugs<A> = Record<LocaleCode, { slug: string; aliases: A[] }>;

/** The canonical URL segment and the aliases of each shape / option in each language, by uid. */
function segmentsByUid(rows: readonly SegmentRow[], key: "shapeUid" | "optionUid"): Map<string, Slugs<string>> {
  const result = new Map<string, Slugs<string>>();
  for (const [uid, group] of groupByKey(rows.filter((r) => r[key] !== null), (r) => r[key] as string)) {
    result.set(uid, everyLocale((locale) => {
      const inLanguage = group.filter((r) => r.locale === locale);
      return { slug: inLanguage.find((r) => r.isCanonical)?.slug ?? "", aliases: inLanguage.filter((r) => !r.isCanonical).map((r) => r.slug).sort(byText) };
    }));
  }
  return result;
}

const MISSING_SLUGS = everyLocale(() => ({ slug: "", aliases: [] as string[] }));

export async function composeProduct(x: DbExecutor, uid: string): Promise<Composed<ProductDocument> | null> {
  const [head] = await x
    .select({
      id: schema.product.id,
      categoryId: schema.product.categoryId,
      position: schema.product.position,
      status: schema.product.status,
      version: schema.product.version,
      cover: coverMedia.storageKey,
      ogImage: ogMedia.storageKey,
    })
    .from(schema.product)
    .leftJoin(coverMedia, eq(coverMedia.id, schema.product.coverMediaId))
    .leftJoin(ogMedia, eq(ogMedia.id, schema.product.ogMediaId))
    .where(eq(schema.product.uid, uid));
  if (!head) return null;
  const productId = head.id;

  const slugs = await x.select().from(schema.productSlug).where(eq(schema.productSlug.productId, productId));
  const productTexts = await x.select().from(schema.productI18n).where(eq(schema.productI18n.productId, productId));
  const segmentRows = await x
    .select({ locale: schema.productSegment.locale, slug: schema.productSegment.slug, isCanonical: schema.productSegment.isCanonical, shapeUid: schema.shape.uid, optionUid: schema.option.uid })
    .from(schema.productSegment)
    .leftJoin(schema.shape, eq(schema.shape.id, schema.productSegment.shapeId))
    .leftJoin(schema.option, eq(schema.option.id, schema.productSegment.optionId))
    .where(eq(schema.productSegment.productId, productId));
  const shapeRows = await x
    .select({ id: schema.shape.id, uid: schema.shape.uid, position: schema.shape.position, image: imageMedia.storageKey, ogImage: ogMedia.storageKey })
    .from(schema.shape)
    .leftJoin(imageMedia, eq(imageMedia.id, schema.shape.imageMediaId))
    .leftJoin(ogMedia, eq(ogMedia.id, schema.shape.ogMediaId))
    .where(eq(schema.shape.productId, productId));
  const shapeTexts = await x
    .select({ shapeId: schema.shapeI18n.shapeId, locale: schema.shapeI18n.locale, name: schema.shapeI18n.name, description: schema.shapeI18n.description, badge: schema.shapeI18n.badge, seoTitle: schema.shapeI18n.seoTitle, seoDescription: schema.shapeI18n.seoDescription })
    .from(schema.shapeI18n)
    .innerJoin(schema.shape, eq(schema.shape.id, schema.shapeI18n.shapeId))
    .where(eq(schema.shape.productId, productId));
  const optionRows = await x
    .select({
      id: schema.option.id, uid: schema.option.uid, shapeId: schema.option.shapeId, material: schema.material.slug, position: schema.option.position, icon: schema.option.icon,
      hideFoil: schema.option.hideFoil, hideDoubleSided: schema.option.hideDoubleSided, basePrice: schema.option.basePrice, doubleSidedPrice: schema.option.doubleSidedPrice,
      foilPrice: schema.option.foilPrice, foil2Price: schema.option.foil2Price, unitKey: schema.option.unitKey, ogImage: ogMedia.storageKey,
    })
    .from(schema.option)
    .innerJoin(schema.material, eq(schema.material.id, schema.option.materialId))
    .leftJoin(ogMedia, eq(ogMedia.id, schema.option.ogMediaId))
    .where(eq(schema.option.productId, productId));
  const optionTexts = await x
    .select({ optionId: schema.optionI18n.optionId, locale: schema.optionI18n.locale, name: schema.optionI18n.name, cardTitle: schema.optionI18n.cardTitle, tagline: schema.optionI18n.tagline, seoTitle: schema.optionI18n.seoTitle, seoDescription: schema.optionI18n.seoDescription })
    .from(schema.optionI18n)
    .innerJoin(schema.option, eq(schema.option.id, schema.optionI18n.optionId))
    .where(eq(schema.option.productId, productId));
  const bulletRows = await x
    .select({ id: schema.optionBullet.id, optionId: schema.optionBullet.optionId, kind: schema.optionBullet.kind, position: schema.optionBullet.position, trait: schema.optionBullet.traitKey })
    .from(schema.optionBullet)
    .innerJoin(schema.option, eq(schema.option.id, schema.optionBullet.optionId))
    .where(eq(schema.option.productId, productId));
  const bulletTexts = await x
    .select({ bulletId: schema.optionBulletI18n.bulletId, locale: schema.optionBulletI18n.locale, text: schema.optionBulletI18n.text })
    .from(schema.optionBulletI18n)
    .innerJoin(schema.optionBullet, eq(schema.optionBullet.id, schema.optionBulletI18n.bulletId))
    .innerJoin(schema.option, eq(schema.option.id, schema.optionBullet.optionId))
    .where(eq(schema.option.productId, productId));
  const imageRows = await x
    .select({ optionId: schema.optionImage.optionId, variant: schema.optionImage.variant, position: schema.optionImage.position, key: imageMedia.storageKey })
    .from(schema.optionImage)
    .innerJoin(schema.option, eq(schema.option.id, schema.optionImage.optionId))
    .innerJoin(imageMedia, eq(imageMedia.id, schema.optionImage.mediaId))
    .where(eq(schema.option.productId, productId))
    .orderBy(asc(schema.optionImage.variant), asc(schema.optionImage.position));
  const sizeRows = await x.select().from(schema.sizeOption).where(eq(schema.sizeOption.productId, productId));
  const sizeTexts = await x
    .select({ sizeOptionId: schema.sizeOptionI18n.sizeOptionId, locale: schema.sizeOptionI18n.locale, note: schema.sizeOptionI18n.note })
    .from(schema.sizeOptionI18n)
    .innerJoin(schema.sizeOption, eq(schema.sizeOption.id, schema.sizeOptionI18n.sizeOptionId))
    .where(eq(schema.sizeOption.productId, productId));
  const specRows = await x
    .select({ shapeId: schema.productSpec.shapeId, kind: schema.specItem.kind, item: schema.specItem.key, position: schema.productSpec.position })
    .from(schema.productSpec)
    .innerJoin(schema.specItem, eq(schema.specItem.id, schema.productSpec.specItemId))
    .where(eq(schema.productSpec.productId, productId));

  const shapeSegments = segmentsByUid(segmentRows, "shapeUid");
  const optionSegments = segmentsByUid(segmentRows, "optionUid");
  const shapeUidById = new Map(shapeRows.map((s) => [s.id, s.uid]));
  const shapePositionByUid = new Map(shapeRows.map((s) => [s.uid, s.position]));
  const scopeRank = (shapeUid: string | null): number => (shapeUid === null ? -1 : (shapePositionByUid.get(shapeUid) ?? 0));

  const shapeTextsById = groupByKey(shapeTexts, (t) => t.shapeId);
  const shapes = shapeRows
    .map((s) => ({
      uid: s.uid,
      slugs: shapeSegments.get(s.uid) ?? MISSING_SLUGS,
      position: s.position,
      image: s.image,
      ogImage: s.ogImage,
      i18n: i18nMap(shapeTextsById.get(s.id) ?? [], (t) => ({ name: t.name, ...optional("description", t.description), ...optional("badge", t.badge), ...seoOf(t) })),
    }))
    .sort((a, b) => a.position - b.position || byText(a.slugs.vi.slug, b.slugs.vi.slug));

  const optionTextsById = groupByKey(optionTexts, (t) => t.optionId);
  const bulletsByOption = groupByKey(bulletRows, (b) => b.optionId);
  const bulletTextsById = groupByKey(bulletTexts, (t) => t.bulletId);
  const imagesByOption = groupByKey(imageRows, (i) => i.optionId);
  const options = optionRows
    .map((o) => ({
      uid: o.uid,
      slugs: optionSegments.get(o.uid) ?? MISSING_SLUGS,
      shape: o.shapeId === null ? null : (shapeUidById.get(o.shapeId) ?? null),
      material: o.material,
      position: o.position,
      icon: o.icon,
      hideFoil: o.hideFoil,
      hideDoubleSided: o.hideDoubleSided,
      prices: { base: o.basePrice, doubleSided: o.doubleSidedPrice, foil: o.foilPrice, foil2: o.foil2Price },
      unit: o.unitKey,
      ogImage: o.ogImage,
      i18n: i18nMap(optionTextsById.get(o.id) ?? [], (t) => ({ ...optional("name", t.name), ...optional("cardTitle", t.cardTitle), ...optional("tagline", t.tagline), ...seoOf(t) })),
      bullets: [...(bulletsByOption.get(o.id) ?? [])]
        .sort((a, b) => BULLET_ORDER[a.kind] - BULLET_ORDER[b.kind] || a.position - b.position)
        .map((b) => ({ kind: b.kind, position: b.position, trait: b.trait, i18n: i18nMap(bulletTextsById.get(b.id) ?? [], (t) => t.text) })),
      images: {
        default: (imagesByOption.get(o.id) ?? []).filter((i) => i.variant === "default").map((i) => i.key),
        pure: (imagesByOption.get(o.id) ?? []).filter((i) => i.variant === "pure").map((i) => i.key),
      },
    }))
    .sort((a, b) => scopeRank(a.shape) - scopeRank(b.shape) || a.position - b.position || byText(a.slugs.vi.slug, b.slugs.vi.slug));

  const sizeTextsById = groupByKey(sizeTexts, (t) => t.sizeOptionId);
  const sizes = sizeRows
    .map((z) => ({
      shape: z.shapeId === null ? null : (shapeUidById.get(z.shapeId) ?? null),
      tier: z.tier,
      w: z.widthMm,
      h: z.heightMm,
      d: z.depthMm,
      text: z.dimsText,
      i18n: i18nMap(sizeTextsById.get(z.id) ?? [], (t) => t.note),
    }))
    .sort((a, b) => scopeRank(a.shape) - scopeRank(b.shape) || byText(a.shape ?? "", b.shape ?? "") || TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);

  const specs = specRows
    .map((p) => ({ shape: p.shapeId === null ? null : (shapeUidById.get(p.shapeId) ?? null), kind: p.kind, item: p.item, position: p.position }))
    .sort((a, b) => scopeRank(a.shape) - scopeRank(b.shape) || byText(a.shape ?? "", b.shape ?? "") || byText(a.kind, b.kind) || a.position - b.position);

  const document: ProductDocument = {
    schema: DOCUMENT_SCHEMA,
    uid,
    category: head.categoryId,
    slugs: everyLocale((locale) => {
      const inLanguage = slugs.filter((s) => s.locale === locale);
      return {
        slug: inLanguage.find((s) => s.isCanonical)?.slug ?? "",
        aliases: inLanguage.filter((s) => !s.isCanonical).map((s) => ({ category: s.categoryId, slug: s.slug })).sort((a, b) => byText(a.category, b.category) || byText(a.slug, b.slug)),
      };
    }),
    status: head.status,
    position: head.position,
    cover: head.cover,
    ogImage: head.ogImage,
    i18n: i18nMap(productTexts, (t) => ({ title: t.title, ...optional("description", t.description), ...seoOf(t) })),
    shapes,
    options,
    sizes,
    specs,
  };
  return { document, version: head.version };
}
