import type { LocaleCode } from "../schemas";
import { sizesFor, specsFor } from "./selectors";
import { pickText } from "./text";
import type { Catalog, OptionView, ProductView, SizeView } from "./types";
import { anchorOf, type Anchor } from "./urls";

// Everything one material flashcard draws, for one language: picked texts, trait icon names, the standard sizes, and the technique /
// material / finishing lists of its product (or shape). Pure; the flashcard component only lays it out.

export interface CardSize {
  /** The tier; the card names it in the page's language (`materialCard.tier.*`) and puts `note` after it in brackets. */
  id: SizeView["tier"];
  /** The editor's note after the tier name, in the page's language; null when the language has none. */
  note: string | null;
  dims: string;
}

export interface CardFeature {
  /** A trait's icon name; null for a bullet without one. */
  icon: string | null;
  text: string;
}

export interface CardView {
  uid: string;
  anchor: Anchor;
  /** A name for `lib/icons.ts`. */
  icon: string | null;
  /** The card's heading. */
  heading: string;
  tagline: string;
  features: CardFeature[];
  bestFor: string[];
  /** The photos of the card: the plain-stock ones when it has them, else the others. */
  images: string[];
  sizes: CardSize[];
  techniques: string[];
  materials: string[];
  finishing: string[];
  /** What the consultation message calls the product, e.g. «Tờ rơi - Giấy loại C». */
  consultName: string;
}

const centimetres = (millimetres: number): string => (millimetres / 10).toString();

export function sizeOf(size: SizeView, locale: LocaleCode): CardSize {
  const dims = size.text ?? `${centimetres(size.w ?? 0)} x ${centimetres(size.h ?? 0)}${size.d ? ` x ${centimetres(size.d)}` : ""} cm`;
  return { id: size.tier, note: size.note[locale] || null, dims };
}

export function cardOf(catalog: Catalog, locale: LocaleCode, product: ProductView, option: OptionView, shape: string | null, consultName: string): CardView {
  const list = (kind: "technique" | "finishing" | "material_hint") => specsFor(product, shape, kind).map((spec) => pickText(locale, spec.label)).filter((text) => text !== "");
  return {
    uid: option.uid,
    anchor: anchorOf(option.slugs, locale),
    icon: option.icon,
    heading: pickText(locale, option.title) || pickText(locale, option.name),
    tagline: pickText(locale, option.tagline),
    features: option.features.map((feature) => ({ icon: feature.trait ? (catalog.traits[feature.trait]?.icon ?? null) : null, text: pickText(locale, feature.text) })),
    bestFor: option.bestFor.map((line) => pickText(locale, line)),
    images: option.pureImages.length > 0 ? option.pureImages : option.images,
    sizes: sizesFor(product, shape).map((size) => sizeOf(size, locale)),
    techniques: list("technique"),
    materials: list("material_hint"),
    finishing: list("finishing"),
    consultName,
  };
}
