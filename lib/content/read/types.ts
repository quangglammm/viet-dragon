import type { LocaleCode } from "../schemas";
import type { Localized } from "./text";

// The public site's view of the content: plain JSON (it is cached and handed to client components), language-independent (one
// object holds every language; the component picks with `pickText`), and already resolved — a menu item carries the name and image
// it shows, an option the heading its card draws. Built from the documents by pure functions (catalog.ts, menus.ts).

export type Slugs<Alias = string> = Record<LocaleCode, { slug: string; aliases: Alias[] }>;

export interface Seo {
  title: Localized;
  description: Localized;
}

export interface CategoryView {
  id: string;
  slugs: Slugs;
  icon: string;
  /** Public path (`/images/category/a.webp`). */
  cover: string | null;
  ogImage: string | null;
  position: number;
  name: Localized;
  description: Localized;
  seo: Seo;
}

export interface ShapeView {
  uid: string;
  slugs: Slugs;
  position: number;
  image: string | null;
  ogImage: string | null;
  name: Localized;
  description: Localized;
  badge: Localized;
  seo: Seo;
}

export interface FeatureView {
  /** Trait key: the icon and glossary entry of this bullet; null when the bullet has none. */
  trait: string | null;
  text: Localized;
}

export interface OptionView {
  uid: string;
  slugs: Slugs;
  /** The shape this option is only offered for; null = offered by the whole product. */
  shape: string | null;
  /** Material (stock) key. */
  material: string;
  position: number;
  /** The option's own icon, else its material's; a name for `lib/icons.ts`. */
  icon: string | null;
  hideFoil: boolean;
  hideDoubleSided: boolean;
  prices: { base: number | null; doubleSided: number | null; foil: number | null; foil2: number | null };
  ogImage: string | null;
  /** The offer's own full name: page title, breadcrumb, alt text, lead message. */
  name: Localized;
  /** The heading of the card: the card title override, else the stock's name (only for a language the option is authored in). */
  title: Localized;
  tagline: Localized;
  seo: Seo;
  features: FeatureView[];
  bestFor: Localized[];
  images: string[];
  pureImages: string[];
}

export interface SizeView {
  /** Shape uid; null = the whole product. A shape's rows replace the product's for that shape. */
  shape: string | null;
  tier: "large" | "medium" | "small";
  w: number | null;
  h: number | null;
  d: number | null;
  /** A size that is not a measure ("Size L - XL"); exclusive with w/h. */
  text: string | null;
  /** The note after the tier name, per language. */
  note: Localized;
}

export interface SpecView {
  shape: string | null;
  kind: "technique" | "finishing" | "material_hint";
  /** Spec item key. */
  item: string;
  position: number;
  label: Localized;
}

export interface ProductView {
  uid: string;
  category: string;
  slugs: Slugs<{ category: string; slug: string }>;
  position: number;
  cover: string | null;
  ogImage: string | null;
  title: Localized;
  description: Localized;
  seo: Seo;
  shapes: ShapeView[];
  options: OptionView[];
  sizes: SizeView[];
  specs: SpecView[];
}

export interface TraitView {
  key: string;
  /** A name for `lib/icons.ts`. */
  icon: string;
  label: Localized;
  description: Localized;
}

export interface MaterialView {
  key: string;
  icon: string | null;
  name: Localized;
}

export interface Catalog {
  categories: CategoryView[];
  /** Published products only, in category then position order (an archived product is not routable, listed or in a menu). */
  products: ProductView[];
  traits: Record<string, TraitView>;
  materials: Record<string, MaterialView>;
}

export type MenuTargetView = { shape: string } | { option: string };

export interface MenuItemView {
  target: MenuTargetView;
  /** What the link points at: a shape (an anchor on the product page) or a material (an option page of its own). */
  kind: "shape" | "material";
  label: Localized;
  image: string | null;
  isFast: boolean;
}

export interface MenuGroupView {
  /** Product uid. */
  product: string;
  title: Localized;
  description: Localized;
  image: string | null;
  items: MenuItemView[];
}

export interface MenuView {
  /** Category id. */
  category: string;
  columns: { column: number; groups: MenuGroupView[] }[];
}
