import * as schema from "@/lib/db/schema";
import { isIconName } from "@/lib/icons";
import type { MediaRegistry, SeedContext } from "../context";
import { LOCALES, TRANSLATED_LOCALES, localizedText, translated } from "../localized";
import { parsePrice } from "../parse";
import { fastPrintUnitKey } from "./foundations";

// Fast Print items (the "In nhanh lấy liền" page) and the products-page showcase gallery.

const PRICE_PLACEHOLDER = "{price}";
const SHOWCASE_ASPECTS = ["tall", "square", "wide"] as const;
type ShowcaseAspect = (typeof SHOWCASE_ASPECTS)[number];
const isShowcaseAspect = (value: string): value is ShowcaseAspect => (SHOWCASE_ASPECTS as readonly string[]).includes(value);

export async function seedFastPrint(ctx: SeedContext, media: MediaRegistry): Promise<void> {
  const { tx, src, notes } = ctx;
  for (const [position, item] of src.fastPrint.entries()) {
    if (!isIconName(item.icon)) throw new Error(`Fast Print item ${item.id} uses the icon "${item.icon}", which is not in lib/icons.ts`);
    const price = parsePrice(item.priceVi);
    const hours = item.tagVi.match(/(\d+)\s*h/)?.[1];
    const turnaroundHours = hours ? Number(hours) : null;
    if (turnaroundHours) {
      for (const locale of LOCALES) if (!String(localizedText(item, "tag", "suffixed", locale)).includes(String(turnaroundHours))) notes.add("fastprint-tag-hours-inconsistent", `${item.id} ${locale}`);
    }
    // The page shows "Chỉ từ 120.000đ/Hộp" / "120,000₫/箱〜": only the number and unit are data. The wording around
    // them is not stored; the report lists it so Phase 4 can move it into messages/.
    for (const locale of LOCALES) {
      const text = localizedText(item, "price", "suffixed", locale) ?? "";
      const match = text.match(/[\d.,]+\s*(?:đ|₫)\s*\/\s*[^\s〜]+/);
      if (match) notes.add("fastprint-price-wording", `${locale}: ${text.replace(match[0], PRICE_PLACEHOLDER)}`);
    }
    const [row] = await tx
      .insert(schema.fastPrintItem)
      .values({
        key: item.id,
        imageMediaId: media.idOf(item.image),
        icon: item.icon,
        turnaroundHours,
        fromPrice: price?.amount ?? null,
        unitKey: fastPrintUnitKey(item.priceVi),
        position,
      })
      .returning({ id: schema.fastPrintItem.id });
    // The tag is kept verbatim in every language (it duplicates the hours, but dropping it would change what visitors read).
    await tx.insert(schema.fastPrintItemI18n).values(
      LOCALES.map((locale) => ({
        itemId: row.id,
        locale,
        name: localizedText(item, "name", "suffixed", locale) ?? item.nameEn,
        tag: localizedText(item, "tag", "suffixed", locale) ?? null,
        description: localizedText(item, "desc", "suffixed", locale) ?? null,
      })),
    );
  }
}

export async function seedShowcase(ctx: SeedContext, media: MediaRegistry): Promise<void> {
  const { tx, src } = ctx;
  for (const [position, item] of src.showcase.entries()) {
    const mediaId = media.idOf(item.src);
    if (!mediaId) throw new Error(`Showcase item ${item.seed} points at ${item.src}, which is not a registered file`);
    if (!isShowcaseAspect(item.aspect)) throw new Error(`Showcase item ${item.seed} has the unknown aspect "${item.aspect}"`);
    const [row] = await tx.insert(schema.showcaseItem).values({ key: item.seed, mediaId, aspect: item.aspect, position }).returning({ id: schema.showcaseItem.id });
    await tx.insert(schema.showcaseItemI18n).values([
      { itemId: row.id, locale: "vi", label: item.label },
      { itemId: row.id, locale: "en", label: item.labelEn },
      ...TRANSLATED_LOCALES.flatMap((locale) => {
        const label = translated(src.translations.SHOWCASE_LABELS, item.seed, locale);
        return label ? [{ itemId: row.id, locale, label }] : [];
      }),
    ]);
  }
}
