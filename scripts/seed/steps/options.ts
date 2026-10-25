import type { ProductOption } from "@/scripts/seed/legacy/categories";
import * as schema from "@/lib/db/schema";
import { isIconName } from "@/lib/icons";
import type { MaterialRecord, MediaRegistry, OptionModel, OptionRecord, ProductRecord, SeedContext } from "../context";
import { LOCALES, localizedList, localizedText, type Locale } from "../localized";
import { formatMaterialDisplayName } from "../material-name";
import { claimSlugs, type SlugsByLocale } from "../slugs";
import { KEBAB_SLUG, isBlankText, orNull, slugify } from "../util";

// One option row = one offer of a stock by a product, optionally only for one shape. Its name is kept exactly as
// authored (the page title, breadcrumb, alt text and lead message use it); `card_title` is stored only where the
// heading the card shows today differs from the stock's canonical name.

type OptionI18nRow = typeof schema.optionI18n.$inferInsert;

interface BulletPlan {
  kind: "feature" | "best_for";
  position: number;
  trait: string | null;
  texts: Partial<Record<Locale, string>>;
}

/** Vietnamese keeps today's slug (`toSlug` of the Vietnamese name); English is generated from the English name. */
function optionSlugs(source: ProductOption, product: ProductRecord, ctx: SeedContext): SlugsByLocale {
  let vi = ctx.src.toSlug(source.nameVi || source.name || "option");
  if (!KEBAB_SLUG.test(vi)) {
    ctx.notes.add("slug-invalid", `option ${source.nameVi} → ${vi}`);
    vi = slugify(vi);
  }
  const en = slugify(source.name || source.nameVi || "option");
  const slugs = claimSlugs(product.takenSegments, vi, en);
  if (slugs.vi !== vi) ctx.notes.add("option-slug-collision", `${product.key}: ${vi} → ${slugs.vi}`);
  if (slugs.en !== en) ctx.notes.add("option-slug-collision", `${product.key} (en): ${en} → ${slugs.en}`);
  return slugs;
}

function optionTranslations(source: ProductOption, material: MaterialRecord): { rows: Omit<OptionI18nRow, "optionId">[]; raw: Record<Locale, string | null>; shown: Record<Locale, string | null> } {
  const rows: Omit<OptionI18nRow, "optionId">[] = [];
  const raw = {} as Record<Locale, string | null>;
  const shown = {} as Record<Locale, string | null>;
  for (const locale of LOCALES) {
    const authored = localizedText(source, "name", "option", locale);
    const tagline = localizedText(source, "tagline", "option", locale);
    const name = isBlankText(authored) ? null : (authored as string).trim();
    const display = name ? formatMaterialDisplayName(authored as string, locale).trim() : null;
    raw[locale] = name;
    shown[locale] = display;
    const cardTitle = display && display !== material.names[locale] ? display : null;
    if (name || cardTitle || !isBlankText(tagline)) rows.push({ locale, name, cardTitle, tagline: orNull(tagline) });
  }
  return { rows, raw, shown };
}

function bulletPlans(source: ProductOption, product: ProductRecord, ctx: SeedContext, traitKeys: ReadonlySet<string>): BulletPlan[] {
  const plans: BulletPlan[] = [];
  for (const [kind, field] of [["feature", "description"], ["best_for", "bestFor"]] as const) {
    const lists = Object.fromEntries(LOCALES.map((locale) => [locale, localizedList(source, field, "option", locale) ?? []])) as Record<Locale, string[]>;
    const count = Math.max(...LOCALES.map((locale) => lists[locale].length));
    const label = `${product.key} ${source.nameVi} (${kind === "feature" ? "đặc điểm" : "phù hợp cho"})`;
    if (LOCALES.some((locale) => lists[locale].length !== lists.vi.length)) ctx.notes.add("bullet-count-differs-by-locale", `${label}: ${LOCALES.map((l) => `${l}=${lists[l].length}`).join(" ")}`);
    if (kind === "feature" && (source.descriptionTraits ?? []).length !== lists.vi.length) ctx.notes.add("traits-length-mismatch", label);
    for (let position = 0; position < count; position += 1) {
      const wanted = kind === "feature" ? (source.descriptionTraits?.[position] ?? null) : null;
      if (wanted && !traitKeys.has(wanted)) ctx.notes.add("unknown-trait", wanted);
      const texts: Partial<Record<Locale, string>> = {};
      for (const locale of LOCALES) if (!isBlankText(lists[locale][position])) texts[locale] = lists[locale][position];
      plans.push({ kind, position, trait: wanted && traitKeys.has(wanted) ? wanted : null, texts });
    }
  }
  return plans;
}

async function insertBullets(ctx: SeedContext, optionId: number, plans: BulletPlan[]): Promise<void> {
  if (plans.length === 0) return;
  const { tx } = ctx;
  const bullets = await tx
    .insert(schema.optionBullet)
    .values(plans.map((p) => ({ optionId, kind: p.kind, position: p.position, traitKey: p.trait })))
    .returning({ id: schema.optionBullet.id, kind: schema.optionBullet.kind, position: schema.optionBullet.position });
  const texts: (typeof schema.optionBulletI18n.$inferInsert)[] = [];
  for (const bullet of bullets) {
    const plan = plans.find((p) => p.kind === bullet.kind && p.position === bullet.position)!;
    for (const [locale, text] of Object.entries(plan.texts)) texts.push({ bulletId: bullet.id, locale, text });
  }
  if (texts.length > 0) await tx.insert(schema.optionBulletI18n).values(texts);
  ctx.stats.bullets += plans.length;
}

async function insertImages(ctx: SeedContext, optionId: number, source: ProductOption, media: MediaRegistry): Promise<void> {
  const variants = [["default", source.image, source.images], ["pure", source.pureImage, source.pureImages]] as const;
  for (const [variant, one, many] of variants) {
    const list = many?.length ? many : one ? [one] : [];
    for (const [position, path] of list.entries()) {
      const mediaId = media.idOf(path);
      if (mediaId) await ctx.tx.insert(schema.optionImage).values({ optionId, variant, position, mediaId });
    }
  }
}

export async function seedOptions(
  ctx: SeedContext,
  products: Map<string, ProductRecord>,
  materials: Map<string, MaterialRecord>,
  models: OptionModel[],
  traitKeys: ReadonlySet<string>,
  media: MediaRegistry,
): Promise<void> {
  const { tx, notes } = ctx;
  for (const model of models) {
    const product = products.get(model.productKey)!;
    const material = materials.get(model.materialKey)!;
    const { source } = model;
    const shapeRecord = model.shape ? (product.shapes.find((s) => s.source === model.shape) ?? null) : null;
    const slugs = optionSlugs(source, product, ctx);
    if ([source.unitVi, source.unitEn, source.unitZh, source.unitJa, source.unitKo].some((u) => !isBlankText(u))) notes.add("option-unit-ignored", `${product.key} ${source.nameVi}`);

    let icon = source.icon && source.icon !== material.icon ? source.icon : null;
    if (icon && !isIconName(icon)) {
      notes.add("icon-unknown", `${product.key} ${source.nameVi}: ${icon}`);
      icon = null;
    }
    const [row] = await tx
      .insert(schema.option)
      .values({
        productId: product.id,
        shapeId: shapeRecord?.id ?? null,
        materialId: material.id,
        position: model.index,
        icon,
        hideFoil: Boolean(source.hideFoilCheckbox),
        hideDoubleSided: Boolean(source.hideDoubleSidedCheckbox),
        basePrice: source.basePrice ?? null,
        doubleSidedPrice: source.doubleSidedPrice ?? null,
        foilPrice: source.foilPrice ?? null,
        foil2Price: source.foil2SidesPrice ?? null,
      })
      .returning({ id: schema.option.id, uid: schema.option.uid });
    await tx.insert(schema.productSegment).values(LOCALES.map((locale) => ({ productId: product.id, locale, slug: slugs[locale], optionId: row.id, isCanonical: true })));

    const translations = optionTranslations(source, material);
    await tx.insert(schema.optionI18n).values(translations.rows.map((r) => ({ ...r, optionId: row.id })));
    await insertBullets(ctx, row.id, bulletPlans(source, product, ctx, traitKeys));
    await insertImages(ctx, row.id, source, media);
    product.options.push({ ...model, id: row.id, uid: row.uid, slugs, rawName: translations.raw, shownName: translations.shown, shapeRecord } satisfies OptionRecord);
  }
}
