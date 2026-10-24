import type { FastPrintItemDocument, LocaleCode, ShowcaseItemDocument, UnitDocument } from "../schemas";
import { publicPath } from "./catalog";
import { localize, pickText, type Localized } from "./text";

// Fast Print (the «in nhanh lấy liền» page) and the showcase gallery of /products: documents → the public site's view, and the
// language-resolved cards the pages draw. Pure, like catalog.ts.

export interface FastPrintItemView {
  uid: string;
  key: string;
  image: string | null;
  /** A name for `lib/icons.ts`. */
  icon: string;
  /** Whole VND; with `unit` the page quotes «from <amount>/<unit>». */
  fromPrice: number | null;
  /** Unit key (see `FastPrint.units`). */
  unit: string | null;
  name: Localized;
  tag: Localized;
  description: Localized;
}

export interface FastPrint {
  /** Published items in position order. */
  items: FastPrintItemView[];
  /** Unit key → its name per language («Hộp», «Box»). */
  units: Record<string, Localized>;
}

export interface FastPrintInput {
  items: readonly FastPrintItemDocument[];
  units: readonly UnitDocument[];
}

export function buildFastPrint(input: FastPrintInput): FastPrint {
  return {
    items: input.items
      .filter((item) => item.status === "published")
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        uid: item.uid,
        key: item.key,
        image: publicPath(item.image),
        icon: item.icon,
        fromPrice: item.fromPrice,
        unit: item.unit,
        name: localize(item.i18n, (row) => row.name),
        tag: localize(item.i18n, (row) => row.tag),
        description: localize(item.i18n, (row) => row.description),
      })),
    units: Object.fromEntries(input.units.map((unit) => [unit.key, localize(unit.i18n, (row) => row.label)])),
  };
}

export interface FastPrintCard {
  uid: string;
  key: string;
  name: string;
  tag: string;
  description: string;
  image: string | null;
  icon: string;
  /** The two numbers of the price line; the page's copy supplies the words around them. Null when the item has no price or no unit. */
  price: { amount: number; unit: string } | null;
}

export function fastPrintCardsOf(fastPrint: FastPrint, locale: LocaleCode): FastPrintCard[] {
  return fastPrint.items.map((item) => {
    const unit = item.unit === null ? "" : pickText(locale, fastPrint.units[item.unit]);
    return {
      uid: item.uid,
      key: item.key,
      name: pickText(locale, item.name),
      tag: pickText(locale, item.tag),
      description: pickText(locale, item.description),
      image: item.image,
      icon: item.icon,
      price: item.fromPrice !== null && unit !== "" ? { amount: item.fromPrice, unit } : null,
    };
  });
}

// ───────────── the showcase ─────────────

export type ShowcaseAspect = ShowcaseItemDocument["aspect"];

export interface ShowcaseItemView {
  uid: string;
  key: string;
  src: string;
  aspect: ShowcaseAspect;
  label: Localized;
}

export function buildShowcase(items: readonly ShowcaseItemDocument[]): ShowcaseItemView[] {
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({ uid: item.uid, key: item.key, src: `/${item.media}`, aspect: item.aspect, label: localize(item.i18n, (row) => row.label) }));
}

export interface ShowcaseCard {
  uid: string;
  src: string;
  label: string;
  aspect: ShowcaseAspect;
}

export function showcaseCardsOf(items: readonly ShowcaseItemView[], locale: LocaleCode): ShowcaseCard[] {
  return items.map((item) => ({ uid: item.uid, src: item.src, label: pickText(locale, item.label), aspect: item.aspect }));
}

/** The editorial layout of the desktop gallery: one tall picture on the left, two squares stacked on the right, two wide ones below. */
export interface ShowcaseSlots {
  tall: ShowcaseCard | null;
  squares: ShowcaseCard[];
  wides: ShowcaseCard[];
}

/** Each slot takes the first picture(s) of its aspect, in position order; a picture with no slot left shows on the mobile grid only. */
export function showcaseSlotsOf(cards: readonly ShowcaseCard[]): ShowcaseSlots {
  const ofAspect = (aspect: ShowcaseAspect) => cards.filter((card) => card.aspect === aspect);
  return { tall: ofAspect("tall")[0] ?? null, squares: ofAspect("square").slice(0, 2), wides: ofAspect("wide").slice(0, 2) };
}
